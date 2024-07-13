const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    teamId: String,
    content: String,
    senderId: String,
    timestamp: { type: Date, default: Date.now },
    replyingTo: { type: String, default: null },
    reactions: { type: Map, of: String, default: {} },
    isGif: { type: Boolean, default: false }  // Store if the message is a GIF
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
