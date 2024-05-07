import React, {useState, useRef, useEffect} from 'react';
import {Button, Tooltip, Input} from 'antd';
import {PlusOutlined, SmileOutlined, SendOutlined} from "@ant-design/icons";
import sound from "../../assets/sounds/notification.mp3";
import Picker from 'emoji-picker-react';

const ChatFooter = ({socket, editingMessage, setEditingMessage, onAddIssue}) => {
    const [message, setMessage] = useState("");
    const messageSound = new Audio(sound);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null); // Ref for
    const [showCommands, setShowCommands] = useState(false);
    const commands = ['/Create Kanban Card', '/Change Kanban Card Category', '/Delete Kanban Card', '/Create Calendar Entry', '/Delete Calendar Entry', '/Create Poll'];
    const commandKanban = '/Create Kanban Card: Title:"CardTitle" , description:"Card , Category: "Category" ,  Description" , type:"Task Type" , person:"In Charge Person", milestone:"Milestone"';
    const commandCalender = '/Create Calendar Entry: Title: "Title" , DateStart: "Enter Start Date" , DateEnd: "Enter End Date", Add Paricipants: "Particpant1,", onsite = "yes/no/roomnumber"';
    const commandShift = '/Change Kanban Card Category: CategoryOld: "Category" , Title: "Title" , CategoryNew: "Category" ';
    const commandDelete = '/Delete Kanban Card: Category: "Category" , Title: "Title"';
    const commandDeleteCalendar = '/Delete Calendar Entry: Title: "Title" , StartDate: "StartDate"';
    const commandPoll = '/Create Poll: option1,option2, option3';


    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (trimmedMessage === "") {
            return;
        }
        if (editingMessage) {
            const updatedMessage = {
                ...editingMessage,
                text: message,
            };
            socket.emit('editMessage', updatedMessage);
            setEditingMessage(null);
        } else {
            const userMessage = {
                text: trimmedMessage,
                name: localStorage.getItem('userName'),
                id: `${socket.id}${Math.random()}`,
                socketID: socket.id,
                timestamp: Date.now(),
            };

            //Automatische Antwort falls für Eye Test notwendig

            //   const botMessage = {
            //      text: `Hallo ${userMessage.name}! Ich habe gerade gesehen, dass du am 13. Februar ein Meeting
            //      geplant hast. Gerne würde ich die Aufgabe xy übernehmen. Könntest du bitte dazu eine Karte
            //      im Kanban Board erstellen und mir zuweisen? Danke! 🙂`,
            //      name: 'Martin',
            //      id: `${socket.id}${Math.random()}`,
            //      socketID: socket.id,
            //      timestamp: Date.now(),
            //    };

            socket.emit('message', userMessage);
            setTimeout(() => {
                //      socket.emit('message', botMessage);
                //      messageSound.play();
            }, 2200);
        }
        setMessage('');
    };

    const onEmojiClick = (emojiData) => {
        setMessage(currentMessage => currentMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (value.startsWith("/")) {
            const search = value.toLowerCase();
            const filteredCommands = commands.filter(command =>
                command.toLowerCase().startsWith(search)
            );
            setShowCommands(filteredCommands.length > 0);
        } else {
            setShowCommands(false);
        }
    };

    const handleCommandClick = (command) => {
        switch (command) {
            case '/Create Kanban Card':
                setMessage(commandKanban);
                break;
            case '/Create Calendar Entry':
                setMessage(commandCalender);
                break;
            case '/Change Kanban Card Category':
                setMessage(commandShift);
                break;
            case '/Delete Kanban Card':
                setMessage(commandDelete);
                break;
            case '/Create Poll':
                setMessage(commandPoll);
                break;
            case '/Delete Calendar Entry':
                setMessage(commandDeleteCalendar);
                break;
            default:
                setMessage(command + " ");
                break;
        }
        setShowCommands(false);
    };

    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.text);
        }
    }, [editingMessage]);

    return (
        <div className="fixed bottom-0 p-9 bg-white w-[calc(100vw_-_250px)] flex items-center justify-between gap-1"
             style={{borderTop: '2px solid #efefef'}}>
            <form className='form' onSubmit={handleSendMessage}>
                <Tooltip title="Upload File">
                    <Button type="primary" shape="circle" className="uploadBTN" icon={<PlusOutlined/>}/>
                </Tooltip>
                <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleChange}
                    style={{width: 'calc(100% - 100px)'}}
                    suffix={
                        <>
                            <div style={{display: 'inline-block', position: 'relative'}}>
                                <Tooltip title="Emoticons">
                                    <div onClick={toggleEmojiPicker} className="icon-wrapper"
                                         style={{cursor: 'pointer'}}>
                                        <SmileOutlined style={{fontSize: '24px', color: '#3d72b5'}}/>
                                    </div>
                                </Tooltip>
                                {showEmojiPicker && (
                                    <div style={{position: 'absolute', bottom: '50px', right: '50px', zIndex: 2}}>
                                        <Picker onEmojiClick={onEmojiClick}/>
                                    </div>
                                )}
                            </div>
                        </>
                    }
                    className="inputBAR"
                />
                {showCommands && (
                    <div style={{
                        position: 'absolute',
                        bottom: '90px',
                        left: '49.6%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        padding: '4px 0',
                        width: 'calc(100% - 235px)'
                    }}>
                        {commands.filter(command =>
                            command.toLowerCase().startsWith(message.toLowerCase())
                        ).map((command) => (
                            <div
                                key={command}
                                onClick={() => handleCommandClick(command)}
                                style={{padding: '8px 16px', cursor: 'pointer', fontSize: '18px'}}
                            >
                                {command}
                            </div>
                        ))}
                    </div>
                )}
                <Tooltip title="Send Message">
                    <Button type="primary" shape="circle" className="sendBTN" onClick={handleSendMessage}
                            icon={<SendOutlined/>}/>
                </Tooltip>
            </form>
        </div>
    );
};

export default ChatFooter;
