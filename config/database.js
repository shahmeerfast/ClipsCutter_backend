const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clipscutter'
    
    // Ensure database name is in the connection string
    let connectionString = mongoURI
    if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('/clipscutter') && !mongoURI.match(/\/\w+\?/)) {
      // Add database name before query parameters
      connectionString = mongoURI.replace(/\?/, '/clipscutter?')
    } else if (mongoURI.includes('mongodb+srv://') && !mongoURI.includes('/clipscutter')) {
      // Add database name at the end
      connectionString = mongoURI + '/clipscutter'
    }
    
    console.log('Connecting to MongoDB...')
    const conn = await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    console.log(`Database: ${conn.connection.name}`)
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
