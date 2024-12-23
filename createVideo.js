const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
ffmpeg.setFfmpegPath(ffmpegStatic);

async function createVideo(audioPath, outputPath, duration) {
    return new Promise((resolve, reject) => {
        const imageSourcePath = path.join(__dirname, 'comedian-placeholder.png');
        
        ffmpeg()
            .input(imageSourcePath)
            .loop(duration)
            .input(audioPath)
            .outputOptions([
                '-c:v libx264',
                '-tune stillimage',
                '-c:a aac',
                '-b:a 192k',
                '-pix_fmt yuv420p',
                '-shortest'
            ])
            .save(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err));
    });
}

module.exports = createVideo;