import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, Input, Modal, Upload, message } from 'antd';
import { PlusOutlined, SmileOutlined, SendOutlined, UploadOutlined, GifOutlined } from "@ant-design/icons";
import Picker from 'emoji-picker-react';
import GifPicker from 'gif-picker-react';
import axios from "axios";
import { useAuthHeader } from 'react-auth-kit';

const postFiles = async ({ files }, authHeader) => {
    const formData = new FormData();
    files.fileList.forEach(file => {
        if (file.originFileObj) {
            formData.append('files', file.originFileObj);
        }
    });

    try {
        const response = await axios.post(`http://localhost:8000/api/files/upload`, formData, {
            headers: {
                Authorization: authHeader,
                'Content-Type': 'multipart/form-data'
            }
        });
        message.success('File uploaded successfully');
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        message.error('Error uploading file');
        return null;
    }
};

const ChatFooter = ({
                        socket,
                        editingMessage,
                        setEditingMessage,
                        message,
                        setMessage,
                        replyingTo,
                        setReplyingTo,
                        isTyping,
                        setIsTyping,
                        currentUser,
                        currentTab,
                        teamMembers,
                        privateChatId
                    }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showCommands, setShowCommands] = useState(false);
    const commands = ['Display Kanban Card', '/Create Poll', '/ask Ghost'];
    const displayKanbanCard = '/Display Kanban Card: ID : "ID"';
    const askGhost = '/ask Ghost';
    const commandPoll = '/Create Poll: option1,option2,option3';
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    const authHeader = useAuthHeader();
    const [fileList, setFileList] = useState([]);
    const emojiPickerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const toggleGifPicker = () => {
        setShowGifPicker(!showGifPicker);
    };

    const handleGifSelect = (gif) => {
        const gifUrl = gif.url;
        const userMessage = {
            content: gifUrl,
            isGif: true,
            senderId: currentUser.username,
            teamId: currentUser.team_id,
            id: `${socket.id}${Math.random()}`,
            socketID: socket.id,
            timestamp: new Date().toISOString(),
            replyingTo: replyingTo ? replyingTo.messageId : null,
            token: authHeader().split(" ")[1],
            privateChatId: privateChatId,
        };
        socket.emit('message', userMessage);
        setShowGifPicker(false);
        setReplyingTo(null);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (trimmedMessage === "") {
            return;
        }

        if (!currentUser) {
            console.error("Current user not found.");
            return;
        }

        const token = authHeader().split(" ")[1];

        if (editingMessage) {
            const updatedMessage = {
                id: editingMessage.id,
                teamId: editingMessage.teamId,
                content: trimmedMessage,
                senderId: editingMessage.senderId,
                timestamp: editingMessage.timestamp,
                replyingTo: editingMessage.replyingTo,
                token: token,
                privateChatId: privateChatId,
            };
            socket.emit('editMessage', updatedMessage);
            setEditingMessage(null);
        } else {
            const userMessage = {
                teamId: currentUser.team_id,
                content: trimmedMessage,
                senderId: currentUser.username,
                timestamp: new Date().toISOString(),
                token: token,
                replyingTo: replyingTo ? replyingTo.messageId : null,
                isPoll: trimmedMessage.startsWith('/Create Poll'),
                privateChatId: privateChatId,
            };
            console.log(`Sending message with replyingTo: ${userMessage.replyingTo}`);
            socket.emit('message', userMessage);
        }
        setMessage('');
        setReplyingTo(null);
        socket.emit('stop typing', { user: currentUser.username, teamId: currentUser.team_id });
        setIsTyping(false);
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

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { user: currentUser.username, teamId: currentUser.team_id });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop typing', { user: currentUser.username, teamId: currentUser.team_id });
            setIsTyping(false);
        }, 3000);
    };

    const getPlaceholderText = () => {
        if (replyingTo && replyingTo.content) {
            const shortenedText = replyingTo.content.length > 30 ? `${replyingTo.content.substring(0, 30)}...` : replyingTo.content;
            return `Replying to: "${shortenedText}"`;
        }
        return "Type a message...";
    };

    const handleCommandClick = (command) => {
        switch (command) {
            case '/Create Poll':
                setMessage(commandPoll);
                break;
            case '/Display Kanban Card':
                setMessage(displayKanbanCard);
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

    const handleUploadModalOk = async () => {
        const authHeaderString = authHeader();
        const files = { fileList };
        await postFiles({ files }, authHeaderString);
        setIsUploadModalVisible(false);
        setFileList([]);
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
            setMessage(editingMessage.content);
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
                            <div className="relative flex items-center">
                                <Tooltip title="Emoticons">
                                    <div onClick={toggleEmojiPicker} className="cursor-pointer">
                                        <SmileOutlined style={{ fontSize: '24px', color: '#3d72b5' }} />
                                    </div>
                                </Tooltip>
                                {showEmojiPicker && (
                                    <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-20">
                                        <Picker onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                                <Tooltip title="GIFs">
                                    <div onClick={toggleGifPicker} className="cursor-pointer ml-2">
                                        <GifOutlined style={{ fontSize: '24px', color: '#3d72b5' }} />
                                    </div>
                                </Tooltip>
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
            {showGifPicker && (
                <Modal
                    title="Select a GIF"
                    visible={showGifPicker}
                    onCancel={() => setShowGifPicker(false)}
                    footer={null}
                >
                    <GifPicker onGifClick={handleGifSelect} tenorApiKey={"AIzaSyAk91-aEz1P6kvOwEuTsRPUtS1YzFsdIzY"} />
                </Modal>
            )}
        </div>
    );
}

export default ChatFooter;
