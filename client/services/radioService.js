const RADIO_API_BASE = 'https://de1.api.radio-browser.info/json/stations';

class RadioService {
    constructor() {
        this.audio = null;
        this.currentStation = null;
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

    async getTopStations(limit = 10) {
        try {
            // Dodaj User-Agent header koji Radio Browser API zahtijeva
            const response = await fetch(`${RADIO_API_BASE}/topclick/${limit}`, {
                headers: {
                    'User-Agent': 'AMessages Radio Player',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const stations = await response.json();
            // Filtriraj samo stanice koje imaju SSL stream (https)
            return stations.filter(station => 
                station.url_resolved && 
                station.favicon && 
                station.url_resolved.startsWith('https://')
            );
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