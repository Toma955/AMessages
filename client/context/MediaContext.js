"use client";
import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
   
    const [isRecordPlayerVisible, setIsRecordPlayerVisible] = useState(false);
    const [isRadioPlayerVisible, setIsRadioPlayerVisible] = useState(false);
    const [isPianoVisible, setIsPianoVisible] = useState(false);
    const [isPianoActive, setIsPianoActive] = useState(false);
    const [radioStations, setRadioStations] = useState([]);
    const [currentStation, setCurrentStation] = useState({
        name: 'NPO Radio 1',
        url: 'https://icecast.omroep.nl/radio1-bb-mp3',
        stationuuid: 'npo-radio-1',
    });
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isSongListLoading, setIsSongListLoading] = useState(false);
    const [isSongListActive, setIsSongListActive] = useState(false);
    const [playerVolume, setPlayerVolume] = useState(0.5);
    const [songListError, setSongListError] = useState(null);
    const [activePanel, setActivePanel] = useState('record');
    const [panelAnimation, setPanelAnimation] = useState('slideIn');

   
    const radioPlayerRef = useRef(null);

    const handleRecordPlayerMenuClick = useCallback(async () => {
        if (isSongListActive) {
            setIsSongListActive(false);
            return;
        }
        setIsSongListActive(true);
        if (songs.length === 0 && !isSongListLoading) {
            setIsSongListLoading(true);
            try {
                const response = await fetch('/api/media/songs');
                if (!response.ok) {
                    const errorData = await response.json();
                    setSongs([]);
                    setSongListError(errorData.errorMessage || errorData.error || 'Greška pri dohvaćanju pjesama.');
                    return;
                }
                const data = await response.json();
                if (data.songs) {
                    setSongs(data.songs);
                    setSongListError(null);
                }
            } catch (error) {
                setSongListError('Greška pri dohvaćanju pjesama: ' + error.message);
            } finally {
                setIsSongListLoading(false);
            }
        }
    }, [isSongListActive, songs.length, isSongListLoading]);

    const handleSongSelect = useCallback((song) => {
        setCurrentSong(song);
    }, []);

    const handleStationSelect = useCallback((station, index) => {
        setCurrentStation(station);
    }, []);

    const handlePianoActivate = useCallback(() => {
        setIsPianoActive(!isPianoActive);
    }, [isPianoActive]);

    const switchPanel = useCallback((panel) => {
        if (!isSongListActive) {
            setActivePanel(panel);
            setPanelAnimation('slideIn');
            return;
        }
        setPanelAnimation('slideOut');
        setTimeout(() => {
            setActivePanel(panel);
            setPanelAnimation('slideIn');
        }, 300);
    }, [isSongListActive]);

    const toggleRecordPlayer = useCallback(() => {
        setIsRecordPlayerVisible(!isRecordPlayerVisible);
        setIsRadioPlayerVisible(false);
        setIsPianoVisible(false);
        switchPanel('record');
        
        
        if (radioPlayerRef.current && radioPlayerRef.current.pause) {
            radioPlayerRef.current.pause();
        }
    }, [isRecordPlayerVisible, switchPanel]);

    const toggleRadioPlayer = useCallback(() => {
        setIsRadioPlayerVisible(!isRadioPlayerVisible);
        setIsRecordPlayerVisible(false);
        setIsPianoVisible(false);
        switchPanel('radio');
        
       
        const audio = document.querySelector('audio');
        if (audio) audio.pause();
    }, [isRadioPlayerVisible, switchPanel]);

    const togglePiano = useCallback(() => {
        setIsPianoVisible(!isPianoVisible);
    }, [isPianoVisible]);

    const setVolume = useCallback((volume) => {
        setPlayerVolume(volume);
    }, []);

    const pauseAllMedia = useCallback(() => {
     
        if (radioPlayerRef.current && radioPlayerRef.current.pause) {
            radioPlayerRef.current.pause();
        }
        
        
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => audio.pause());
    }, []);

   
    useEffect(() => {
        if (!currentStation || !currentStation.url) return;
        if (window && window.Audio) {
            const testAudio = new window.Audio(currentStation.url);
            testAudio.crossOrigin = 'anonymous';
            testAudio.addEventListener('error', () => {
              
                if (radioStations && radioStations.length > 0) {
                    setCurrentStation(radioStations[0]);
                }
            });
            
            testAudio.load();
        }
    }, [currentStation, radioStations]);

    const value = {
       
        isRecordPlayerVisible,
        isRadioPlayerVisible,
        isPianoVisible,
        isPianoActive,
        radioStations,
        currentStation,
        songs,
        currentSong,
        isSongListLoading,
        isSongListActive,
        playerVolume,
        songListError,
        activePanel,
        panelAnimation,
        
        
        radioPlayerRef,
        
        
        setIsRecordPlayerVisible,
        setIsRadioPlayerVisible,
        setIsPianoVisible,
        setIsPianoActive,
        setRadioStations,
        setCurrentStation,
        setSongs,
        setCurrentSong,
        setIsSongListLoading,
        setIsSongListActive,
        setPlayerVolume,
        setSongListError,
        setActivePanel,
        setPanelAnimation,
        
        handleRecordPlayerMenuClick,
        handleSongSelect,
        handleStationSelect,
        handlePianoActivate,
        switchPanel,
        toggleRecordPlayer,
        toggleRadioPlayer,
        togglePiano,
        setVolume,
        pauseAllMedia,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};

export const useMediaContext = () => {
    const context = useContext(MediaContext);
    if (!context) {
        throw new Error('useMediaContext must be used within MediaProvider');
    }
    return context;
}; 