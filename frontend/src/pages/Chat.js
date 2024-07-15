import React, { useEffect, useState, useRef, useCallback } from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from "socket.io-client";
import { Typography } from "antd";
import { useAuthHeader } from 'react-auth-kit';

const { Title } = Typography;
const socket = socketIO.connect("http://localhost:4000");

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

    const fetchCurrentUser = useCallback(async () => {
        if (!currentUser) {
            try {
                const response = await fetch('http://localhost:8000/api/me', {
                    headers: {
                        'Authorization': authHeader(),
                    },
                });
                const data = await response.json();
                setCurrentUser(data);
                socket.emit('joinTeam', data.team_id); // Ensure user joins the correct team room
            } catch (error) {
                console.error('Failed to fetch current user:', error);
            }
        }
    }, [authHeader, currentUser]);

    const handleRemoveReaction = (updatedMessages) => {
        setMessages(updatedMessages);
    };

    const handleDeleteMessage = (message) => {
        socket.emit('deleteMessage', { messageId: message.id, token: authHeader().split(" ")[1], teamId: currentUser.team_id });
    };

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/chat/get-messages`, {
                method: 'GET',
                headers: {
                    "Authorization": authHeader(),
                }
            });
            const data = await response.json();
            setMessages(data || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, [authHeader]);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchMessages();
        }
    }, [currentTab, fetchMessages, currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        socket.on("messageResponse", (data) => {
            if (data.teamId === currentUser.team_id) {
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages, data];
                    setAutoScroll(true);
                    return newMessages;
                });
            }
        });

        socket.on('messageUpdated', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id) {
                setMessages(prevMessages => {
                    const index = prevMessages.findIndex(msg => msg.id === updatedMessage.id);
                    if (index !== -1) {
                        const newMessages = [...prevMessages];
                        newMessages[index] = updatedMessage;
                        return newMessages;
                    }
                    return prevMessages;
                });
            }
        });

        socket.on('emojiReactionRemoved', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id) {
                setMessages(currentMessages => currentMessages.map(msg => {
                    if (msg.id === updatedMessage.id) {
                        return updatedMessage;
                    }
                    return msg;
                }));
            }
        });

        socket.on('emojiReactionUpdated', (updatedMessage) => {
            if (updatedMessage.teamId === currentUser.team_id) {
                setMessages(currentMessages => currentMessages.map(msg => {
                    if (msg.id === updatedMessage.id) {
                        return updatedMessage;
                    }
                    return msg;
                }));
            }
        });

        socket.on('messageDeleted', (messageId) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        });

        socket.on('messagesUpdated', (updatedMessages) => {
            const filteredMessages = updatedMessages.filter(msg => msg.teamId === currentUser.team_id);
            setMessages(filteredMessages);
        });

        socket.on('typing', (data) => {
            if (data.teamId === currentUser.team_id && data.user !== currentUser.username) {
                setTypingUser(data);
            }
        });

        socket.on('stop typing', (data) => {
            if (data.teamId === currentUser.team_id && data.user !== currentUser.username) {
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
    }, [socket, currentUser]);

    useEffect(() => {
        if (autoScroll) {
            lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            setAutoScroll(false);
        }
    }, [messages, autoScroll]);

    const handleScroll = () => {
        const element = document.getElementById('chat-body');
        if (element) {
            const { scrollTop, scrollHeight, clientHeight } = element;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setAutoScroll(true);
            } else {
                setAutoScroll(false);
            }
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
                setCurrentTab={setCurrentTab}
                messages={messages}
                onRemoveReaction={handleRemoveReaction}
                lastMessageRef={lastMessageRef}
                setEditingMessage={setEditingMessage}
                onDeleteMessage={handleDeleteMessage}
                socket={socket}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                setMessage={setMessage}
                typingUser={typingUser}
                currentUser={currentUser}
                onScroll={handleScroll}
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
            />
        </div>
    );
};

export default Chat;
