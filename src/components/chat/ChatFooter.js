import React, {useState, useRef, useEffect} from 'react';
import {Button, Tooltip, Input} from 'antd';
import {PlusOutlined, SmileOutlined, SendOutlined} from "@ant-design/icons";
import Picker from 'emoji-picker-react';

const ChatFooter = ({socket, editingMessage, setEditingMessage, onAddIssue, replyingTo, setReplyingTo}) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
                replyingTo: replyingTo?.messageId
            };

            //Automatische Antwort falls für Eye Test notwendig

            const botMessage = {
                text: `Hallo ${userMessage.name}! Ich habe gerade gesehen, dass du am 13. Februar ein Meeting
                  geplant hast. Gerne würde ich die Aufgabe xy übernehmen. Könntest du bitte dazu eine Karte
                  im Kanban Board erstellen und mir zuweisen? Danke! 🙂`,
                name: 'Martin',
                id: `${socket.id}${Math.random()}`,
                socketID: socket.id,
                timestamp: Date.now(),
            };

            socket.emit('message', userMessage);
            setTimeout(() => {
                socket.emit('message', botMessage);
            }, 2200);
        }
        setMessage('');
        setReplyingTo(null);
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

    const getPlaceholderText = () => {
        if (replyingTo && replyingTo.text) {
            const shortenedText = replyingTo.text.length > 30 ? `${replyingTo.text.substring(0, 30)}...` : replyingTo.text;
            return `Replying to: "${shortenedText}"`;
        }
        return "Type a message...";
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
        <div className={`fixed bottom-0 left-0 md:left-60 right-0 p-4 bg-white border-t-2 border-gray-200`}>
            <div className="container mx-auto max-w-full">
                <form className="flex items-center justify-between gap-4 w-full px-4" onSubmit={handleSendMessage}>
                    <Tooltip title="Upload File">
                        <Button
                            type="primary"
                            shape="circle"
                            className="bg-blue-600 text-white"
                            style={{
                                fontSize: '24px',
                                padding: '12px',
                                height: '38px',
                                width: '38px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            icon={<PlusOutlined/>}
                        />
                    </Tooltip>
                    <Input
                        className="flex-grow mx-5 bg-chat-input-bar border-1 focus:outline-none rounded-lg p-2"
                        placeholder={getPlaceholderText()}
                        value={message}
                        onChange={handleChange}
                        suffix={
                            <div className="relative inline-block">
                                <Tooltip title="Emoticons">
                                    <div onClick={toggleEmojiPicker} className="cursor-pointer">
                                        <SmileOutlined style={{fontSize: '24px', color: '#3d72b5'}}/>
                                    </div>
                                </Tooltip>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 right-0 z-20">
                                        <Picker onEmojiClick={onEmojiClick}/>
                                    </div>
                                )}
                            </div>
                        }
                    />
                    {showCommands && (
                        <div
                            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white shadow-md z-10 p-2 w-[calc(100% - 235px)] rounded-md"
                        >
                            {commands
                                .filter((command) => command.toLowerCase().startsWith(message.toLowerCase()))
                                .map((command) => (
                                    <div
                                        key={command}
                                        onClick={() => handleCommandClick(command)}
                                        className="p-2 cursor-pointer text-lg"
                                    >
                                        {command}
                                    </div>
                                ))}
                        </div>
                    )}
                    <Tooltip title="Send Message">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SendOutlined/>}
                            className="bg-blue-600 text-white"
                            style={{
                                fontSize: '24px',
                                padding: '12px',
                                height: '58px',
                                width: '58px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={handleSendMessage}
                        />
                    </Tooltip>
                </form>
            </div>
        </div>
    );
}

export default ChatFooter;