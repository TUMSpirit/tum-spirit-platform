const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const axios = require('axios');

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(cors());
app.use(express.json());

// Store user connections
const userConnections = {};

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.emit('currentOnlineUsers', Object.keys(userConnections).map(userId => ({ userId, status: 'online' })));

    // Join team room
    socket.on('joinTeam', (teamId) => {
        socket.join(teamId);
        console.log(`User ${socket.id} joined team ${teamId}`);
    });

    // Join private chat
    socket.on('joinPrivateChat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined private chat ${chatId}`);
    });

    socket.on("message", async (data) => {
        try {
            const response = await axios.post('http://localhost:8000/api/chat/new-message', {
                teamId: data.teamId,
                content: data.content,
                senderId: data.senderId,
                timestamp: new Date(data.timestamp).toISOString(),
                replyingTo: data.replyingTo || null,
                reactions: data.reactions || {},
                isGif: data.isGif,
                privateChatId: data.privateChatId || null  // Add privateChatId
            }, {
                headers: {
                    "Authorization": `Bearer ${data.token}`
                }
            });
            if (data.privateChatId) {
                socketIO.to(data.privateChatId).emit("messageResponse", response.data);
            } else {
                socketIO.to(data.teamId).emit("messageResponse", response.data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("teamMembersUpdated", (teamId) => {
        socketIO.to(teamId).emit("teamMembersUpdated");
    });

    socket.on("emojiReaction", async ({messageId, emoji, token}) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/chat/add-reaction/${messageId}`, {emoji}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            socketIO.to(response.data.teamId).emit('emojiReactionUpdated', response.data);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('typing', (data) => {
        console.log('User typing:', data);
        if (data.privateChatId) {
            socket.to(data.privateChatId).emit('typing', data);
        } else {
            socket.to(data.teamId).emit('typing', data);
        }
    });

    socket.on('stop typing', (data) => {
        console.log('User stopped typing:', data);
        if (data.privateChatId) {
            socket.to(data.privateChatId).emit('stop typing', data);
        } else {
            socket.to(data.teamId).emit('stop typing', data);
        }
    });

    socket.on('userOnline', (userId) => {
        userConnections[userId] = socket.id;
        socketIO.emit('updateUserStatus', { userId, status: 'online' });
    });

    socket.on('disconnect', () => {
        const userId = Object.keys(userConnections).find(key => userConnections[key] === socket.id);
        if (userId) {
            delete userConnections[userId];
            socketIO.emit('updateUserStatus', { userId, status: 'offline' });
        }
    });

    socket.on("removeEmojiReaction", async ({messageId, token}) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/chat/remove-reaction/${messageId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            socketIO.to(response.data.teamId).emit('emojiReactionRemoved', response.data);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('newMessage', (message) => {
        // Broadcast the new message to all clients in the same team
        console.log("test new Message");
        socketIO.to(message.teamId).emit('newMessage', message);
        // Optionally, you might want to handle private chat messages differently
        // io.to(message.privateChatId).emit('messageNotification', message);
    });
    
    socket.on("deleteMessage", async ({messageId, token}) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/chat/delete-message/${messageId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                console.log(`Message with ID: ${messageId} deleted successfully.`);
                socketIO.to(response.data.teamId).emit('messageDeleted', {messageId, teamId: response.data.teamId});
            }
        } catch (err) {
            console.error(`Failed to delete message with ID: ${messageId}. Error: ${err}`);
        }
    });

    socket.on("editMessage", async (updatedMessage) => {
        try {
            console.log(`Editing message with ID: ${updatedMessage.id}`);
            const response = await axios.put(`http://localhost:8000/api/chat/edit-message/${updatedMessage.id}`, {
                teamId: updatedMessage.teamId,
                content: updatedMessage.content,
                senderId: updatedMessage.senderId,
                timestamp: updatedMessage.timestamp,
                replyingTo: updatedMessage.replyingTo || null,
                reactions: updatedMessage.reactions || {},
                isGif: updatedMessage.isGif,
                privateChatId: updatedMessage.privateChatId || null // Add privateChatId
            }, {
                headers: {
                    "Authorization": `Bearer ${updatedMessage.token}`
                }
            });
            socketIO.to(response.data.teamId).emit('messageUpdated', response.data);
        } catch (err) {
            console.error(err);
        }
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
