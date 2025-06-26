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
        
        // Definišemo funkcije ovde da bismo ih mogli ispravno ukloniti
        this.handleError = this._handleError.bind(this);
        this.handleLoadStart = () => console.log('Audio loading started');
        this.handlePlaying = () => console.log('Audio started playing');

        this.initAudio();
    }

    _handleError(e) {
        console.error('Audio Error:', e);
        console.error('Error code:', this.audio.error?.code);
        console.error('Error message:', this.audio.error?.message);
    }

    initAudio() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
            this.audio.crossOrigin = "anonymous";
            
            // Koristimo definisane funkcije
            this.audio.addEventListener('error', this.handleError);
            this.audio.addEventListener('loadstart', this.handleLoadStart);
            this.audio.addEventListener('playing', this.handlePlaying);
        }
    }

    async getRadioApiBaseUrl() {
        const server = RADIO_API_SERVERS[this.currentServerIndex];
        return `https://${server}`;
    }

    async tryNextServer() {
        this.currentServerIndex = (this.currentServerIndex + 1) % RADIO_API_SERVERS.length;
        return this.getRadioApiBaseUrl();
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        try {
            // Ensure URL starts with https://
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
            console.warn(`Error fetching from ${url}:`, error);
            
            if (retries > 0) {
                console.log(`Retrying... ${retries} attempts left`);
                const nextBaseUrl = await this.tryNextServer();
                const nextUrl = url.replace(/^https?:\/\/[^/]+/, nextBaseUrl);
                console.log(`Trying next server: ${nextUrl}`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                return this.fetchWithRetry(nextUrl, options, retries - 1);
            }
            
            throw new Error(`Failed to fetch after ${3 - retries} retries: ${error.message}`);
        }
    }

    async getTopStations(limit = 10) {
        try {
            const baseUrl = await this.getRadioApiBaseUrl();
            console.log('Fetching from:', baseUrl);
            
            const stations = await this.fetchWithRetry(`${baseUrl}/json/stations/topclick/100`, {
                method: 'GET'
            });

            // Filtriraj samo stanice koje imaju SSL stream (https) i podržani format
            const filteredStations = stations
                .filter(station => {
                    const url = station.url_resolved;
                    const isValid = url &&
                        url.startsWith('https://') &&
                        (
                            url.endsWith('.mp3') ||
                            url.endsWith('.aac') ||
                            url.endsWith('.ogg') ||
                            url.endsWith('.m3u8')
                        );
                    if (!isValid) {
                        console.warn('Filtered out station (unsupported stream):', url);
                    }
                    return isValid;
                })
                .slice(0, limit);

            console.log('Filtered stations:', filteredStations.length);

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

    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            // Sada ispravno uklanjamo listenere
            this.audio.removeEventListener('error', this.handleError);
            this.audio.removeEventListener('loadstart', this.handleLoadStart);
            this.audio.removeEventListener('playing', this.handlePlaying);
            
            if (this.audio.parentNode) {
                this.audio.parentNode.removeChild(this.audio);
            }
            this.audio = null;
        }
        console.log('RadioService destroyed and cleaned up');
    }
}

// Singleton instance
const radioService = new RadioService();
export default radioService; 