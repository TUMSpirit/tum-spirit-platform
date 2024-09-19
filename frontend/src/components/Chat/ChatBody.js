import React, { useMemo, useState, useEffect, useRef } from 'react';
import {Spin, Row, Col, Tabs, Dropdown, Menu, Avatar, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, SmileOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import Search from 'antd/es/input/Search';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { useSubHeader } from '../../layout/SubHeaderContext';
import spirit from '../../assets/images/ghost.png'



const ChatBody = ({
    id,
    currentTab,
    setCurrentTab,
    socket,
    messages,
    lastMessageRef,
    setEditingMessage,
    onDeleteMessage,
    onRemoveReaction,
    setReplyingTo,
    setMessage,
    typingUser,
    currentUser,
    teamMembers,
    privateChatId,
    currentUserAvatarColor,
    onlineStatus,
    getUnreadMessages,
    loading // Add onlineStatus prop
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const authHeader = useAuthHeader();
    const chatContainerRef = useRef(null);
    const { setSubHeaderComponent } = useSubHeader();


    const getPrivateChatId = (user1, user2) => {
        const [firstUser, secondUser] = [user1, user2].sort();
        return `${firstUser}-${secondUser}`;
    };

    const tabsItems = useMemo(() => {
        // Generate the Team tab
        const teamTab = {
            key: '1',
            label: (
                <span>
                    <Badge
                        count={getUnreadMessages('Team') || 0}
                        overflowCount={9}
                        offset={[10, -4]}
                    >
                        Team
                    </Badge>
                </span>
            ),
            children: ''
        };

        // Generate the member tabs
        const memberTabs = teamMembers.map((member, index) => {
            // Generate the chat ID based on sorted usernames
            const privateChatId = getPrivateChatId(currentUser.username, member.username);
            return {
                key: (index + 2).toString(),
                label: (
                    <span>
                        <Badge
                            count={getUnreadMessages(privateChatId) || 0}
                            overflowCount={9}
                            offset={[10, -4]}
                        >
                            <Badge status={onlineStatus[member.username] ? 'processing' : 'default'} text={member.username} />
                        </Badge>
                    </span>
                ),
                children: ''
            };
        });
        // Return the combined tabs array with the team tab first
        return [teamTab, ...memberTabs];
    }, [teamMembers, getUnreadMessages, onlineStatus, currentUser.username, currentTab]);


    const getAvatarColor = (username) => {
        if (username === currentUser?.username) {
            return currentUserAvatarColor;
        }
        const member = teamMembers.find(member => member.username === username);
        return member ? member.avatar_color : '#FFFFFF';
    };

    const canEditOrDelete = (timestamp) => {
        const now = Date.now();
        const messageTime = new Date(timestamp).getTime();
        const diff = now - messageTime;
        return diff <= 5 * 60 * 1000;
    };

    const fetchMessage = async (messageId) => {
        try {
            console.log(`Fetching message with ID: ${messageId}`);
            const response = await axios.get(`/api/chat/get-message/${messageId}`, {
                headers: {
                    "Authorization": authHeader(),
                },
            });
            console.log(`Fetched message: ${response.data}`);
            const messageToEdit = response.data;
            messageToEdit.id = messageToEdit.id || messageId;
            return messageToEdit;
        } catch (error) {
            console.error("Failed to fetch message:", error);
            return null;
        }
    };

    const editMessage = async (messageId) => {
        if (!messageId) {
            console.error("No messageId provided for editing");
            return;
        }
        const messageToEdit = await fetchMessage(messageId);
        if (messageToEdit) {
            setEditingMessage(messageToEdit);
            setMessage(messageToEdit.content);
            setReplyingTo(null);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        date.setHours(date.getHours());
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    const navigatePreviousResult = () => {
        if (searchResults.length > 1) {
            setCurrentResultIndex(prev => {
                const nextIndex = (prev - 1 + searchResults.length) % searchResults.length;
                scrollToMessage(searchResults[nextIndex]);
                return nextIndex;
            });
        }
    };

    const navigateNextResult = () => {
        if (searchResults.length > 0) {
            setCurrentResultIndex(prev => {
                const nextIndex = (prev + 1) % searchResults.length;
                scrollToMessage(searchResults[nextIndex]);
                return nextIndex;
            });
        }
    };


    const handleSearch = (value) => {
        setSearchTerm(value);
        if (!value.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
        } else {
            const lowerCaseTerm = value.toLowerCase();
            const foundIndexes = messages
                .map((message, index) => ({ text: message.content.toLowerCase(), index }))
                .filter(message => message.text.includes(lowerCaseTerm))
                .map(message => message.index)
                .reverse();

            setSearchResults(foundIndexes);
            if (foundIndexes.length > 0) {
                setCurrentResultIndex(0);
                scrollToMessage(foundIndexes[0]);
            }
        }
    };

    const navigateSearchResults = () => {
        if (searchResults.length > 1) {
            setCurrentResultIndex(prev => {
                const nextIndex = (prev + 1) % searchResults.length;
                scrollToMessage(searchResults[nextIndex]);
                return nextIndex;
            });
        }
    };

    const scrollToMessage = (index) => {
        // Ensure index is within the bounds of the messages array
        if (index < 0 || index >= messages.length) {
            console.warn(`Invalid index: ${index}`);
            return;
        }

        // Get the message ID and corresponding element
        const messageId = messages[index]?.id;
        const messageElement = document.getElementById(`message-${messageId}`);
        const containerElement = chatContainerRef.current;

        if (messageElement && containerElement) {
            // Get the offsetTop of the message element
            const messageTop = messageElement.offsetTop;
            // Scroll to the message element's position within the container
            containerElement.scrollTo({
                top: messageTop - containerElement.clientHeight / 2 + messageElement.clientHeight / 2,
                behavior: 'smooth'
            });
        } else {
            console.warn(`No element found with ID: ${messageId}`);
        }
    };

    const highlightText = (text) => {
        const parts = !searchTerm ? [text] : text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <span className="text-l mb-0 word-break break-word hyphens-auto">
                {parts.map((part, index) =>
                    searchTerm && part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={index} style={{ borderRadius: "5px", padding: "5px", backgroundColor: 'rgb(220, 287, 305)' }}>{part}</span>
                    ) : part
                )}
            </span>
        );
    };

    const getMessageStyle = (messageText) => {
        const length = messageText.length;
        if (length <= 15) {
            return "text-l mb-0 px-3 py-1.5 pt-5 min-w-[10%] flex word-break break-word hyphens-auto";
        } else if (length <= 50) {
            return "text-md mb-0 px-3 py-1.5 pt-5 min-w-[30%] flex word-break break-word hyphens-auto";
        } else {
            return "px-3 mb-0 py-1.5 pt-5 flex word-break break-word hyphens-auto";
        }
    };

    const menu = (messageId) => (
        <Menu onClick={({ key }) => handleMenuClick(key, messageId)}>
            <Menu.Item key="edit" icon={<EditOutlined />}>Edit</Menu.Item>
            <Menu.SubMenu
                key="delete"
                icon={<DeleteOutlined />}
                title="Delete"
            >
                <Menu.Item key="confirmDelete">
                    Confirm Delete
                </Menu.Item>
                <Menu.Item key="cancelDelete">
                    Cancel
                </Menu.Item>
            </Menu.SubMenu>
        </Menu>
    );

    const handleMenuClick = async (key, messageId) => {
        console.log(`Menu clicked with key: ${key} and messageId: ${messageId}`);
        if (key === "edit") {
            await editMessage(messageId);
        } else if (key === "confirmDelete") {
            const message = await fetchMessage(messageId);
            onDeleteMessage(messageId);
            socket.emit("deleteMessage", { messageId, token: authHeader().split(" ")[1] });
        }
    };

    const onEmojiClick = async (messageId, emoji) => {
        try {
            const message = messages.find(msg => msg.id === messageId);
            const existingEmoji = message.reactions && Object.values(message.reactions).includes(emoji);
            if (existingEmoji) {
                socket.emit('removeEmojiReaction', { messageId, token: authHeader().split(" ")[1] });
            } else {
                socket.emit('emojiReaction', { messageId, emoji, token: authHeader().split(" ")[1] });
            }
        } catch (error) {
            console.error("Failed to fetch or update message:", error);
        }
    };

    const menuRe = (messageId) => (
        <Menu onClick={(e) => handleMenuClickRe(e, messageId)}>
            <Menu.SubMenu
                key="delete"
                icon={<SmileOutlined />}
                title="Reaction"
            >
                <Menu.Item key="firstEmote">
                    👍
                </Menu.Item>
                <Menu.Item key="secondEmote">
                    ❌
                </Menu.Item>
                <Menu.Item key="thirdEmote">
                    🤔
                </Menu.Item>
                <Menu.Item key="fourthEmote">
                    🔃
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="reply" icon={<MessageOutlined />}>Reply</Menu.Item>
        </Menu>
    );

    const handleMenuClickRe = async (e, messageId) => {
        if (e.key === "firstEmote") {
            await onEmojiClick(messageId, "👍");
        } else if (e.key === "secondEmote") {
            await onEmojiClick(messageId, "❌");
        } else if (e.key === "thirdEmote") {
            await onEmojiClick(messageId, "🤔");
        } else if (e.key === "fourthEmote") {
            await onEmojiClick(messageId, "🔃");
        } else if (e.key === "reply") {
            const messageToReplyTo = await fetchMessage(messageId);
            if (messageToReplyTo) {
                setReplyingTo({ messageId: messageToReplyTo.id, content: messageToReplyTo.content });
            }
        }
    };

    const truncateText = (text, maxLength = 70) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    useEffect(() => {
        // Scroll to bottom of chat container on new messages
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
    setFilteredMessages(messages.filter(message => {
        if (privateChatId) {
            return message.privateChatId === privateChatId;
        } else {
            return !message.privateChatId;
        }
    }));
    }, []);


    useEffect(() => {
        setSubHeaderComponent({
            component: (<Row gutter={16} align="middle" justify="space-between" className="chat-row" style={{ marginTop: "-2px" }}>
                <Col xs={24} md={12} className="mt-2 w-full">
                    <Tabs
                        className="w-full m-0"
                        activeKey={currentTab}
                        onChange={key => setCurrentTab(key)}
                        items={tabsItems}
                    />
                </Col>
                <Col xs={24} md={12} className="flex flex-col md:flex-row justify-end">
                    <div className="flex flex-row w-full md:w-auto mt-2 md:mt-0 items-center">
                        <Search
                            className="md:w-42 md:mb-0"
                            placeholder="Search messages"
                            value={searchTerm}
                            onChange={e => handleSearch(e.target.value)}
                            onSearch={navigateNextResult}
                            onPressEnter={navigateNextResult}
                        />
                        {searchResults.length > 0 && (
                            <div className="ml-4 w-14 text-sm font-medium text-gray-600">
                                {currentResultIndex + 1} / {searchResults.length}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
            )
        });

        return () => setSubHeaderComponent(null); // Clear subheader when unmounting
    }, [currentTab, tabsItems, setSubHeaderComponent, searchTerm]);

    return (
        <div
            id={id}
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto w-full px-4 chat-container-component pb-5 bg-chat-background border-t-2 border-chat-grid relative"
            style={{ borderColor: "rgb(229, 231, 235)", height: "100px" }}>
            {loading ? (
                <div className="flex justify-center items-center h-full">
                    <Spin size="large" />  {/* Spinner shown while loading */}
                </div>
            ) : (
                filteredMessages.map((message, index) => {
                    if (message.deleted) {
                        return null;
                    }
                    const isSender = message.senderId === currentUser?.username;
                    const isAvatar = message.senderId === "Spirit";
                    const messageStyle = getMessageStyle(message.content);
                    const messageMarginTop = index === 0 ? "mt-6" : "";
                    const messageMarginBottom = "mb-6";
                    const isReplyingTo = filteredMessages.find(m => m.id === message.replyingTo);
                    const reactions = message.reactions ? Object.values(message.reactions) : [];
                    const avatarColor = getAvatarColor(message.senderId);

                    return (
                        <div
                            key={message.id}
                            id={`message-${message.id}`}
                            className={`${messageMarginBottom} ${messageMarginTop} flex ${isSender ? "justify-end" : "justify-start"} items-center w-full`}
                        >
                            {isSender && canEditOrDelete(message.timestamp) && (
                                <div className="flex justify-end items-center">
                                    <Dropdown overlay={menu(message.id)} trigger={['click']} placement="bottomRight"
                                        className="p-2">
                                        <MoreOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                    </Dropdown>
                                </div>
                            )}

                            {isSender ? (
                                <>
                                    <div
                                        className={`bg-chat-messages-send shadow-md rounded-lg max-w-[80%] md:max-w-[50%] flex flex-col justify-between ${messageStyle} min-w-24`}
                                        style={{ wordBreak: 'break-word', hyphens: 'auto' }}
                                    >
                                        {isReplyingTo && (
                                            <div className="bg-blue-200 text-sm mb-4 p-1 rounded">
                                                <span className="font-semibold">{truncateText(isReplyingTo.content)}</span>
                                            </div>
                                        )}
                                        {message.isGif ? (
                                            <img src={message.content} alt="GIF" style={{ maxWidth: '100%' }} />
                                        ) : (
                                            <span>{highlightText(message.content)}</span>
                                        )}
                                        <div className="flex items-center">
                                            {reactions.map((reaction, idx) => (
                                                <span key={idx} className="ml-2 text-lg md:text-xl lg:text-2xl"
                                                    onClick={() => onEmojiClick(message.id, reaction)}>
                                                    {reaction}
                                                </span>
                                            ))}
                                        </div>
                                        <span
                                            className="text-sm text-gray-500 self-end">{formatTimestamp(message.timestamp)}</span>
                                    </div>
                                    <div className="relative mt-2 ml-2">
                                        <Avatar className="w-7 h-7 md:w-8 md:h-8 ml-4 md:ml-10 mr-4 md:mr-8"
                                            style={{ backgroundColor: avatarColor }}
                                        >
                                            {message.senderId[0]}
                                        </Avatar>
                                        <div className="text-center text-sm mt-1">{message.senderId}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="relative mt-2 mr-2">
                                        <Avatar className="w-7 h-7 md:w-8 md:h-8 ml-4 md:ml-10 mr-4 md:mr-8"
                                            style={{ backgroundColor: avatarColor }}
                                            src={isAvatar ? spirit : null}
                                        >
                                            {message.senderId[0]}
                                        </Avatar>
                                        <div className="text-center text-sm mt-1">{message.senderId}</div>
                                    </div>
                                    <div
                                        className={` ${isAvatar
                                            ? "bg-[#7D4EBC] text-sm-white" // Light purple for AI messages
                                            : "bg-chat-messages-received"}
                                    shadow-md rounded-lg max-w-[80%] md:max-w-[50%] flex flex-col justify-between ${messageStyle} min-w-24`}
                                        style={{ wordBreak: 'break-word', hyphens: 'auto' }}
                                    >
                                        <div>
                                            {isReplyingTo && (
                                                <div className="bg-blue-200 text-sm mb-4 p-1 rounded">
                                                    <span className="font-semibold">{truncateText(isReplyingTo.content)}</span>
                                                </div>
                                            )}
                                            {message.isGif ? (
                                                <img src={message.content} alt="GIF" style={{ maxWidth: '100%' }} />
                                            ) : (
                                                <span>{highlightText(message.content)}</span>
                                            )}
                                            <div className="flex items-center">
                                                {reactions.map((reaction, idx) => (
                                                    <span key={idx} className="ml-2 text-lg md:text-xl lg:text-2xl"
                                                        onClick={() => onEmojiClick(message.id, reaction)}>
                                                        {reaction}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span
                                            className={`self-end ${isAvatar ? "text-sm-white" : "text-sm"}text-gray-500`}>{formatTimestamp(message.timestamp)}</span>
                                    </div>
                                    <Dropdown overlay={menuRe(message.id)} trigger={['click']} placement="bottomLeft"
                                        className="p-2">
                                        <MoreOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                                    </Dropdown>
                                </>
                            )}
                        </div>
                    );
                })
            )}
            <div ref={lastMessageRef} />
            <div className="absolute left-0 right-0 px-4 pb-4 flex justify-center">
                {typingUser && (typingUser.teamId === currentUser.team_id || typingUser.privateChatId === privateChatId) && (
                    <div className="text-gray-500 text-lg">
                        {typingUser.user} is typing...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBody;
