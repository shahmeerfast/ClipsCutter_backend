const express = require('express')
const router = express.Router()
const { createClip } = require('../controllers/clip.controller')

router.post('/clip', createClip)

module.exports = router
