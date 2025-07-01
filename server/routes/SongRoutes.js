import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/songs', (req, res) => {
    const songsDirectory = path.join(__dirname, '../songs');

    fs.readdir(songsDirectory, (err, files) => {
        if (err) {
            console.error('Could not list the directory.', err);
            return res.status(500).send('Internal Server Error');
        }

        const songFiles = files.filter(file => {
            return path.extname(file).toLowerCase() === '.mp3' || path.extname(file).toLowerCase() === '.wma';
        });

        res.json({ songs: songFiles });
    });
});

export default router; 