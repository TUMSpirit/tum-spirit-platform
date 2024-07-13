import React, {useEffect, useState, useRef} from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from "socket.io-client";
import {Typography} from "antd";
import {useAuthHeader} from 'react-auth-kit';

const {Title} = Typography;
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

    const handleRemoveReaction = (updatedMessages) => {
        setMessages(updatedMessages);
    };

    const handleDeleteMessage = (message) => {
        socket.emit('deleteMessage', {messageId: message.id, token: authHeader().split(" ")[1]});
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/chat/get-messages`, {
                method: 'GET',
                headers: {
                    "Authorization": authHeader(),
                }
            });
            const data = await response.json();
            console.log("Fetched messages:", data);
            setMessages(data || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [currentTab]);

    useEffect(() => {
        socket.on("messageResponse", (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        });

        socket.on('messageUpdated', (updatedMessage) => {
            setMessages(prevMessages => {
                const index = prevMessages.findIndex(msg => msg.id === updatedMessage.id);
                if (index !== -1) {
                    const newMessages = [...prevMessages];
                    newMessages[index] = updatedMessage;
                    return newMessages;
                }
                return prevMessages;
            });
        });

        socket.on('emojiReactionRemoved', (updatedMessage) => {
            setMessages(currentMessages => currentMessages.map(msg => {
                if (msg.id === updatedMessage.id) {
                    return updatedMessage;
                }
                return msg;
            }));
        });

        socket.on('emojiReactionUpdated', (updatedMessage) => {
            setMessages(currentMessages => currentMessages.map(msg => {
                if (msg.id === updatedMessage.id) {
                    return updatedMessage;
                }
                return msg;
            }));
        });

        socket.on('messageDeleted', (messageId) => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        });

        socket.on('messagesUpdated', (updatedMessages) => {
            setMessages(updatedMessages);
        });

        socket.on('typing', (user) => {
            setTypingUser(user);
        });

        socket.on('stop typing', () => {
            setTypingUser(null);
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
    }, [socket]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, [messages]);

    return (
        <div
            className="mx-auto flex flex-col"
            style={{height: `calc(100vh - ${HEADER_HEIGHT_PX}px)`}}
        >
            <ChatBody
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
            />
        </div>
    );
};

export default Chat;
