import React, {useEffect, useState, useRef} from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import socketIO from "socket.io-client"
import {Typography} from "antd";

const {Title} = Typography;
const socket = socketIO.connect("http://localhost:4000")


const Chat = () => {

    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [editingMessage, setEditingMessage] = useState(null);
    const lastMessageRef = useRef(null);
    const handleRemoveReaction = (updatedMessages) => {
        setMessages(updatedMessages);
    };
    const HEADER_HEIGHT_PX = 256;

    const [replyingTo, setReplyingTo] = useState(null);

    const handleDeleteMessage = (messageId) => {
        socket.emit('deleteMessage', messageId);
        setMessages(messages => messages.map(msg => {
            if (msg.id === messageId) {
                return {...msg, deleted: true};
            }
            return msg;
        }));
    };

    useEffect(() => {
        function fetchMessages() {
            fetch(`http://localhost:4000/api?chatId=${currentTab}`)
                .then(response => response.json())
                .then(data => setMessages(data.messages || []));
        }

        fetchMessages();
    }, [currentTab]);

    useEffect(() => {
        socket.on("messageResponse", data => setMessages([...messages, data]))
    }, [socket, messages])


    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }, [messages]);

    useEffect(() => {
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
        return () => socket.off('messageUpdated');
    }, [socket]);

    useEffect(() => {
        socket.on('emojiReactionRemoved', (updatedMessage) => {
            setMessages(currentMessages => currentMessages.map(msg => {
                if (msg.id === updatedMessage.id) {
                    const updatedMsg = {...msg};
                    delete updatedMsg.reaction;
                    return updatedMsg;
                }
                return msg;
            }));
        });
        return () => {
            socket.off('emojiReactionRemoved');
        };
    }, [socket]);

    useEffect(() => {
        socket.on('emojiReactionUpdated', (updatedMessage) => {
            setMessages(currentMessages => currentMessages.map(msg => {
                if (msg.id === updatedMessage.id) {
                    return updatedMessage;
                }
                return msg;
            }));
        });
        return () => socket.off('emojiReactionUpdated');
    }, [socket]);


    return (
        <div
            className="mx-auto flex flex-col"
            style={{height: `calc(100vh - ${HEADER_HEIGHT_PX}px)`}}
        >
            <ChatBody currentTab={currentTab} setCurrentTab={setCurrentTab} messages={messages}
                      onRemoveReaction={handleRemoveReaction} lastMessageRef={lastMessageRef}
                      setEditingMessage={setEditingMessage} onDeleteMessage={handleDeleteMessage} socket={socket}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}/>
            <ChatFooter socket={socket} editingMessage={editingMessage} setEditingMessage={setEditingMessage}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}/>
        </div>
    );
};

export default Chat;