const { getStream } = require('../services/download.service')
const { clipVideo, parseTimeToSeconds } = require('../services/ffmpeg.service')
const { scheduleCleanup } = require('../utils/cleanup')
const path = require('path')
const ytdl = require('@distube/ytdl-core')

const TIME_REGEX = /^(\d{1,2}:)?(\d{1,2}):(\d{2})$/

function validateTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false
  return TIME_REGEX.test(timeStr.trim())
}

async function createClip(req, res) {
  try {
    const { url, startTime, endTime, format } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required' })
    }
    if (!startTime || typeof startTime !== 'string') {
      return res.status(400).json({ success: false, error: 'Start time is required' })
    }
    if (!endTime || typeof endTime !== 'string') {
      return res.status(400).json({ success: false, error: 'End time is required' })
    }
    if (!format || !['mp4', 'mp3'].includes(format.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Format must be mp4 or mp3' })
    }

    const normalizeTime = (t) => (t.split(':').length === 2 ? `00:${t}` : t)
    const startNorm = normalizeTime(startTime.trim())
    const endNorm = normalizeTime(endTime.trim())

    if (!validateTime(startTime) && !validateTime(startNorm)) {
      return res.status(400).json({ success: false, error: 'Invalid start time format (use HH:MM:SS or MM:SS)' })
    }
    if (!validateTime(endTime) && !validateTime(endNorm)) {
      return res.status(400).json({ success: false, error: 'Invalid end time format (use HH:MM:SS or MM:SS)' })
    }

    const startForFfmpeg = startNorm
    const endForFfmpeg = endNorm

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ success: false, error: 'Invalid YouTube URL' })
    }

    const stream = await getStream(url, format.toLowerCase())
    
    const filename = await clipVideo(stream, startForFfmpeg, endForFfmpeg, format.toLowerCase())
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const fileUrl = `${baseUrl}/temp/${filename}`

    scheduleCleanup(path.join('temp', filename))

    res.json({ success: true, file: fileUrl })
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to process clip',
      })
    }
  }
}

module.exports = { createClip }
