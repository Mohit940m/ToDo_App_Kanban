const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().select('name email');
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUsers();