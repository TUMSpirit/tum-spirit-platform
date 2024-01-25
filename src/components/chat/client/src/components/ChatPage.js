import React, { useEffect, useState, useRef} from 'react'
import ChatBody from '../../../ChatBody'
import ChatFooter from '../../../ChatFooter'

const ChatPage = ({socket}) => {
    const [messages, setMessages] = useState([])
    const lastMessageRef = useRef(null);

    useEffect(()=> {
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
}

export default ChatPage