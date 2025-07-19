const mongoose = require('mongoose');
const ActionLog = require('./models/actionLogModel');
const User = require('./models/User');
const Task = require('./models/Task');
const dotenv = require('dotenv');

dotenv.config();

const testActivityLog = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if there are any activity logs
    const logs = await ActionLog.find().populate('user', 'name email').populate('task', 'title');
    console.log(`Found ${logs.length} activity logs in the database:`);
    
    if (logs.length > 0) {
      logs.forEach((log, index) => {
        console.log(`${index + 1}. ${log.description} by ${log.user?.name || 'Unknown'} at ${log.createdAt}`);
      });
    } else {
      console.log('No activity logs found in the database');
    }

    // Test creating a sample activity log
    console.log('\nTesting activity log creation...');
    const testLog = new ActionLog({
      user: new mongoose.Types.ObjectId(), // Dummy user ID
      actionType: 'create',
      task: new mongoose.Types.ObjectId(), // Dummy task ID
      description: 'Test activity log entry'
    });

    const savedLog = await testLog.save();
    console.log('Test activity log created successfully:', savedLog._id);

    // Clean up the test log
    await ActionLog.findByIdAndDelete(savedLog._id);
    console.log('Test activity log cleaned up');

  } catch (error) {
    console.error('Error testing activity log:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testActivityLog();