import React, { useState, useEffect, useRef } from 'react';
import { useUnreadMessage } from '../context/UnreadMessageContext';
import ChatBody from '../components/Chat/ChatBody';
import ChatFooter from '../components/Chat/ChatFooter';
import socketIO from 'socket.io-client';
import { notification } from 'antd';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';
import { useSocket } from '../context/SocketProvider';
import ghost from '../assets/images/android_512x512.png';


const Chat = () => {

    const { currentUser, onlineStatus, socket, updateLastLoggedIn } = useSocket();
    const { getUnreadMessages, incrementNotifications, markAsRead, setLastVisited, unreadMessages } = useUnreadMessage();
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
    const [setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true); // To differentiate between initial load and old messages loading
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

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

    const fetchMessages = async (reset = false, page = 0, privateChatId = null) => {
        if (currentUser && hasMoreMessages) {
            try {
                const headers = { 'Authorization': authHeader() };
                
                // Set the query parameters: skip, limit, and optionally privateChatId
                let params = {
                    skip: page * 25, // Pagination: Skip the appropriate number of messages
                    limit: 500,       // Limit: Fetch 25 messages per request
                };
                if (privateChatId) {
                    params['private_chat_id'] = privateChatId; // Add privateChatId to the request if available
                }
    
                // Make the GET request to the backend
                const response = await axios.get('/api/chat/get-messages', {
                    params: params,
                    headers: headers,
                });
    
                // Reverse the message order (assuming the API sends the newest messages first)
                let fetchedMessages = response.data.reverse();
    
                // Append or reset the message state based on the reset flag
                setMessages(prevMessages => reset ? fetchedMessages : [...fetchedMessages, ...prevMessages]);
    
                // If fewer than 25 messages are fetched, set hasMoreMessages to false
                if (fetchedMessages.length < 25) {
                    setHasMoreMessages(false);
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
        //fetchMessages(true);
        fetchTeamMembers();

        const handleMessageResponse = (data) => {
            console.log('Message received:', data);
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages => [...prevMessages, data]);
                const chatId = privateChatId ? privateChatId : 'Team';

                // Get the current username based on currentTab CHECK THE CODE IMPORTANT
                const currentUserChat = teamMembers[parseInt(currentTab) - 2]?.username;
                let chatUser = "";
                console.log(currentUserChat);
                console.log(chatId);
                if (teamMembers[parseInt(currentTab) - 2]) {
                    chatUser = teamMembers[parseInt(currentTab) - 2].username;
                } else {
                    chatUser = undefined;
                }


                // Check if the chatId matches the current tab's username or if current tab is 0 and chatId is "Team"
                if (chatUser === currentUserChat) {
                    markAsRead(chatId);
                    chatUser ? updateLastLoggedIn(chatUser) : updateLastLoggedIn("Team");
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

    const handleTabChange = async (key) => {
        setLoading(true);
        console.log('Current Tab:', currentTab);
        console.log('Selected Tab:', key);
        let newPrivateChatId = null;
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
            newPrivateChatId = getPrivateChatId(currentUser.username, memberUsername);
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

        setMessagePage(0);
        setHasMoreMessages(true);
        //setMessagePage(0);
        //setHasMoreMessages(true);
        console.log('Fetching messages...');
        await fetchMessages(true, 0, newPrivateChatId);
        console.log('Messages fetched');
        setLoading(false);
    };

    /*const handleScroll = () => {
        const chatContainer = chatContainerRef.current;
        if (!chatContainer || loading || !hasMoreMessages) return;

        // If the user scrolls to the top of the chat, fetch older messages
        if (chatContainer.scrollTop === 0) {
            const currentHeight = chatContainer.scrollHeight;

            setMessagePage(prevPage => {
                const newPage = prevPage + 1; // Increment the page
                fetchMessages(false, newPage, privateChatId); // Fetch more messages using the updated page

                // After fetching, adjust scroll position to maintain user's view position
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight - currentHeight;
                }, 100); // Small delay to allow the new messages to load

                return newPage; // Update the state with the new page
            });
        }
    };*/

    useEffect(() => {
        fetchMessages(true); // Fetch initial messages on load
    }, []);

    // Scroll to bottom on new message or initial load
    /*useEffect(() => {
        if (initialLoad) {
            if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            setInitialLoad(false);
        }
    }, [messages]);*/

    useEffect(() => {
        // Scroll to bottom of chat container on new messages
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const getPrivateChatId = (user1, user2) => [user1, user2].sort().join('-');

    return (
        <div className="mx-auto flex flex-col" style={{ height: `100%` }}>
            <ChatBody
                id="chat-body"
                currentTab={currentTab}
                setCurrentTab={handleTabChange}
                chatContainerRef={chatContainerRef}
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
                loading={loading}// Pass fetchMessages to ChatBody to trigger manual fetching
                hasMoreMessages={hasMoreMessages} // Track if more messages can be loaded // Control pagination
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
