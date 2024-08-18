const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const axios = require('axios');
const SECRET_KEY = process.env.SECRET_KEY;


const socketIO = require('socket.io')(http, {
    cors: {
        origin: "https://spirit.lfe.ed.tum.de",
        methods: ["GET", "POST"]
    },
    perMessageDeflate: false 
});

// Middleware to verify token on connection
/*socketIO.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    console.log(token);
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY);
        socket.user = payload; // Attach user data to the socket instance
        next(); // Proceed to connection
    } catch (err) {
        return next(new Error('Authentication error'));
    }
});*/



app.use(cors());
app.use(express.json());

// Store user connections
const userConnections = {};

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

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
            const response = await axios.post('https://spirit.lfe.ed.tum.de/api/chat/new-message', {
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
                socketIO.to(data.privateChatId).emit('newMessageMetadata', response.data);
                socketIO.to(data.privateChatId).emit("messageResponse", response.data);
            } else {
                socketIO.to(data.teamId).emit('newMessageMetadata', response.data);
                socketIO.to(data.teamId).emit("messageResponse", response.data);
            }
        } catch (err) {
            console.error(err);
        }
    });

    // socket.on("teamMembersUpdated", (teamId) => {
    //     socketIO.to(teamId).emit("teamMembersUpdated");
    // });

    socket.on("emojiReaction", async ({messageId, emoji, token}) => {
        try {
            const response = await axios.put(`https://spirit.lfe.ed.tum.de/api/chat/add-reaction/${messageId}`, {emoji}, {
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

    socket.on('userOnline', (data) => {
        const {username, team_id} = data;
        console.log(`User ${username} of team ${team_id} is online`);

        function addSocketId(team_id, username) {
            if (!userConnections[team_id]) {
                userConnections[team_id] = {[username]: socket.id};
            } else {
                userConnections[team_id][username] = socket.id;
            }
            socketIO.emit('updateUserStatus', { data: userConnections[team_id] });
        }
        addSocketId(team_id, username);
        console.log('Current online users:', JSON.stringify(userConnections, null, 2));
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} user just disconnected!`);
        function removeSocketId(socketId) {
            let data;
            for (const team_id in userConnections) {
                for (const username in userConnections[team_id]) {
                    if (userConnections[team_id][username] === socketId) {
                        data = {team_id, username};
                    }
                }
            }
            if (data) {
                const {team_id, username} = data;
                if (userConnections[team_id]) {
                    delete userConnections[team_id][username];
                }
                if (Object.keys(userConnections[team_id]).length === 0) {
                    delete userConnections[team_id];
                }
                socketIO.emit('updateUserStatus', { data: userConnections[team_id] ?? {} });
            }
        }
        socketIO.emit('userDisconnected', {});
        removeSocketId(socket.id);
        console.log('Current online users:', JSON.stringify(userConnections, null, 2));
    });

    socket.on("removeEmojiReaction", async ({messageId, token}) => {
        try {
            const response = await axios.put(`https://spirit.lfe.ed.tum.de/api/chat/remove-reaction/${messageId}`, {}, {
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
            const response = await axios.delete(`https://spirit.lfe.ed.tum.de/api/chat/delete-message/${messageId}`, {
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
            const response = await axios.put(`https://spirit.lfe.ed.tum.de/api/chat/edit-message/${updatedMessage.id}`, {
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
