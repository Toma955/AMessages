"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/RecordPlayer.module.css';

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
                {/* Record disc */}
                <div className={`${styles.recordDisc} ${isPlaying ? styles.spinning : ''}`}>
                    <div className={styles.discLabel}>
                        <div className={styles.discCenter} />
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

                        <button 
                            className={`${styles.controlButton} ${styles.menuButton}`}
                            onClick={onMenuClick}
                        >
                            <Image 
                                src="/icons/Menu.png" 
                                alt="Menu" 
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