import React, { useState, useEffect, useRef } from 'react';
import { useUnreadMessage } from '../context/UnreadMessageContext';
import ChatBody from '../components/Chat/ChatBody';
import ChatFooter from '../components/Chat/ChatFooter';
import socketIO from 'socket.io-client';
import { notification } from 'antd';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';
import { useSocket } from '../context/SocketProvider';

const Chat = () => {

    const {currentUser, onlineStatus, socket, updateLastLoggedIn} = useSocket(); 

    const { getUnreadMessages, incrementNotifications, markAsRead, setLastVisited, unreadMessages} = useUnreadMessage();
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
    //const [currentUser, setCurrentUser] = useState(null);
    const [setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');
    const [messagePage, setMessagePage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    //const [onlineStatus, setOnlineStatus] = useState({}); // New state for online status

    /*const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('/api/me', {
                headers: {
                    "Authorization": authHeader()
                }
            });
            const {team_id, username} = response.data;
            //setCurrentUser(response.data);
            socket.auth = { teamId: team_id };
            socket.connect();
            socket.emit('joinTeam', team_id);
            socket.emit('userOnline', {team_id, username}); // Notify server that user is online
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };*/

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

            console.log('Fetching messages with headers:', headers); // Debugging headers

            const response = await axios.get(`/api/chat/get-messages?page=${messagePage}`, {
                headers: {
                    ...headers,
                    'Cache-Control': 'no-cache', // Disable caching
                },
            });

            console.log('Fetched messages response:', response.data); // Debugging response data

            setMessages(prevMessages => reset ? response.data : [...prevMessages, ...response.data]);

            if (response.data.length === 0) {
                setHasMoreMessages(false);
                console.log('No more messages to load.');
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            }
        }
    };



    const markReadWithTeam = () => {
        markAsRead("Team");
    }

    useEffect(() => {
        setTimeout(markReadWithTeam, 1800);
        updateLastLoggedIn("Team");
       // setUnreadMessages(currentTab);
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        fetchMessages(true);
        fetchTeamMembers();

        const handleMessageResponse = (data) => {
            console.log('Message received:', data);
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages => [...prevMessages, data]);
                const chatId = privateChatId ? privateChatId : 'Team';

                // Get the current username based on currentTab CHECK THE CODE IMPORTANT
                const currentUser = teamMembers[parseInt(currentTab) - 2]?.username;
                let chatUser = "";
                console.log(currentUser);
                console.log(chatId);
                if(teamMembers[parseInt(currentTab) - 2]){
                     chatUser = teamMembers[parseInt(currentTab) - 2].username;
                }else{
                     chatUser = undefined;
                }
        
        
               // Check if the chatId matches the current tab's username or if current tab is 0 and chatId is "Team"
               if (chatUser===currentUser) {
                  markAsRead(chatId);
                  chatUser? updateLastLoggedIn(chatUser):updateLastLoggedIn("Team");
                }
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
            if (data.privateChatId && data.privateChatId === privateChatId) {
                setTypingUser(data);
              } else if (data.teamId && data.teamId === currentUser.team_id && !privateChatId) {
                setTypingUser(data);
              }
        };

        const handleStopTyping = (data) => {
            if ((data.privateChatId && data.privateChatId === privateChatId) || 
            (data.teamId && data.teamId === currentUser.team_id && !privateChatId)) {
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


  /*  useEffect(() => {
        socket.on('updateUserStatus', ({ data }) => {
            for (const username in data) {
                data[username] = 'online'
            }
            setOnlineStatus(data);
        });
    
        return () => {
            // socket.off('currentOnlineUsers');
            socket.off('updateUserStatus');
        };
    }, [socket]);
    
    useEffect(() => {
        const handleNewMessage = () => {
            console.log("trigger increment");
            incrementNotifications('Team');
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, incrementNotifications]);*/

     const handleTabChange = async (key) => {
        console.log('Current Tab:', currentTab);
        console.log('Selected Tab:', key);
    
        const currTab = currentTab;
    
        if (key !== '1') {
            console.log('Switching to Private Chat:', teamMembers[parseInt(key) - 2].username);
            await updateLastLoggedIn(teamMembers[parseInt(key) - 2].username);
        } else {
            console.log('Switching to Team Chat');
            await updateLastLoggedIn("Team");
        }
    
        setCurrentTab(key);
    
        if (key !== '1') {
            const memberUsername = teamMembers[parseInt(key) - 2].username;
            const newPrivateChatId = getPrivateChatId(currentUser.username, memberUsername);
            console.log('New Private Chat ID:', newPrivateChatId);
            markAsRead(newPrivateChatId);
            setPrivateChatId(newPrivateChatId);
            socket.emit('joinPrivateChat', newPrivateChatId);
        } else {
            console.log('Joining Team Chat');
            setPrivateChatId(null);
            markAsRead("Team");
            socket.emit('joinTeam', currentUser.team_id);
        }
    
        setMessagePage(1);
        setHasMoreMessages(true);
        console.log('Fetching messages...');
        await fetchMessages(true);
        console.log('Messages fetched');
    };


    const getPrivateChatId = (user1, user2) => [user1, user2].sort().join('-');

    return (
        <div className="mx-auto flex flex-col" style={{ height: `100%` }}>
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
                onlineStatus={onlineStatus}
                getUnreadMessages={getUnreadMessages}// Pass online status to ChatBody
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
