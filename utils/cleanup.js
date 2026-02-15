const fs = require('fs')
const path = require('path')

const CLEANUP_DELAY_MS = 10 * 60 * 1000

function scheduleCleanup(filePath) {
  setTimeout(() => {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath)
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Cleanup error:', err.message)
      }
    })
  }, CLEANUP_DELAY_MS)
}

module.exports = { scheduleCleanup }
