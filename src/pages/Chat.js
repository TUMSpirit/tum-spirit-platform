import React, { useEffect, useState, useRef } from 'react';
import ChatBody from '../components/chat/client/src/components/ChatBody';
import ChatFooter from '../components/chat/client/src/components/ChatFooter';
import '../components/chat/client/src/index.css';

const Chat = ({ socket }) => {

    const [messages, setMessages] = useState([
        { id: 1, name: "User1", text: "Hello" },
        { id: 2, name: "User2", text: "Hi there!" },
    ]);


    const [message, setMessage] = useState('');


    const lastMessageRef = useRef(null);

    useEffect(() => {
        if (socket) {
            socket.on('message', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            return () => {
                socket.off('message');
            };
        }
    }, [socket]);

    const handleSendMessage = (e) => {
        e.preventDefault()
            socket.emit("message",
                {
                    text: message,
                    name: localStorage.getItem("userName"),
                    id: `${socket.id}${Math.random()}`,
                    socketID: socket.id
                }
            )
        setMessage("")
    }
    return (
        <div className="chat-container">
            <ChatBody messages={messages} lastMessageRef={lastMessageRef} />
            <ChatFooter onSubmit={handleSendMessage} />
        </div>
    );
};

export default Chat;
