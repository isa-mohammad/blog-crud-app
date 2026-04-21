const connectToDB = () => {
    const mongoose = require('mongoose');
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blogdb';
    return mongoose.connect(MONGO_URI);
};

module.exports = { connectToDB };