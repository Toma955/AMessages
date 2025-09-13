const RADIO_API_SERVERS = [
    'de1.api.radio-browser.info',
    'at1.api.radio-browser.info',
    'nl1.api.radio-browser.info',
    'fr1.api.radio-browser.info'
];

class RadioService {
    constructor() {
        this.audio = null;
        this.currentStation = null;
        this.currentServerIndex = 0;
        
        this.handleError = this._handleError.bind(this);
        this.handleLoadStart = () => {};
        this.handlePlaying = () => {};

        this.initAudio();
    }

    initAudio() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
            this.audio.addEventListener('error', this.handleError);
            this.audio.addEventListener('loadstart', this.handleLoadStart);
            this.audio.addEventListener('playing', this.handlePlaying);
        }
    }

    getRadioApiBaseUrl() {
        const server = RADIO_API_SERVERS[this.currentServerIndex];
        return `https://${server}`;
    }

    async tryNextServer() {
        this.currentServerIndex = (this.currentServerIndex + 1) % RADIO_API_SERVERS.length;
        return this.getRadioApiBaseUrl();
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        try {
            if (!url.startsWith('https://')) {
                url = `https://${url.replace('http://', '')}`;
            }

            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AMessages/1.0.0',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            
            if (retries > 0) {
                const nextBaseUrl = await this.tryNextServer();
                const nextUrl = url.replace(/^https?:\/\/[^/]+/, nextBaseUrl);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.fetchWithRetry(nextUrl, options, retries - 1);
            }
            
            throw new Error(`Failed to fetch after ${3 - retries} retries: ${error.message}`);
        }
    }

    async searchStations(query, limit = 20) {
        try {
            const baseUrl = this.getRadioApiBaseUrl();
            const url = `${baseUrl}/json/stations/search?name=${encodeURIComponent(query)}&limit=${limit}`;
            
            const stations = await this.fetchWithRetry(url);
            return stations.filter(station => 
                station.url && 
                station.name && 
                url.startsWith('https://') &&
                station.favicon
            );
        } catch (error) {
            return [];
        }
    }

    async getTopStations(limit = 20) {
        try {
            const baseUrl = this.getRadioApiBaseUrl();
            const url = `${baseUrl}/json/stations/topvote?limit=${limit}`;
            
            const stations = await this.fetchWithRetry(url);
            return stations.filter(station => 
                station.url && 
                station.name && 
                url.startsWith('https://') &&
                station.favicon
            );
        } catch (error) {
            return [];
        }
    }

    async play(stationUrl) {
        return new Promise((resolve, reject) => {
            if (!this.audio) {
                reject(new Error('Audio not initialized'));
                return;
            }

            this.audio.src = stationUrl;
            this.currentStation = { url: stationUrl };

            this.audio.oncanplay = () => {
                this.audio.play().then(resolve).catch(reject);
            };

            this.audio.onerror = (error) => {
                reject(new Error(`Failed to play station: ${error.message}`));
            };

            this.audio.load();
        });
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio = null;
        }
    }

    _handleError(error) {
    }
}

const radioService = new RadioService();
export default radioService; 