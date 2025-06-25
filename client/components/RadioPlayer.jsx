"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/RadioPlayer.module.css';
import radioService from '@/services/radioService';

const RADIO_STATIONS = [
  {
    name: 'Dance UK Radio',
    url: 'http://uk2.internet-radio.com:8024/',
  },
  {
    name: 'Majestic Jukebox',
    url: 'http://uk3.internet-radio.com:8405/',
  },
  {
    name: 'Zero Radio',
    url: 'http://uk7.internet-radio.com:8188/',
  },
  {
    name: 'House Music Radio UK',
    url: 'http://uk4-vn.mixstream.net:8128/',
  },
];

export default function RadioPlayer({ isVisible, currentTheme, onMenuClick, isMenuActive }) {
    const [currentStation, setCurrentStation] = useState(RADIO_STATIONS[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const audioRef = useRef(null);

    const handleStationSelect = (station) => {
        setCurrentStation(station);
        setIsPlaying(true);
        setTimeout(() => {
            if (audioRef.current) audioRef.current.play();
        }, 100);
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleStationChange = async (direction) => {
        if (RADIO_STATIONS.length === 0 || isLoadingAudio) return;

        const newIndex = direction === 'next'
            ? (RADIO_STATIONS.indexOf(currentStation) + 1) % RADIO_STATIONS.length
            : (RADIO_STATIONS.indexOf(currentStation) - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
        
        if (isPlaying) {
            handleStationSelect(RADIO_STATIONS[newIndex]);
        }
    };

    const playStation = async (station) => {
        try {
            setIsLoadingAudio(true);
            await radioService.play(station.url);
            setIsPlaying(true);
        } catch (err) {
            setIsPlaying(false);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    const togglePlay = async () => {
        if (RADIO_STATIONS.length === 0 || isLoadingAudio) return;

        try {
            if (isPlaying) {
                radioService.pause();
                setIsPlaying(false);
            } else {
                await playStation(currentStation);
            }
        } catch (err) {
            setIsPlaying(false);
        }
    };

    return (
        <div className={`${styles.radioPlayerContainer} ${isVisible ? styles.visible : ''}`}>
            <div className={`${styles.radioPlayerBox} ${isVisible ? styles.noBorder : ''}`}>
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
                            style={{ left: `${(RADIO_STATIONS.indexOf(currentStation) / (RADIO_STATIONS.length - 1)) * 100}%` }}
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