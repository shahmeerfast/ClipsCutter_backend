require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const connectDB = require('./config/database')
const clipRoute = require('./routes/clip.route')
const authRoute = require('./routes/auth.route')

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

const tempDir = path.join(__dirname, 'temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

app.use(cors())
app.use(express.json())
app.use('/temp', express.static(tempDir))
app.use('/api/auth', authRoute)
app.use('/api', clipRoute)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use((err, req, res, next) => {
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
