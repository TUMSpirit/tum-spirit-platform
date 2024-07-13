const mongoose = require('mongoose');

const MONGO_URI = "mongodb://root:example@localhost:27017/?authSource=admin";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB", err);
});

module.exports = mongoose;