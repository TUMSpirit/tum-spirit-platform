import React from 'react';
import { Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, SmileOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import axios from 'axios'; // Importing axios
import senderIcon from '../../assets/images/avatar3.png';
import recipientIcon from '../../assets/images/avatar2.png';

const MessageItem = ({
    message,
    index,
    currentUser,
    setEditingMessage,
    setMessage,
    setReplyingTo,
    onDeleteMessage,
    authHeader,
    socket,
    canEditOrDelete,
    isLastMessage,
    messages // Pass messages as a prop
}) => {
    const isSender = message.senderId === currentUser?.username;
    const isReplyingTo = messages.find((m) => m.id === message.replyingTo);
    const reactions = message.reactions ? Object.values(message.reactions) : [];
    const messageStyle = getMessageStyle(message.content);
    const messageMarginTop = index === 0 ? 'mt-6' : '';
    const messageMarginBottom = isLastMessage ? 'mb-6' : '';

    const fetchMessage = async (messageId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/chat/get-message/${messageId}`, {
                headers: {
                    Authorization: authHeader(),
                },
            });
            const messageToEdit = response.data;
            messageToEdit.id = messageToEdit.id || messageId;
            return messageToEdit;
        } catch (error) {
            console.error('Error fetching message:', error);
            return null;
        }
    };

    const handleEditMessage = async (messageId) => {
        const messageToEdit = await fetchMessage(messageId);
        if (messageToEdit) {
            setEditingMessage(messageToEdit);
            setMessage(messageToEdit.content);
        }
    };

    const menu = (
        <Menu>
            {isSender && canEditOrDelete(message.timestamp) && (
                <Menu.Item key="edit" onClick={() => handleEditMessage(message.id)} icon={<EditOutlined />}>
                    Edit
                </Menu.Item>
            )}
            {isSender && canEditOrDelete(message.timestamp) && (
                <Menu.Item key="delete" onClick={() => onDeleteMessage(message.id)} icon={<DeleteOutlined />}>
                    Delete
                </Menu.Item>
            )}
            <Menu.Item key="react" icon={<SmileOutlined />}>
                React
            </Menu.Item>
            <Menu.Item key="reply" onClick={() => setReplyingTo(message)} icon={<MessageOutlined />}>
                Reply
            </Menu.Item>
        </Menu>
    );

    return (
        <div
            key={message.id}
            id={`message-${message.id}`}
            className={`flex items-start mb-4 ${messageMarginTop} ${messageMarginBottom} ${
                isSender ? 'justify-end' : 'justify-start'
            }`}
        >
            <div className={`flex items-start gap-2 ${isSender ? 'order-2' : ''}`}>
                <img
                    className="rounded-full w-8 h-8"
                    src={isSender ? senderIcon : recipientIcon}
                    alt="avatar"
                />
                <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                    {isReplyingTo && (
                        <div className="text-sm bg-gray-100 rounded-lg px-2 py-1 mb-2">
                            {isReplyingTo.content}
                        </div>
                    )}
                    <div
                        className={`${
                            isSender ? 'bg-sender-background text-white' : 'bg-white text-black'
                        } p-3 rounded-lg shadow-sm`}
                        style={messageStyle}
                    >
                        {message.content}
                    </div>
                    {reactions.length > 0 && (
                        <div className="flex items-center mt-2">
                            {reactions.map((reaction, i) => (
                                <span key={i} className="mr-2">
                                    {reaction}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="ml-2">
                <Dropdown overlay={menu} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer" />
                </Dropdown>
            </div>
        </div>
    );
};

const getMessageStyle = (content) => {
    const lines = content.split('\n');
    const lineCount = lines.length;
    const height = lineCount * 1.25; // Adjust multiplier to control height
    return {
        height: `${height}em`,
        whiteSpace: 'pre-wrap',
    };
};

export default MessageItem;
