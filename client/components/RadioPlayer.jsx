"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/RadioPlayer.module.css';
import radioService from '@/services/radioService';

export default function RadioPlayer({ isVisible, currentTheme, onMenuClick, isMenuActive }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStationIndex, setCurrentStationIndex] = useState(0);
    const [stations, setStations] = useState([]);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    // Učitaj radio stanice kad se komponenta montira
    useEffect(() => {
        const loadStations = async () => {
            const topStations = await radioService.getTopStations(10);
            setStations(topStations);
        };

        if (isVisible) {
            loadStations();
        }
    }, [isVisible]);

    // Zaustavi radio kad komponenta nije vidljiva
    useEffect(() => {
        if (!isVisible) {
            setIsPlaying(false);
            radioService.stop();
        }
    }, [isVisible]);

    const handleStationChange = async (direction) => {
        if (stations.length === 0 || isLoadingAudio) return;

        setCurrentStationIndex(prev => {
            const newIndex = direction === 'next'
                ? (prev + 1) % stations.length
                : (prev - 1 + stations.length) % stations.length;
            
            if (isPlaying) {
                playStation(stations[newIndex]);
            }
            
            return newIndex;
        });
    };

    const playStation = async (station) => {
        try {
            setIsLoadingAudio(true);
            await radioService.play(station.url_resolved);
            setIsPlaying(true);
        } catch (err) {
            setIsPlaying(false);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    const togglePlay = async () => {
        if (stations.length === 0 || isLoadingAudio) return;

        try {
            if (isPlaying) {
                radioService.pause();
                setIsPlaying(false);
            } else {
                await playStation(stations[currentStationIndex]);
            }
        } catch (err) {
            setIsPlaying(false);
        }
    };

    const currentStation = stations[currentStationIndex];

    return (
        <div className={`${styles.radioPlayerContainer} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.radioPlayerBox}>
                <div className={styles.menuButton}>
                    <button 
                        className={`${styles.iconButton} ${isMenuActive ? styles.active : ''}`}
                        onClick={onMenuClick}
                    >
                        <Image 
                            src="/icons/Menu.png"
                            alt="Menu"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>

                <div className={styles.radioDisplay}>
                    <div className={styles.stationInfo}>
                        <div className={styles.stationDetails}>
                            <span className={styles.stationName}>
                                {currentStation?.name || 'Radio Player'}
                            </span>
                            {currentStation?.favicon && (
                                <Image 
                                    src={currentStation.favicon}
                                    alt="Station logo"
                                    width={24}
                                    height={24}
                                    className={styles.stationLogo}
                                />
                            )}
                        </div>
                        <div className={`${styles.signalIndicator} ${isPlaying ? styles.active : ''}`}></div>
                    </div>
                    <div className={styles.frequencyBar}>
                        <div 
                            className={styles.frequencyIndicator} 
                            style={{ left: `${(currentStationIndex / (stations.length - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.mainControls}>
                        <button 
                            className={`${styles.controlButton} ${styles.previousButton}`}
                            onClick={() => handleStationChange('prev')}
                            disabled={isLoadingAudio}
                        >
                            <Image 
                                src="/icons/Next.png" 
                                alt="Previous Station" 
                                width={36} 
                                height={36} 
                            />
                        </button>

                        <button 
                            className={`${styles.controlButton} ${styles.playButton} ${isLoadingAudio ? styles.loading : ''}`}
                            onClick={togglePlay}
                            disabled={isLoadingAudio}
                        >
                            <Image 
                                src={`/icons/${isPlaying ? 'Pause' : 'Play'}.png`} 
                                alt={isPlaying ? 'Pause' : 'Play'} 
                                width={36} 
                                height={36} 
                            />
                            {isLoadingAudio && <div className={styles.loadingOverlay} />}
                        </button>

                        <button 
                            className={styles.controlButton}
                            onClick={() => handleStationChange('next')}
                            disabled={isLoadingAudio}
                        >
                            <Image 
                                src="/icons/Next.png" 
                                alt="Next Station" 
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