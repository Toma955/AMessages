// Radio Browser API koristi round-robin DNS za balansiranje opterećenja
// Lista dostupnih servera
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
        this.initAudio();
    }

    initAudio() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
            this.audio.crossOrigin = "anonymous";
            
            // Dodaj event listenere za debugiranje
            this.audio.addEventListener('error', (e) => {
                console.error('Audio Error:', e);
                console.error('Error code:', this.audio.error?.code);
                console.error('Error message:', this.audio.error?.message);
            });

            this.audio.addEventListener('loadstart', () => {
                console.log('Audio loading started');
            });

            this.audio.addEventListener('playing', () => {
                console.log('Audio started playing');
            });
        }
    }

    async getRadioApiBaseUrl() {
        const server = RADIO_API_SERVERS[this.currentServerIndex];
        return `https://${server}/json`;
    }

    async tryNextServer() {
        this.currentServerIndex = (this.currentServerIndex + 1) % RADIO_API_SERVERS.length;
        return this.getRadioApiBaseUrl();
    }

    async fetchWithRetry(url, options, retries = 3) {
        try {
            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    'User-Agent': 'AMessages/1.0.0',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`Error fetching from ${url}:`, error);
            
            if (retries > 0) {
                const nextBaseUrl = await this.tryNextServer();
                const nextUrl = url.replace(/^https:\/\/[^/]+/, nextBaseUrl);
                console.log(`Retrying with next server: ${nextUrl}`);
                return this.fetchWithRetry(nextUrl, options, retries - 1);
            }
            
            throw error;
        }
    }

    async getTopStations(limit = 10) {
        try {
            const baseUrl = await this.getRadioApiBaseUrl();
            const stations = await this.fetchWithRetry(`${baseUrl}/stations/topclick/100`, {
                method: 'GET'
            });

            // Filtriraj samo stanice koje imaju SSL stream (https) i favicon
            const filteredStations = stations
                .filter(station => 
                    station.url_resolved && 
                    station.favicon && 
                    station.url_resolved.startsWith('https://')
                )
                .slice(0, limit);

            if (filteredStations.length === 0) {
                console.warn('No valid stations found after filtering');
                return [];
            }

            return filteredStations;
        } catch (error) {
            console.error('Error fetching radio stations:', error);
            return [];
        }
    }

    async play(stationUrl) {
        if (!this.audio) {
            console.error('Audio not initialized');
            return;
        }
        
        try {
            // Provjeri je li URL validan
            if (!stationUrl.startsWith('http')) {
                throw new Error('Invalid station URL');
            }

            if (this.currentStation !== stationUrl) {
                // Zaustavi trenutnu reprodukciju
                this.audio.pause();
                
                // Postavi novi izvor
                this.audio.src = stationUrl;
                this.currentStation = stationUrl;
                
                // Postavi audio na load
                await this.audio.load();
            }
            
            // Pokušaj reproducirati
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing radio:', error);
                    // Ako je greška zbog autoplay policy-ja, pokušaj ponovno s muted
                    if (error.name === 'NotAllowedError') {
                        this.audio.muted = true;
                        this.audio.play().then(() => {
                            this.audio.muted = false;
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error in play function:', error);
            throw error;
        }
    }

    pause() {
        if (!this.audio) return;
        try {
            this.audio.pause();
        } catch (error) {
            console.error('Error pausing radio:', error);
        }
    }

    setVolume(value) {
        if (!this.audio) return;
        try {
            this.audio.volume = Math.max(0, Math.min(1, value / 100));
        } catch (error) {
            console.error('Error setting volume:', error);
        }
    }

    stop() {
        if (!this.audio) return;
        try {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.currentStation = null;
        } catch (error) {
            console.error('Error stopping radio:', error);
        }
    }
}

// Singleton instance
const radioService = new RadioService();
export default radioService; 