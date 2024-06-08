import React, {useEffect, useState, useRef} from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import '../components/chat/index.css';
import socketIO from "socket.io-client"
import {Typography} from "antd";
import Chatbot from "../components/AiChat/chat-bubble";

const {Title} = Typography;
const socket = socketIO.connect("http://localhost:4000")

const Chat = () => {
    const data = [];
    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [editingMessage, setEditingMessage] = useState(null);
    const lastMessageRef = useRef(null);
    const handleRemoveReaction = (updatedMessages) => {
        setMessages(updatedMessages);
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
        lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
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
        <div className="chat">
          <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // This makes the div fill the entire height of the viewport
                width: "100vw", // To explicitly ensure it also covers the full width of the viewport
                background: "#ffffff", // Corrected the color code for white
              }}
          >
            <Chatbot />
          </div>
            <div className='chat__main'>
                <ChatBody currentTab={currentTab} setCurrentTab={setCurrentTab} messages={messages}
                          onRemoveReaction={handleRemoveReaction} lastMessageRef={lastMessageRef}
                          setEditingMessage={setEditingMessage} onDeleteMessage={handleDeleteMessage} socket={socket}/>
                <ChatFooter socket={socket} editingMessage={editingMessage} setEditingMessage={setEditingMessage}/>
            </div>
        </div>
    );
}

export default Chat;
