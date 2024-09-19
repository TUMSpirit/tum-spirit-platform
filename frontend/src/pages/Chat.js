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
    const [setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loading, setLoading] = useState(false);

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
        if (!currentUser || !hasMoreMessages || loading) return; // Prevent fetching if already loading or no more messages
        
        setLoading(true);
        try {
            const headers = { 'Authorization': authHeader() };
            if (privateChatId) {
                headers['Private-Chat-Id'] = privateChatId;
            }

            const response = await axios.get(`/api/chat/get-messages`, {
                params: {
                    skip: messagePage * 75, // Skip messages based on the current page
                    limit: 75, // Limit the number of messages per request
                },
                headers: headers,
            });

            const fetchedMessages = response.data;
            
            // If reset, replace the messages, otherwise append older messages at the beginning
            setMessages(prevMessages => reset ? fetchedMessages : [...fetchedMessages, ...prevMessages]);
            
            // If no more messages, set hasMoreMessages to false
            if (fetchedMessages.length === 0) {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false); // Stop loading after fetching messages
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
                const currentUserChat = teamMembers[parseInt(currentTab) - 2]?.username;
                let chatUser = "";
                console.log(currentUserChat);
                console.log(chatId);
                if(teamMembers[parseInt(currentTab) - 2]){
                     chatUser = teamMembers[parseInt(currentTab) - 2].username;
                }else{
                     chatUser = undefined;
                }
        
        
               // Check if the chatId matches the current tab's username or if current tab is 0 and chatId is "Team"
               if (chatUser===currentUserChat) {
                  markAsRead(chatId);
                  chatUser? updateLastLoggedIn(chatUser):updateLastLoggedIn("Team");
                }

                /*if (data.senderId !== currentUser.username) {
                    const title = "New Message!";
                    const options = {
                      body: data.senderId + " sent a message in the chat",
                      image_url: ghost,
                      image: ghost,
                      icon: ghost,
                      icon_url: ghost,
                      vibrate: [300, 100, 400]
                    };
                    navigator.serviceWorker.ready.then(async function (serviceWorker) {
                      await serviceWorker.showNotification(title, options);
                    });
                  }*/
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
        fetchMessages(true);
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
                loading={loading}
                fetchMessages={fetchMessages} // Pass fetchMessages to ChatBody to trigger manual fetching
                hasMoreMessages={hasMoreMessages} // Track if more messages can be loaded
                setMessagePage={setMessagePage} // Control pagination
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
