const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const mongoose = require('./db');
const Message = require('./message');
const axios = require('axios');
const fs = require("fs");
const pollData = fs.existsSync('pollresults.json') ? JSON.parse(fs.readFileSync('pollresults.json')) : [];

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(cors());
app.use(express.json());

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on("message", async (data) => {
        if (data.isPoll) {
            const pollOptions = data.content.replace('/Create Poll:', '').split(',').map(item => item.trim());
            const newPoll = {
                id: data.id,
                votes: Array(pollOptions.length).fill(0)
            };
            pollData.push(newPoll);
            fs.writeFileSync('pollresults.json', JSON.stringify(pollData, null, 2), 'utf8');
            socketIO.emit('pollUpdated', pollData);
        }
        try {
            const response = await axios.post('http://localhost:8000/api/chat/new-message', {
                teamId: data.teamId,
                content: data.content,
                senderId: data.senderId,
                timestamp: new Date(data.timestamp).toISOString(),
                replyingTo: data.replyingTo || null,
                reactions: data.reactions || {},
                isGif: data.isGif
            }, {
                headers: {
                    "Authorization": `Bearer ${data.token}`
                }
            });
            socketIO.emit("messageResponse", response.data);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("votePoll", (pollId, optionIndex) => {
        const pollIndex = pollData.findIndex(poll => poll.id === pollId);
        if (pollIndex !== -1) {
            pollData[pollIndex].votes[optionIndex] += 1;
        }
        fs.writeFileSync('pollresults.json', JSON.stringify(pollData, null, 2), 'utf8');
        socketIO.emit('pollUpdated', pollData);
    });

    socket.emit('initialPollData', pollData);

    socket.on("emojiReaction", async ({ messageId, emoji, token }) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/chat/add-reaction/${messageId}`, { emoji }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            socketIO.emit('emojiReactionUpdated', response.data);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('stop typing', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on("removeEmojiReaction", async ({ messageId, token }) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/chat/remove-reaction/${messageId}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            socketIO.emit('emojiReactionRemoved', response.data);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on("deleteMessage", async ({ messageId, token }) => {
        try {
            const response = await axios.delete(`http://localhost:8000/api/chat/delete-message/${messageId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                socketIO.emit('messageDeleted', messageId);
            }
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('editMessage', async (updatedMessage) => {
        try {
            console.log(`Editing message with ID: ${updatedMessage.id}`);
            const response = await axios.put(`http://localhost:8000/api/chat/edit-message/${updatedMessage.id}`, {
                teamId: updatedMessage.teamId,
                content: updatedMessage.content,
                senderId: updatedMessage.senderId,
                timestamp: updatedMessage.timestamp,
                replyingTo: updatedMessage.replyingTo || null,
                reactions: updatedMessage.reactions || {},
                isGif: updatedMessage.isGif
            }, {
                headers: {
                    "Authorization": `Bearer ${updatedMessage.token}`
                }
            });
            socketIO.emit('messageUpdated', response.data);
        } catch (err) {
            console.error(err);
        }
    });
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
