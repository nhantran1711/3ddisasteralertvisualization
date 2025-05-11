const mongoose = require('mongoose');
require('dotenv').config();

// Connect MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000 
        });
        console.log("MongoDB connected");
        console.log("Mongo URI: ", process.env.MONGO_URI);
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
    }
};

module.exports = connectDB;
