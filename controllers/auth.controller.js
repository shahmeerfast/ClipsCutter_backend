const User = require('../models/User')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      })
    }

    const user = new User({ name, email, password })
    console.log('Saving user to database...', { name, email })
    await user.save()
    console.log('User saved successfully:', user._id)

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      })
    }
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create user',
    })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
    }

    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to login',
    })
  }
}

module.exports = { signup, login }
