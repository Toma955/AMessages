import express from 'express';
import mediaController from '../controllers/media.js';
import { getRadioStations, updateRadioStations } from '../controllers/media/radio.js';
import { verifyAdminToken } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/songs', mediaController.getSongs);

router.get('/stream/:filename', mediaController.streamSong);

router.get('/radio/stations', getRadioStations);

router.put('/radio/stations', verifyAdminToken, updateRadioStations);

export default router; 