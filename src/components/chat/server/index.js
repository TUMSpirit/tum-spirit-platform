const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
const PORT = 4000;
const fs = require('fs');

const rawData = fs.readFileSync('messages.json');
const messagesData = JSON.parse(rawData);
const pollData = fs.existsSync('pollresults.json') ? JSON.parse(fs.readFileSync('pollresults.json')) : [];

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(cors());

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on("message", data => {
        if (data.isPoll) {
            const pollOptions = data.text.replace('/Create Poll:', '').split(',').map(item => item.trim());
            const newPoll = {
                id: data.id,
                votes: Array(pollOptions.length).fill(0)
            };
            pollData.push(newPoll);
            fs.writeFileSync('pollresults.json', JSON.stringify(pollData, null, 2), 'utf8');
            socketIO.emit('pollUpdated', pollData);
        }

        messagesData["messages"].push(data);
        const stringData = JSON.stringify(messagesData, null, 2);
        fs.writeFile("messages.json", stringData, (err) => {
            if (err) console.error(err);
        });
        socketIO.emit("messageResponse", data);
    });

    socket.on("emojiReaction", ({ messageId, emoji }) => {
        const messageIndex = messagesData.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            messagesData.messages[messageIndex].reaction = emoji;
            fs.writeFileSync('messages.json', JSON.stringify(messagesData, null, 2), 'utf8');
            socketIO.emit('emojiReactionUpdated', messagesData.messages[messageIndex]);
        }
    });

    socket.on("deleteMessage", messageId => {
        messagesData["messages"] = messagesData["messages"].filter(message => message.id !== messageId);
        const stringData = JSON.stringify(messagesData, null, 2);
        fs.writeFile("messages.json", stringData, (err) => {
            if (err) console.error(err);
        });
        socketIO.emit("messagesUpdated", messagesData["messages"]);
    });

    socket.on('editMessage', (updatedMessage) => {
        const index = messagesData.messages.findIndex(msg => msg.id === updatedMessage.id);
        if (index !== -1) {
            messagesData.messages[index] = updatedMessage;
            fs.writeFileSync('messages.json', JSON.stringify(messagesData, null, 2), 'utf8');
            socketIO.emit('messageUpdated', updatedMessage);
        }
    });

    socket.on("removeEmojiReaction", ({ messageId }) => {
        const messageIndex = messagesData.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            delete messagesData.messages[messageIndex].reaction;
            fs.writeFileSync('messages.json', JSON.stringify(messagesData, null, 2), 'utf8');
            socketIO.emit('emojiReactionRemoved', messagesData.messages[messageIndex]);
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
});

app.get('/api', (req, res) => {
    const chatId = req.query.chatId || '1';
    let filePath;

    switch (chatId) {
        case '1':
            filePath = 'messages.json';
            break;
        case '2':
            filePath = 'messagesChat2.json';
            break;
        case '3':
            filePath = 'messagesChat3.json';
            break;
        case '4':
            filePath = 'messagesChat4.json';
            break;
        default:
            return res.status(400).send('Ungültige Chat-ID');
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Fehler beim Lesen der Nachrichten');
        }
        res.json(JSON.parse(data));
    });
});

app.get('/api/polls', (req, res) => {
    res.json(pollData);
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});