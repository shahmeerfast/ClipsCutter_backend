const ytdl = require('@distube/ytdl-core')

async function getStream(url, format) {
  try {
    const isAudio = format === 'mp3'
    const options = {
      quality: isAudio ? 'highestaudio' : 'highest',
      filter: isAudio ? 'audioonly' : 'videoandaudio',
    }
    const stream = ytdl(url, options)
    return stream
  } catch (err) {
    throw new Error(`Failed to initialize stream: ${err.message}`)
  }
}

module.exports = { getStream }
