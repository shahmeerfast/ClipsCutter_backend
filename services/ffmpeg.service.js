const path = require('path')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const { v4: uuidv4 } = require('uuid')

const TEMP_DIR = path.join(__dirname, '..', 'temp')

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }
}

function parseTimeToSeconds(timeStr) {
  const parts = timeStr.trim().split(':').map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return null
}

function clipVideo(stream, startTime, endTime, format) {
  return new Promise((resolve, reject) => {
    ensureTempDir()
    const ext = format === 'mp3' ? 'mp3' : 'mp4'
    const filename = `${uuidv4()}.${ext}`
    const outputPath = path.join(TEMP_DIR, filename)

    const startSec = parseTimeToSeconds(startTime)
    const endSec = parseTimeToSeconds(endTime)
    if (startSec === null || endSec === null) {
      return reject(new Error('Invalid time format'))
    }
    if (endSec <= startSec) {
      return reject(new Error('End time must be after start time'))
    }

    let command = ffmpeg(stream)
      .inputOptions(['-ss', startTime])
      .outputOptions(['-to', endTime])

    if (format === 'mp3') {
      command = command
        .noVideo()
        .audioCodec('libmp3lame')
        .outputOptions(['-q:a', '0', '-map', 'a'])
        .format('mp3')
    } else {
      command = command
        .outputOptions(['-c:v', 'copy', '-c:a', 'copy'])
        .format('mp4')
    }

    command
      .output(outputPath)
      .on('start', () => {})
      .on('error', (err) => {
        reject(err)
      })
      .on('end', () => {
        resolve(filename)
      })
      .run()
  })
}

module.exports = { clipVideo, parseTimeToSeconds }
