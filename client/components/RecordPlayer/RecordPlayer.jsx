"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './RecordPlayer.module.css';

export default function RecordPlayer({ 
    isVisible, 
    onMenuClick, 
    currentSong, 
    setCurrentSong,
    songs,
    playerVolume
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!isVisible) {
            setIsPlaying(false);
        }
    }, [isVisible]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            if (currentSong) {
                audio.src = `/api/media/stream/${encodeURIComponent(currentSong)}`;
                audio.play().catch(e => console.error("Error playing audio:", e));
            } else {
                audio.pause();
                audio.src = '';
            }
        }
    }, [currentSong]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('ended', playNextSong);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('ended', playNextSong);
            };
        }
    }, [songs, currentSong]); // Re-attach listeners if songs/currentSong changes

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = playerVolume ?? 0.5;
        }
    }, [playerVolume]);

    const togglePlayPause = () => {
        if (!currentSong) {
            if (songs.length > 0) {
                setCurrentSong(songs[0]);
            }
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const playNextSong = () => {
        if (!songs || songs.length === 0) return;
        const currentIndex = songs.findIndex(song => song === currentSong);
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentSong(songs[nextIndex]);
    };

    const playPreviousSong = () => {
        if (!songs || songs.length === 0) return;
        const currentIndex = songs.findIndex(song => song === currentSong);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        setCurrentSong(songs[prevIndex]);
    };

    return (
        <div className={`${styles.recordPlayerContainer} ${isVisible ? styles.visible : ''}`}>
            <audio ref={audioRef} />
            <div className={styles.recordPlayerBox}>
                <div className="centerDisc" style={{ position: 'relative', width: 160, height: 160, top: '10px' }}>
                    {/* Statični vinil iznad */}
                    <Image 
                        src="/icons/Winil.png" 
                        alt="Vinyl" 
                        width={100} 
                        height={100} 
                        priority
                        style={{ position: 'absolute', top: '50%', left: '100px', transform: 'translateY(-50%)', zIndex: 2 }}
                    />
                    {/* Rotirajući disc ispod */}
                    <div className={`${styles.recordDisc} ${isPlaying ? styles.spinning : ''}`} onClick={onMenuClick} style={{ position: 'absolute', top: 0, left: 0, width: 160, height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 1 }}>
                        <Image 
                            src="/icons/RecordDisc.png" 
                            alt="Record Disc" 
                            width={160} 
                            height={160} 
                            priority
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.mainControls}>
                        <button 
                            className={`${styles.controlButton} ${styles.previousButton}`}
                            onClick={playPreviousSong}
                        >
                            <Image 
                                src="/icons/Next.png" 
                                alt="Previous" 
                                width={36} 
                                height={36} 
                            />
                        </button>
                        <button 
                            className={`${styles.controlButton} ${styles.playButton}`}
                            onClick={togglePlayPause}
                        >
                            <Image 
                                src={`/icons/${isPlaying ? 'Pause' : 'Play'}.png`} 
                                alt={isPlaying ? 'Pause' : 'Play'} 
                                width={36} 
                                height={36} 
                            />
                        </button>
                        <button 
                            className={styles.controlButton}
                            onClick={playNextSong}
                        >
                            <Image 
                                src="/icons/Next.png" 
                                alt="Next" 
                                width={36} 
                                height={36} 
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}