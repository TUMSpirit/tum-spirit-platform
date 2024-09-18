import React, { useState, useEffect, useRef } from 'react';
import { useUnreadMessage } from '../context/UnreadMessageContext';
import ChatBody from '../components/Chat/ChatBody';
import ChatFooter from '../components/Chat/ChatFooter';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import { useSocket } from '../context/SocketProvider';

const Chat = () => {
    const { currentUser, socket, updateLastLoggedIn } = useSocket();
    const { markAsRead, getUnreadMessages } = useUnreadMessage();
    const [messages, setMessages] = useState([]);
    const [currentTab, setCurrentTab] = useState('1');
    const [privateChatId, setPrivateChatId] = useState(null);
    const [messagePage, setMessagePage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [teamMembers, setTeamMembers] = useState([]);
    const authHeader = useAuthHeader();
    const lastMessageRef = useRef(null);

    // Debounced tab switch to avoid quick switching issues
    const [switchingTab, setSwitchingTab] = useState(false);

    // Fetch team members (asynchronous)
    const fetchTeamMembers = async () => {
        if (currentUser && teamMembers.length === 0) {
            try {
                const response = await axios.get('/api/get-team-members', {
                    headers: { 'Authorization': authHeader() },
                });
                const members = response.data.filter(member => member.username !== currentUser.username);
                setTeamMembers(members);
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            }
        }
    };

    // Fetch messages (asynchronous)
    const fetchMessages = async (reset = false) => {
        if (!currentUser || !hasMoreMessages) return;

        try {
            const response = await axios.get(`/api/chat/get-messages?page=${messagePage}`, {
                headers: { 'Authorization': authHeader() },
            });

            if (reset) {
                setMessages(response.data);
            } else {
                setMessages(prevMessages => [...prevMessages, ...response.data]);
            }

            if (response.data.length === 0) {
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    // Fetch team members and messages when component mounts
    useEffect(() => {
        fetchTeamMembers();
        fetchMessages(true); // Initial message fetch
    }, [currentUser]);

    // Update messages and tab switch logic
    const handleTabChange = async (key) => {
        if (switchingTab) return; // Prevent tab switching during debounce

        setSwitchingTab(true); // Debounce flag
        setCurrentTab(key);
        setMessages([]); // Clear messages for new tab
        setMessagePage(1); // Reset page count
        setHasMoreMessages(true); // Reset message fetching

        const selectedMember = teamMembers[parseInt(key) - 2]?.username;
        const newPrivateChatId = selectedMember
            ? getPrivateChatId(currentUser.username, selectedMember)
            : null;

        setPrivateChatId(newPrivateChatId);

        if (newPrivateChatId) {
            await updateLastLoggedIn(selectedMember);
            markAsRead(newPrivateChatId);
            socket.emit('joinPrivateChat', newPrivateChatId);
        } else {
            await updateLastLoggedIn("Team");
            markAsRead("Team");
            socket.emit('joinTeam', currentUser.team_id);
        }

        await fetchMessages(true); // Fetch new messages for the selected tab

        // Debounce tab switching by 500ms to avoid rapid tab switches
        setTimeout(() => setSwitchingTab(false), 300);
    };

    const getPrivateChatId = (user1, user2) => [user1, user2].sort().join('-');

    return (
        <div className="mx-auto flex flex-col" style={{ height: `100%` }}>
            <ChatBody
                id="chat-body"
                currentTab={currentTab}
                setCurrentTab={handleTabChange}
                messages={messages}
                lastMessageRef={lastMessageRef}
                socket={socket}
                currentUser={currentUser}
                teamMembers={teamMembers}
                privateChatId={privateChatId}
                getUnreadMessages={getUnreadMessages}
                loading={!messages.length && hasMoreMessages} // Show loading spinner if messages are being fetched
            />
            <ChatFooter
                socket={socket}
                currentUser={currentUser}
                currentTab={currentTab}
                teamMembers={teamMembers}
                privateChatId={privateChatId}
            />
        </div>
    );
};

export default Chat;
