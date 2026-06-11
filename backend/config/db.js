// =====================================================
// DB.JS — MongoDB Database Connection
// =====================================================
// PDF Reference: "Install MongoDB on your system" + "Create a MongoDB database to store application data"
//
// THIS FILE DOES:
// 1. Connects to MongoDB using Mongoose (an ODM library)
// 2. Uses the connection string from .env file (MONGO_URI)
// 3. Logs success or exits on failure
//
// WHY Mongoose instead of native MongoDB driver?
//   - Mongoose provides: Schema validation, middleware (pre/post hooks), 
//     easy relationships via populate(), and cleaner syntax
//   - Alternative: Native 'mongodb' driver gives more control but requires
//     writing more boilerplate code for validation, schema enforcement, etc.
//
// WHY separate this into config/db.js?
//   - Keeps database logic isolated from server setup
//   - If we switch from local MongoDB to Atlas (cloud), we only change .env
//   - Easy to mock in tests
// =====================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code — server can't work without DB
  }
};

module.exports = connectDB;
