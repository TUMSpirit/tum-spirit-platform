const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const MONGO_URI = process.env.MONGO_URI;

//const MONGO_URI = "mongodb://root:example@mongo:27017/?authSource=admin";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB", err);
});

module.exports = mongoose;