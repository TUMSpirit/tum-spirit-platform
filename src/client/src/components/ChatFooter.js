import React, {useState} from 'react';

const ChatFooter = ({socket}) => {
    const [message, setMessage] = useState("")

    const handleSendMessage = (e) => {
            e.preventDefault();
            if (message.trim() && localStorage.getItem('userName')) {
                const userMessage = {
                    text: message,
                    name: localStorage.getItem('userName'),
                    id: `${socket.id}${Math.random()}`,
                    socketID: socket.id,
                };

                const botMessage = {
                    text: 'Hallo ' + userMessage.name + '! Ich habe gerade gesehen, dass du am 13. Februar ein Meeting geplant hast. Gerne würde ich die Aufgabe xy übernehmen. Könntest du bitte dazu eine Karte ' +
                        'im Kanban Board erstellen und mir zuweisen? Danke! 🙂',
                    name: 'Martin',
                    id: `${socket.id}${Math.random()}`,
                    socketID: socket.id,
                };
                socket.emit('message', userMessage);
                socket.emit('message', botMessage);
                setMessage('');
            }
        }
    ;
    return (
        <div className="chat__footer">
            <form className="form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Write message"
                    className="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className="sendBtn">SEND</button>
            </form>
        </div>
    );
};

export default ChatFooter;
