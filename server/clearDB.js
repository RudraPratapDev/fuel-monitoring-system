const mongoose = require('mongoose');

async function clearDB() {
  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/fuel-sentinel';
    console.log(`Connecting to ${mongoUrl}...`);
    await mongoose.connect(mongoUrl);
    
    console.log('Dropping database...');
    await mongoose.connection.db.dropDatabase();
    
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDB();
