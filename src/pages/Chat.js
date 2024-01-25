import React, {useEffect, useState, useRef} from 'react';
import ChatBody from '../components/chat/ChatBody';
import ChatFooter from '../components/chat/ChatFooter';
import '../components/chat/index.css';
import socketIO from "socket.io-client"

const socket = socketIO.connect("http://localhost:4000")

const Chat = () => {

    const [messages, setMessages] = useState([])
    const lastMessageRef = useRef(null);

    useEffect(() => {
        socket.on("messageResponse", data => setMessages([...messages, data]))
    }, [socket, messages])


    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    return (
        <div className="chat">
            <div className='chat__main'>
                <ChatBody messages={messages} lastMessageRef={lastMessageRef}/>
                <ChatFooter socket={socket}/>
            </div>
        </div>
    )
};

export default Chat;
