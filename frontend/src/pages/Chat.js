import React, { useState, useEffect, useRef } from 'react';
import { useUnreadMessage } from '../context/UnreadMessageContext'; // Import the custom hook
//import { useWebSocket } from '../context/WebSocketContext';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from 'socket.io-client';
import { Typography, notification } from 'antd';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';

const { Title } = Typography;
const socket = socketIO.connect('http://localhost:4000', { autoConnect: false });

const Chat = () => {
    const { unreadCount, resetUnreadCount, incrementUnreadCount } = useUnreadMessage();
    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [editingMessage, setEditingMessage] = useState(null);
    const lastMessageRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const HEADER_HEIGHT_PX = 256;
    const authHeader = useAuthHeader();
    const [currentUser, setCurrentUser] = useState(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');
    const [messagePage, setMessagePage] = useState(1); // For pagination
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    // Fetch current user data

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/me', {
                headers: { 'Authorization': authHeader() },
            });
            const data = await response.json();
            setCurrentUser(data);
            socket.auth = { teamId: data.team_id };
            socket.connect();
            socket.emit('joinTeam', data.team_id);
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    // Fetch team members data (cached)
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

    // Fetch messages with pagination
    const fetchMessages = async (reset = false) => {
        if (currentUser && hasMoreMessages) {
            try {
                const headers = { 'Authorization': authHeader() };
                if (privateChatId) {
                    headers['Private-Chat-Id'] = privateChatId;
                }
                
                const response = await fetch(`/api/chat/get-messages?page=${messagePage}`, {
                    method: 'GET',
                    headers: headers,
                });

                const data = await response.json();
                setMessages(prevMessages => reset ? data : [...prevMessages, ...data]);
                if (data.length === 0) {
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
        fetchMessages(true); // Fetch initial messages
        fetchTeamMembers();
        
        const handleMessageResponse = (data) => {
            console.log('Message received:', data); // Debugging

            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages => [...prevMessages, data]);
                setAutoScroll(true);

                // Increment unread count for the current tab if it's not currently active
                incrementUnreadCount();

                // Show notification for new messages
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

        socket.on('messageResponse', handleMessageResponse);
        socket.on('messageUpdated', handleMessageUpdated);
        socket.on('emojiReactionRemoved', handleEmojiReactionRemoved);
        socket.on('emojiReactionUpdated', handleEmojiReactionUpdated);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('messagesUpdated', handleMessagesUpdated);
        socket.on('typing', handleTyping);
        socket.on('stop typing', handleStopTyping);

        return () => {
            socket.off('messageResponse', handleMessageResponse);
            socket.off('messageUpdated', handleMessageUpdated);
            socket.off('emojiReactionRemoved', handleEmojiReactionRemoved);
            socket.off('emojiReactionUpdated', handleEmojiReactionUpdated);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('messagesUpdated', handleMessagesUpdated);
            socket.off('typing', handleTyping);
            socket.off('stop typing', handleStopTyping);
        };
    }, [currentUser, messagePage, privateChatId, currentTab]);

    useEffect(() => {
        const handleNewMessage = () => {
            incrementUnreadCount();
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, incrementUnreadCount]);

    // Handle tab change
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
        setMessagePage(1);  // Reset the page to 1 when changing tabs
        setHasMoreMessages(true);  // Reset the hasMoreMessages flag
        fetchMessages(true);  // Fetch messages for the new tab

        // Reset unread count when tab is changed
        resetUnreadCount(key);
    };

    const getPrivateChatId = (user1, user2) => [user1, user2].sort().join('-');

    return (
        <div className="mx-auto flex flex-col" style={{ height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}>
            {/* Your sidebar component should be placed here */}
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
