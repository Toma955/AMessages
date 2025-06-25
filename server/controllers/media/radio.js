const path = require('path');
const fs = require('fs/promises');

const RADIO_JSON_PATH = path.join(__dirname, '../../media/radio/radiostations.json');

// GET /api/media/radio/stations
async function getRadioStations(req, res) {
    try {
        const data = await fs.readFile(RADIO_JSON_PATH, 'utf-8');
        const stations = JSON.parse(data);
        res.json({ success: true, stations });
    } catch (error) {
        console.error('Error reading radio stations:', error);
        res.status(500).json({ success: false, message: 'Failed to read radio stations.' });
    }
}

// PUT /api/media/radio/stations (admin only)
async function updateRadioStations(req, res) {
    try {
        const { stations } = req.body;
        if (!Array.isArray(stations)) {
            return res.status(400).json({ success: false, message: 'Invalid stations format.' });
        }
        await fs.writeFile(RADIO_JSON_PATH, JSON.stringify(stations, null, 2), 'utf-8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating radio stations:', error);
        res.status(500).json({ success: false, message: 'Failed to update radio stations.' });
    }
}

module.exports = { getRadioStations, updateRadioStations };
