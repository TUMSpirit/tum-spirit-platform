import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from "socket.io-client";
import { Typography } from "antd";
import { useAuthHeader } from 'react-auth-kit';
import axios from "axios";

const { Title } = Typography;
const socket = socketIO.connect("http://localhost:4000", { autoConnect: false });

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [editingMessage, setEditingMessage] = useState(null);
    const lastMessageRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const HEADER_HEIGHT_PX = 256;
    const authHeader = useAuthHeader();
    const [currentUser, setCurrentUser] = useState(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const [privateChatId, setPrivateChatId] = useState(null);
    const [currentUserAvatarColor, setCurrentUserAvatarColor] = useState('#FFFFFF');

    const fetchCurrentUser = async () => {
        if (!currentUser) {
            try {
                const response = await fetch('http://localhost:8000/api/me', {
                    headers: {
                        'Authorization': authHeader(),
                    },
                });
                const data = await response.json();
                setCurrentUser(data);
                socket.auth = { teamId: data.team_id };
                socket.connect();
                socket.emit('joinTeam', data.team_id);
            } catch (error) {
                console.error('Failed to fetch current user:', error);
            }
        }
    };

    const fetchTeamMembers = async () => {
        if (currentUser) {
            try {
                const response = await axios.get(`http://localhost:8000/api/get-team-members`, {
                    headers: {
                        "Authorization": authHeader(),
                    },
                });
                const members = response.data;
                const currentUserWithColor = members.find(member => member.username === currentUser.username);
                if (currentUserWithColor) {
                    setCurrentUserAvatarColor(currentUserWithColor.avatar_color);
                }
                const filteredMembers = members.filter(member => member.username !== currentUser.username);
                setTeamMembers(filteredMembers);
            } catch (error) {
                console.error("Failed to fetch team members:", error);
            }
        }
    };

    const fetchMessages = async () => {
        if (currentUser) {
            try {
                const headers = {
                    "Authorization": authHeader(),
                };
                if (privateChatId) {
                    headers["Private-Chat-Id"] = privateChatId;
                } else {
                    delete headers["Private-Chat-Id"];
                }
                const response = await fetch(`http://localhost:8000/api/chat/get-messages`, {
                    method: 'GET',
                    headers: headers,
                });
                const data = await response.json();
                setMessages(data || []);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchTeamMembers();
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchMessages();
        }
    }, [currentUser, privateChatId]);

    useEffect(() => {
        if (!currentUser) return;

        socket.on("messageResponse", (data) => {
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages => [...prevMessages, data]);
                setAutoScroll(true);
            }
        });

        socket.on('messageUpdated', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        });

        socket.on('emojiReactionRemoved', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        });

        socket.on('emojiReactionUpdated', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id || (updatedMessage.privateChatId && updatedMessage.privateChatId.includes(currentUser.username))) {
                setMessages(prevMessages =>
                    prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
                );
            }
        });

        socket.on('messageDeleted', ({ messageId }) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        });

        socket.on('messagesUpdated', (updatedMessages) => {
            const filteredMessages = updatedMessages.filter(msg => msg.teamId === currentUser.team_id || (msg.privateChatId && msg.privateChatId.includes(currentUser.username)));
            setMessages(filteredMessages);
        });

        socket.on('typing', (data) => {
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setTypingUser(data);
            }
        });

        socket.on('stop typing', (data) => {
            if (data.teamId === currentUser.team_id || (data.privateChatId && data.privateChatId.includes(currentUser.username))) {
                setTypingUser(null);
            }
        });

        return () => {
            socket.off('messageResponse');
            socket.off('messageUpdated');
            socket.off('emojiReactionRemoved');
            socket.off('emojiReactionUpdated');
            socket.off('messageDeleted');
            socket.off('messagesUpdated');
            socket.off('typing');
            socket.off('stop typing');
        };
    }, [currentUser]);

   /* useEffect(() => {
        if (autoScroll) {
            lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setAutoScroll(true);
        }
    }, [messages]);*/

   const handleScroll = () => {
        const element = document.getElementById('chat-body');
        if (element) {
            const { scrollTop, scrollHeight, clientHeight } = element;
            setAutoScroll(scrollTop + clientHeight >= scrollHeight - 50);
        }
    };

    const getPrivateChatId = (user1, user2) => {
        return [user1, user2].sort().join('-');
    };

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
    };

    return (
        <div
            className="mx-auto flex flex-col"
            style={{ height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}
        >
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
                onScroll={handleScroll}
                teamMembers={teamMembers}
                privateChatId={privateChatId}
                currentUserAvatarColor={currentUserAvatarColor} // pass the avatar color
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
