const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Ensure caller set a DB_NAME so casing is consistent
    const dbName = process.env.DB_NAME || 'carWashDB';

    // Connect explicitly with dbName to avoid accidental creation of a differently-cased DB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // other options you may want
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    // If this is the case-difference error, print a friendly hint:
    if (error && error.errorResponse && error.errorResponse.errmsg) {
      console.error('MongoDB errmsg:', error.errorResponse.errmsg);
      if (String(error.errorResponse.errmsg).includes('db already exists with different case')) {
        console.error(
          'Detected a database with the same name but different case. ' +
          'Make sure DB_NAME in .env matches the existing database name exactly (case-sensitive), ' +
          'or drop the duplicate db if you intentionally want to rename it.'
        );
      }
    }
    process.exit(1);
  }
}

module.exports = connectDB;
