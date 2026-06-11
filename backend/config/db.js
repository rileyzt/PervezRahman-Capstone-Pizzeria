// DB.JS - MongoDB Database Connection
// PDF Question Reference: "Install MongoDB on your system" + "Create a MongoDB database to store application data"
//
// THIS FILE DOES:
// 1. Connects to MongoDB using Mongoose 
// 2. Uses the connection string from .env file (MONGO_URI)
// 3. Logs success or exits on failure


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
