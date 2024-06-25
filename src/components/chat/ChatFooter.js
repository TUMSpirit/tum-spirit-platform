
import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip, Input, Modal, Upload, message } from 'antd';
import { PlusOutlined, SmileOutlined, SendOutlined, UploadOutlined, GifOutlined } from "@ant-design/icons";
import Picker from 'emoji-picker-react';
import GifPicker from 'gif-picker-react';

const ChatFooter = ({ socket, editingMessage, setEditingMessage, onAddIssue, replyingTo, setReplyingTo }) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const commands = ['/Create Kanban Card', '/Display Kanban Card', '/Delete Kanban Card', '/Create Poll', '/Ask Ghost'];
    const commandKanban = '/Create Kanban Card: Title:"CardTitle" , description:"Card , Category: "Category" ,  Description" , type:"Task Type" , person:"In Charge Person", milestone:"Milestone"';
    const commandCalender = '/Create Calendar Entry: Title: "Title" , DateStart: "Enter Start Date" , DateEnd: "Enter End Date", Add Paricipants: "Particpant1,", onsite = "yes/no/roomnumber"';
    const commandShift = '/Display Kanban Card: CategoryOld: "Category" , Title: "Title" , CategoryNew: "Category" ';
    const commandDelete = '/Delete Kanban Card: Category: "Category" , Title: "Title"';
    const commandDeleteCalendar = '/Delete Calendar Entry: Title: "Title" , StartDate: "StartDate"';
    const askGhost = '/ask Ghost';
    const commandPoll = '/Create Poll: PollTitle, Option1, Option2, Option3';
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const [fileList, setFileList] = useState([]);
    const emojiPickerRef = useRef(null);

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
                replyingTo: replyingTo?.messageId,
                isPoll: trimmedMessage.startsWith('/Create Poll')
            };

            // Automatische Antwort falls für Eye Test notwendig

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
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const onEmojiClick = (emojiData) => {
        setMessage(currentMessage => currentMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const toggleGifPicker = () => {
        setShowGifPicker(!showGifPicker);
    };

    const handleGifSelect = (gif) => {
        const gifUrl = gif.url;
        const userMessage = {
            text: gifUrl,
            isGif: true,  // Flag to indicate this message is a GIF
            name: localStorage.getItem('userName'),
            id: `${socket.id}${Math.random()}`,
            socketID: socket.id,
            timestamp: Date.now(),
            replyingTo: replyingTo?.messageId
        };
        socket.emit('message', userMessage);
        setShowGifPicker(false);
        setReplyingTo(null);
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
            case '/Display Kanban Card':
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
            case '/askGhost':
                setMessage(askGhost);
                break;
            default:
                setMessage(command + " ");
                break;
        }
        setShowCommands(false);
    };

    const showUploadModal = () => {
        setIsUploadModalVisible(true);
    };

    const handleUploadModalOk = () => {
        const formData = new FormData();
        fileList.forEach(file => {
            formData.append('files', file);
        });

        fetch('here connection to backend', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                message.success('Upload successful');
                setIsUploadModalVisible(false);
                setFileList([]);
                console.log(data);
            })
            .catch(error => {
                message.error('Upload failed');
                console.error('Error:', error);
            });
    };

    const handleUploadModalCancel = () => {
        setIsUploadModalVisible(false);
        setFileList([]);
    };

    const handleFileChange = ({ fileList }) => {
        setFileList(fileList);
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
                            icon={<PlusOutlined />}
                            onClick={showUploadModal}
                        />
                    </Tooltip>
                    <Input
                        className="flex-grow mx-5 bg-chat-input-bar border-1 focus:outline-none rounded-lg p-2"
                        placeholder={getPlaceholderText()}
                        value={message}
                        onChange={handleChange}
                        suffix={
                            <div className="relative inline-block flex items-center">
                                <Tooltip title="Emoticons">
                                    <div onClick={toggleEmojiPicker} className="cursor-pointer">
                                        <SmileOutlined style={{ fontSize: '24px', color: '#3d72b5' }} />
                                    </div>
                                </Tooltip>
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-20">
                                        <Picker onEmojiClick={onEmojiClick}/>
                                    </div>
                                )}
                                <Tooltip title="GIFs">
                                    <div onClick={toggleGifPicker} className="cursor-pointer ml-2">
                                        <GifOutlined style={{ fontSize: '24px', color: '#3d72b5' }} />
                                    </div>
                                </Tooltip>
                                {showGifPicker && (
                                    <div className="absolute bottom-12 right-0 z-20">
                                        <GifPicker onGifClick={handleGifSelect} tenorApiKey={"AIzaSyAk91-aEz1P6kvOwEuTsRPUtS1YzFsdIzY"} />
                                    </div>
                                )}
                            </div>
                        }
                    />
                    {showCommands && (
                        <div
                            className="absolute bottom-24 left-60 transform -translate-x-1/2 bg-white shadow-md z-10 p-2 w-[calc(100% - 235px)] rounded-md"
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
                            icon={<SendOutlined />}
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
            <Modal
                title="Upload Document"
                visible={isUploadModalVisible}
                onOk={handleUploadModalOk}
                onCancel={handleUploadModalCancel}
                footer={[
                    <Button key="cancel" onClick={handleUploadModalCancel}>
                        Cancel
                    </Button>,
                    <Button key="upload" type="primary" onClick={handleUploadModalOk}>
                        Upload
                    </Button>,
                ]}
            >
                <Upload
                    fileList={fileList}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
            </Modal>
            <Modal
                title="Select a GIF"
                visible={showGifPicker}
                onCancel={() => setShowGifPicker(false)}
                footer={null}
            >
                <GifPicker onGifClick={handleGifSelect} tenorApiKey={"AIzaSyAk91-aEz1P6kvOwEuTsRPUtS1YzFsdIzY"} />
            </Modal>
        </div>
    );
}

export default ChatFooter;