
// make admin file using update function

require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'rileyzt.0ai@gmail.com' },
    { $set: { role: 'admin' } }
  );

  console.log('Updated', result.modifiedCount, 'user(s) to admin');
  await mongoose.disconnect();
}

run();
