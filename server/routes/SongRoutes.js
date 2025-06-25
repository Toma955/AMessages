const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

module.exports = router; 