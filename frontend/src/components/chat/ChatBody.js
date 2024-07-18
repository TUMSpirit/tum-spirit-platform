import React, {useState, useEffect, useRef} from 'react';
import {Button, ConfigProvider, Tabs, Dropdown, Menu, Avatar} from "antd";
import {EditOutlined, DeleteOutlined, SmileOutlined, MessageOutlined, MoreOutlined} from '@ant-design/icons';
import {useSubHeaderContext} from "../../layout/SubHeaderContext";
import Search from "antd/es/input/Search";
import axios from 'axios';
import {useAuthHeader} from 'react-auth-kit';

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
                      onScroll,
                      teamMembers,
                      privateChatId,
                      currentUserAvatarColor
                  }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const {updateSubHeader} = useSubHeaderContext();
    const authHeader = useAuthHeader();

    const tabsItems = [
        {key: '1', label: 'Group Chat', children: ''},
        ...teamMembers.map((member, index) => ({
            key: (index + 2).toString(),
            label: member.username,
            children: ''
        })),
    ];

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
            const response = await axios.get(`http://localhost:8000/api/chat/get-message/${messageId}`, {
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
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        if (!value.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
        } else {
            const lowerCaseTerm = value.toLowerCase();
            const foundIndexes = messages
                .map((message, index) => ({text: message.content.toLowerCase(), index}))
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
        const messageId = messages[index].id;
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        }
    };

    const highlightText = (text) => {
        const parts = !searchTerm ? [text] : text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <p className="text-xl word-break break-word hyphens-auto">
                {parts.map((part, index) =>
                    searchTerm && part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={index} style={{backgroundColor: 'yellow'}}>{part}</span>
                    ) : part
                )}
            </p>
        );
    };

    const getMessageStyle = (messageText) => {
        const length = messageText.length;
        if (length <= 15) {
            return "text-xl px-3 py-1.5 pt-5 min-w-[10%] flex word-break break-word hyphens-auto";
        } else if (length <= 50) {
            return "text-md px-3 py-1.5 pt-5 min-w-[30%] flex word-break break-word hyphens-auto";
        } else {
            return "px-3 py-1.5 pt-5 flex word-break break-word hyphens-auto";
        }
    };

    const menu = (messageId) => (
        <Menu onClick={({key}) => handleMenuClick(key, messageId)}>
            <Menu.Item key="edit" icon={<EditOutlined/>}>Edit</Menu.Item>
            <Menu.SubMenu
                key="delete"
                icon={<DeleteOutlined/>}
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
            socket.emit("deleteMessage", {messageId, token: authHeader().split(" ")[1]});
        }
    };

    const onEmojiClick = async (messageId, emoji) => {
        try {
            const message = messages.find(msg => msg.id === messageId);
            const existingEmoji = message.reactions && Object.values(message.reactions).includes(emoji);
            if (existingEmoji) {
                socket.emit('removeEmojiReaction', {messageId, token: authHeader().split(" ")[1]});
            } else {
                socket.emit('emojiReaction', {messageId, emoji, token: authHeader().split(" ")[1]});
            }
        } catch (error) {
            console.error("Failed to fetch or update message:", error);
        }
    };

    const menuRe = (messageId) => (
        <Menu onClick={(e) => handleMenuClickRe(e, messageId)}>
            <Menu.SubMenu
                key="delete"
                icon={<SmileOutlined/>}
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
            <Menu.Item key="reply" icon={<MessageOutlined/>}>Reply</Menu.Item>
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
                setReplyingTo({messageId: messageToReplyTo.id, content: messageToReplyTo.content});
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
        const subHeaderContent = (
            <div className="flex flex-col md:flex-row justify-between items-center w-full -mb-2 relative">
                <ConfigProvider
                    theme={{
                        token: {
                            lineHeight: 1.3,
                            lineWidth: 10,
                        },
                    }}
                >
                    <div className="h-14 mt-0 w-full md:w-auto">
                        <Tabs
                            activeKey={currentTab}
                            onChange={(key) => setCurrentTab(key)}
                            items={tabsItems}
                            size="large"
                            tabBarStyle={{
                                marginTop: '4px',
                                borderBottom: 'none'
                            }}
                        />
                    </div>
                </ConfigProvider>
                <div className="hidden md:flex flex-grow justify-center -mt-2">
                    <div className="h-15 flex items-center gap-5 bg-chat-filter rounded-2xl py-2 px-4">
                        <Button className="bg-white shadow-sm border-gray-300">Kanban Cards</Button>
                        <Button className="bg-white shadow-sm border-gray-300">Polls</Button>
                        <Button className="bg-white shadow-sm border-gray-300">Documents</Button>
                    </div>
                </div>
                <div className="hidden md:block -mt-2">
                    <Search
                        placeholder="input search text"
                        size="large"
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                        onSearch={handleSearch}
                        onPressEnter={navigateSearchResults}
                        className="max-w-[300px]"
                    />
                </div>
                <div className="border-t-2 border-gray-200 absolute bottom-0 w-full"></div>
            </div>
        );
        updateSubHeader(subHeaderContent);
        return () => updateSubHeader(null);
    }, [currentTab, searchTerm, updateSubHeader, teamMembers]);

    useEffect(() => {
        if (searchTerm && currentResultIndex !== -1 && searchResults.length > 0) {
            scrollToMessage(searchResults[currentResultIndex]);
        }
    }, [currentResultIndex, searchResults, messages, searchTerm]);

    const filteredMessages = messages.filter(message => {
        if (privateChatId) {
            return message.privateChatId === privateChatId;
        } else {
            return !message.privateChatId;
        }
    });

    return (
        <div id={id}
             className="flex-grow overflow-y-auto w-full px-4 pb-20 bg-chat-background border-t-4 border-chat-grid relative"
             onScroll={onScroll}>
            {filteredMessages.map((message, index) => {
                if (message.deleted) {
                    return null;
                }
                const isSender = message.senderId === currentUser?.username;
                const messageStyle = getMessageStyle(message.content);
                const messageMarginTop = index === 0 ? "mt-6" : "";
                const messageMarginBottom = "mb-6";
                const isReplyingTo = filteredMessages.find(m => m.id === message.replyingTo);
                const reactions = message.reactions ? Object.values(message.reactions) : [];
                const avatarColor = getAvatarColor(message.senderId);

                return (
                    <div key={message.id} id={`message-${message.id}`}
                         className={`${messageMarginBottom} ${messageMarginTop} flex ${isSender ? "justify-end" : "justify-start"} items-center w-full`}>
                        {isSender && canEditOrDelete(message.timestamp) && (
                            <div className="flex justify-end items-center">
                                <Dropdown overlay={menu(message.id)} trigger={['click']} placement="bottomRight"
                                          className="p-2">
                                    <MoreOutlined style={{fontSize: '20px', color: '#1890ff'}}/>
                                </Dropdown>
                            </div>
                        )}

                        {isSender ? (
                            <>
                                <div
                                    className={`bg-chat-messages-send shadow-md rounded-lg max-w-[80%] md:max-w-[50%] flex flex-col justify-between ${messageStyle}`}
                                    style={{wordBreak: 'break-word', hyphens: 'auto'}}>
                                    {isReplyingTo && (
                                        <div className="bg-blue-200 text-sm mb-4 p-1 rounded">
                                            <span className="font-semibold">{truncateText(isReplyingTo.content)}</span>
                                        </div>
                                    )}
                                    {message.isGif ? (
                                        <img src={message.content} alt="GIF" style={{maxWidth: '100%'}}/>
                                    ) : (
                                        <p>{highlightText(message.content, searchTerm)}</p>
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
                                <Avatar className="w-8 h-8 md:w-12 md:h-12 ml-4 md:ml-10 mr-4 md:mr-8"
                                        style={{backgroundColor: avatarColor}}>
                                    {message.senderId[0]}
                                </Avatar>
                            </>
                        ) : (
                            <>
                                <Avatar className="w-8 h-8 md:w-12 md:h-12 ml-4 md:ml-10 mr-4 md:mr-8"
                                        style={{backgroundColor: avatarColor}}>
                                    {message.senderId[0]}
                                </Avatar>
                                <div
                                    className={`bg-chat-messages-received shadow-md rounded-lg max-w-[80%] md:max-w-[50%] flex flex-col justify-between ${messageStyle}`}
                                    style={{wordBreak: 'break-word', hyphens: 'auto'}}>
                                    <div>
                                        {isReplyingTo && (
                                            <div className="bg-blue-200 text-sm mb-4 p-1 rounded">
                                                <span
                                                    className="font-semibold">{truncateText(isReplyingTo.content)}</span>
                                            </div>
                                        )}
                                        {message.isGif ? (
                                            <img src={message.content} alt="GIF" style={{maxWidth: '100%'}}/>
                                        ) : (
                                            <p>{highlightText(message.content, searchTerm)}</p>
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
                                        className="text-sm text-gray-500 self-end">{formatTimestamp(message.timestamp)}</span>
                                </div>
                                <Dropdown overlay={menuRe(message.id)} trigger={['click']} placement="bottomLeft"
                                          className="p-2">
                                    <MoreOutlined style={{fontSize: '20px', color: '#1890ff'}}/>
                                </Dropdown>
                            </>
                        )}
                    </div>
                );
            })}
            <div ref={lastMessageRef}/>
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
