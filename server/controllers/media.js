import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista ekstenzija koje prepoznajemo kao glazbene
const AUDIO_EXTENSIONS = ['.mp3', '.wma', '.wav', '.flac', '.aac', '.ogg', '.m4a'];

const getSongs = (req, res) => {
    const songsDir = path.join(__dirname, '../media/songs');
    console.log('DEBUG songsDir:', songsDir);
    fs.readdir(songsDir, (err, files) => {
        if (err) {
            console.error('Greška pri čitanju direktorija:', err);
            return res.status(500).json({ error: 'Failed to load songs directory. Please check server console for details.', errorMessage: err.message });
        }
        console.log('DEBUG files found:', files);
        const songs = files.filter(file =>
            AUDIO_EXTENSIONS.includes(path.extname(file).toLowerCase())
        );
        res.json({ songs });
    });
};

const streamSong = (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, '../media/songs', fileName);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            return res.status(404).json({ error: 'Pjesma nije pronađena.' });
        }

        const range = req.headers.range;
        if (!range) {
            res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stats.size,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000'
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunkSize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000'
            });
            fileStream.pipe(res);
        }
    });
};

export default {
    getSongs,
    streamSong
}; 