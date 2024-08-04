import React, { useState, useEffect, useRef } from 'react';
import { useUnreadMessage } from '../context/UnreadMessageContext';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from 'socket.io-client';
import { Typography, notification } from 'antd';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';

const { Title } = Typography;
const socket = socketIO.connect('http://localhost:4000');

const Chat = () => {
    const { unreadMessages, setUnreadMessages, incrementNotifications } = useUnreadMessage();
    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [editingMessage, setEditingMessage] = useState(null);
    const lastMessageRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const HEADER_HEIGHT_PX = 190;
    const authHeader = useAuthHeader();
    const [currentUser, setCurrentUser] = useState(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');
    const [messagePage, setMessagePage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [onlineStatus, setOnlineStatus] = useState({}); // New state for online status

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('/api/me', {
                headers: {
                    "Authorization": authHeader()
                }
            });
            setCurrentUser(response.data);
            socket.auth = { teamId: response.data.team_id };
            socket.connect();
            socket.emit('joinTeam', response.data.team_id);
            socket.emit('userOnline', response.data.username); // Notify server that user is online
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const fetchTeamMembers = async () => {
        if (currentUser && teamMembers.length === 0) {
            try {
                const response = await axios.get('/api/get-team-members', {
                    headers: { 'Authorization': authHeader() },
                });
                const members = response.data;
                const currentUserWithColor = members.find(member => member.username === currentUser.username);
                if (currentUserWithColor) {
                    setCurrentUserAvatarColor(currentUserWithColor.avatar_color);
                }
                const filteredMembers = members.filter(member => member.username !== currentUser.username);
                setTeamMembers(filteredMembers);
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            }
        }
    };

    const fetchMessages = async (reset = false) => {
        if (currentUser && hasMoreMessages) {
            try {
                const headers = { 'Authorization': authHeader() };
                if (privateChatId) {
                    headers['Private-Chat-Id'] = privateChatId;
                }
                const response = await axios.get(`/api/chat/get-messages?page=${messagePage}`, {
                    method: 'GET',
                    headers: headers,
                });

                setMessages(prevMessages => reset ? response.data : [...prevMessages, ...response.data]);
                if (response.data.length === 0) {
                    setHasMoreMessages(false);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        fetchMessages(true);
        fetchTeamMembers();

        const handleMessageResponse = (data) => {
            console.log('Message received:', data);
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages => [...prevMessages, data]);
                setAutoScroll(true);
                incrementNotifications();
                notification.info({
                    message: 'New Message',
                    description: `New message in ${data.teamId || 'private chat'}.`,
                    placement: 'topRight',
                });
            }
        };

        const handleMessageUpdated = (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        };

        const handleEmojiReactionRemoved = (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        };

        const handleEmojiReactionUpdated = (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        };

        const handleMessagesUpdated = (updatedMessages) => {
            const filteredMessages = updatedMessages.filter(msg => msg.teamId === currentUser.team_id || (msg.privateChatId && msg.privateChatId.includes(currentUser.username)));
            setMessages(filteredMessages);
        };

        const handleTyping = (data) => {
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setTypingUser(data);
            }
        };

        const handleStopTyping = (data) => {
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setTypingUser(null);
            }
        };

        const handleUpdateUserStatus = ({ userId, status }) => {
            setOnlineStatus(prevStatus => ({ ...prevStatus, [userId]: status }));
        };

        socket.on('messageResponse', handleMessageResponse);
        socket.on('messageUpdated', handleMessageUpdated);
        socket.on('emojiReactionRemoved', handleEmojiReactionRemoved);
        socket.on('emojiReactionUpdated', handleEmojiReactionUpdated);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('messagesUpdated', handleMessagesUpdated);
        socket.on('typing', handleTyping);
        socket.on('stop typing', handleStopTyping);
        //socket.on('updateUserStatus', handleUpdateUserStatus); // Listen for status updates

        return () => {
            socket.off('messageResponse', handleMessageResponse);
            socket.off('messageUpdated', handleMessageUpdated);
            socket.off('emojiReactionRemoved', handleEmojiReactionRemoved);
            socket.off('emojiReactionUpdated', handleEmojiReactionUpdated);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('messagesUpdated', handleMessagesUpdated);
            socket.off('typing', handleTyping);
            socket.off('stop typing', handleStopTyping);
            //socket.off('updateUserStatus', handleUpdateUserStatus); // Cleanup status updates
        };
    }, [currentUser, messagePage, privateChatId, currentTab]);


    useEffect(() => {
        socket.on('currentOnlineUsers', (users) => {
            const onlineStatus = {};
            users.forEach(user => {
                onlineStatus[user.userId] = user.status;
            });
            setOnlineStatus(onlineStatus);
        });
        socket.on('updateUserStatus', ({ userId, status }) => {
            setOnlineStatus(prevState => ({
                ...prevState,
                [userId]: status
            }));
        });
    
        return () => {
            socket.off('currentOnlineUsers');
            socket.off('updateUserStatus');
        };
    }, [socket]);
    
    useEffect(() => {
        const handleNewMessage = () => {
            incrementNotifications();
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, incrementNotifications]);

    const handleTabChange = async (key) => {
        setCurrentTab(key);
        if (key !== '1') {
            const memberUsername = teamMembers[parseInt(key) - 2].username;
            const newPrivateChatId = getPrivateChatId(currentUser.username, memberUsername);
            setPrivateChatId(newPrivateChatId);
            socket.emit('joinPrivateChat', newPrivateChatId);
        } else {
            setPrivateChatId(null);
            socket.emit('joinTeam', currentUser.team_id);
        }
        setMessagePage(1);
        setHasMoreMessages(true);
        fetchMessages(true);
        setUnreadMessages(0);
    };

    const getPrivateChatId = (user1, user2) => [user1, user2].sort().join('-');

    return (
        <div className="mx-auto flex flex-col" style={{ height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}>
            <ChatBody
                id="chat-body"
                currentTab={currentTab}
                setCurrentTab={handleTabChange}
                messages={messages}
                onRemoveReaction={setMessages}
                lastMessageRef={lastMessageRef}
                setEditingMessage={setEditingMessage}
                onDeleteMessage={(messageId) => setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId))}
                socket={socket}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                setMessage={setMessage}
                typingUser={typingUser}
                currentUser={currentUser}
                teamMembers={teamMembers}
                privateChatId={privateChatId}
                currentUserAvatarColor={currentUserAvatarColor}
                onlineStatus={onlineStatus} // Pass online status to ChatBody
            />
            <ChatFooter
                socket={socket}
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                message={message}
                setMessage={setMessage}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                isTyping={isTyping}
                setIsTyping={setIsTyping}
                currentUser={currentUser}
                currentTab={currentTab}
                teamMembers={teamMembers}
                privateChatId={privateChatId}
            />
        </div>
    );
};

export default Chat;
