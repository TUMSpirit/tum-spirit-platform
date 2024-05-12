import React, {useState, useEffect} from 'react';
import {Button, Tabs} from "antd";
import Search from "antd/es/input/Search";
import './index.css';
import {EditOutlined, DeleteOutlined, CloseOutlined, CheckOutlined} from '@ant-design/icons';
import Picker from "emoji-picker-react";
import {SubHeader} from "../layout/SubHeader";

const tabsItems = [
    {
        key: '1',
        label: 'Group Chat',
        children: '',
    },
    {
        key: '2',
        label: 'Martin',
        children: '',
    },
    {
        key: '3',
        label: 'Peter',
        children: '',
    },
    {
        key: '4',
        label: 'Sophie',
        children: '',
    },
];

const ChatBody = ({
                      currentTab,
                      setCurrentTab,
                      socket,
                      messages,
                      lastMessageRef,
                      setEditingMessage,
                      onDeleteMessage,
                      onRemoveReaction
                  }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null);
    const [messageReactions, setMessageReactions] = useState({});
    const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
    const [messageIdToBeDeleted, setMessageIdToBeDeleted] = useState(null);
    const [confirmDialogPosition, setConfirmDialogPosition] = useState({top: 0, left: 0});
    const senderIcon = require('../../assets/images/avatar3.png');
    const recipientIcon = require('../../assets/images/avatar2.png');
    const handleTabChange = (key) => {
        setCurrentTab(key);
    };

    const canEditOrDelete = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        return diff <= 5 * 60 * 1000;
    };

    const editMessage = (messageId) => {
        const messageToEdit = messages.find(message => message.id === messageId);
        if (messageToEdit) {
            setEditingMessage(messageToEdit);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const handleSearch = (term) => {
        if (!term.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }

        const lowerCaseTerm = term.toLowerCase();
        const foundIndexes = messages
            .map((message, index) => ({text: message.text.toLowerCase(), index}))
            .filter(message => message.text.includes(lowerCaseTerm))
            .map(message => message.index)
            .reverse();

        setSearchResults(foundIndexes);
        setCurrentResultIndex(0);
    };

    const navigateSearchResults = (direction) => {
        if (searchResults.length === 0) return;
        setCurrentResultIndex(prev => {
            let newIndex = prev + direction;
            if (newIndex < 0) newIndex = searchResults.length - 1;
            else if (newIndex >= searchResults.length) newIndex = 0;
            return newIndex;
        });
    };

    const highlightText = (text, term) => {
        if (!term) return text;
        const parts = text.split(new RegExp(`(${term})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === term.toLowerCase() ?
                <span key={index} style={{backgroundColor: 'yellow'}}>{part}</span> : part
        );
    };

    const toggleEmojiPicker = messageId => {
        setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId);
    };

    const onEmojiClick = (messageId, emojiObject) => {
        socket.emit('emojiReaction', {messageId, emoji: emojiObject.emoji});

        const updatedMessages = messages.map(msg => {
            if (msg.id === messageId) {
                return {...msg, reaction: emojiObject.emoji};
            }
            return msg;
        });
        onRemoveReaction(updatedMessages);
    };

    useEffect(() => {
        if (searchResults.length > 0 && currentResultIndex !== -1) {
            const messageId = messages[searchResults[currentResultIndex]].id;
            document.getElementById(messageId).scrollIntoView({behavior: "smooth", block: "center"});
        }
    }, [currentResultIndex, searchResults, messages]);

    return (
        <div>
            <SubHeader>
            <div className="bg-white w-[calc(100vw-250px)] flex items-center justify-between "
                 style={{borderBottom: '2px solid #efefef'}}>
                <div className="flex-grow-0">
                    <Tabs activeKey={currentTab} onChange={handleTabChange} items={tabsItems} size={"large"}/>
                </div>
                <div className="flex-grow" style={{display: 'flex', justifyContent: 'center'}}>
                    <div className="flex items-center font-bold gap-4"
                         style={{backgroundColor: '#f5f7fb', borderRadius: '6px', padding: '6px 8px'}}>
                        <Button className="bg-white shadow-button">Kanban Cards</Button>
                        <Button className="bg-white shadow-button">Calendar Entries</Button>
                        <Button className="bg-white shadow-button">Polls</Button>
                        <Button className="bg-white shadow-button">Documents</Button>
                    </div>
                </div>
                <div className="flex-grow-0">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        navigateSearchResults(1);
                    }}>
                        <Search
                            className="customSearchIcon"
                            placeholder="input search text"
                            size="large"
                            style={{maxWidth: '300px'}}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onSearch={handleSearch}
                            onPressEnter={() => navigateSearchResults(1)}
                        />
                    </form>
                </div>
            </div>
            </SubHeader>
            <div className='message__container' style={{ paddingTop: '20px' }}>
                {messages.map((message) => {
                    if (message.deleted) {
                        return null;
                    }
                    return (
                        <div key={message.id} id={message.id}
                             className={message.name === localStorage.getItem("userName") ? "message__sender__format" : "message__recipient__format"}>
                            {message.name === localStorage.getItem("userName") && canEditOrDelete(message.timestamp) && (
                                <div className="message__edit__delete">
                                    <EditOutlined onClick={() => editMessage(message.id)}
                                                  style={{marginRight: 8, fontSize: '16px'}}/>
                                    <DeleteOutlined
                                        onClick={(e) => {
                                            const messageRect = e.target.closest('.message__sender__format, .message__recipient__format').getBoundingClientRect();
                                            const dialogWidthEstimate = -1480;
                                            const leftPosition = messageRect.left - dialogWidthEstimate - 10;

                                            setConfirmDialogPosition({top: messageRect.top, left: leftPosition});
                                            setMessageIdToBeDeleted(message.id);
                                            setIsConfirmDialogVisible(true);
                                        }}
                                        style={{fontSize: '16px'}}
                                    />
                                </div>
                            )}
                            {message.name === localStorage.getItem("userName") ? (
                                <>
                                    <div className='message__sender'>
                                        <p>{highlightText(message.text, searchTerm)}</p>
                                        <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                                    </div>
                                    <img src={senderIcon} alt="Sender Icon" className="message__sender__icon"/>
                                </>
                            ) : (
                                <>
                                    <img src={recipientIcon} alt="Recipient Icon" className="message__recipient__icon"/>
                                    <div className='message__recipient'>
                                        <p>{highlightText(message.text, searchTerm)}</p>
                                        {message.reaction && (
                                            <span style={{marginLeft: '10px', cursor: 'pointer'}} onClick={() => {
                                                socket.emit('removeEmojiReaction', {messageId: message.id});
                                            }}>{message.reaction}</span>
                                        )}
                                        <span className="message-timestamp">{formatTimestamp(message.timestamp)}</span>
                                    </div>
                                    <button onClick={() => toggleEmojiPicker(message.id)} className="emoji-button">😀
                                    </button>
                                    {showEmojiPicker === message.id && (
                                        <div className="emoji-picker-container">
                                            <Picker onEmojiClick={(emojiData) => onEmojiClick(message.id, emojiData)}/>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
                <div ref={lastMessageRef}/>
            </div>
            {isConfirmDialogVisible && (
                <div style={{
                    position: 'absolute',
                    top: `${confirmDialogPosition.top}px`,
                    left: `${confirmDialogPosition.left}px`,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    width: '200px',
                }}>
                    <p>Delete this message?</p>
                    <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '10px'}}>
                        <Button
                            icon={<CloseOutlined/>}
                            onClick={() => {
                                setIsConfirmDialogVisible(false);
                                setMessageIdToBeDeleted(null);
                            }}
                        >No</Button>
                        <Button
                            icon={<CheckOutlined/>}
                            onClick={() => {
                                onDeleteMessage(messageIdToBeDeleted);
                                setIsConfirmDialogVisible(false);
                                setMessageIdToBeDeleted(null);
                            }}
                        >Yes</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBody;
