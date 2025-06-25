const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media');
const { getRadioStations, updateRadioStations } = require('../controllers/media/radio');
const { verifyAdminToken } = require('../middlewares/adminMiddleware');

// Dohvati popis pjesama
router.get('/songs', mediaController.getSongs);

// Streamaj pojedinu pjesmu
router.get('/stream/:filename', mediaController.streamSong);

// GET radio stations
router.get('/radio/stations', getRadioStations);

// PUT radio stations (admin only)
router.put('/radio/stations', verifyAdminToken, updateRadioStations);

module.exports = router; 