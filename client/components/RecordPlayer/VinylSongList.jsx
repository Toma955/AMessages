"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './VinylSongList.module.css';

export default function VinylSongList({ 
    songs, 
    currentSong, 
    onSongSelect, 
    isLoading, 
    error,
    currentTheme 
}) {
    const [currentPage, setCurrentPage] = useState(0);
    const songsPerPage = 4;
    const totalPages = Math.ceil(songs.length / songsPerPage);
    if (isLoading) {
        return (
            <div className={styles.vinylContainer}>
                <div className={styles.loadingVinyl}>
                    <Image 
                        src="/icons/Vinil.png" 
                        alt="Loading Vinyl" 
                        width={120} 
                        height={120} 
                        priority
                    />
                    <div className={styles.loadingText}>Loading songs...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.vinylContainer}>
                <div className={styles.errorVinyl}>
                    <Image 
                        src="/icons/Vinil.png" 
                        alt="Error Vinyl" 
                        width={120} 
                        height={120} 
                        priority
                    />
                    <div className={styles.errorText}>{error}</div>
                </div>
            </div>
        );
    }

    if (!songs || songs.length === 0) {
        return (
            <div className={styles.vinylContainer}>
                <div className={styles.emptyVinyl}>
                    <Image 
                        src="/icons/Vinil.png" 
                        alt="Empty Vinyl" 
                        width={120} 
                        height={120} 
                        priority
                    />
                    <div className={styles.emptyText}>No songs found.</div>
                </div>
            </div>
        );
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const startIndex = currentPage * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    const currentSongs = songs.slice(startIndex, endIndex);

    return (
        <div className={styles.vinylWrapper}>
            <div className={styles.vinylContainer}>
                {currentSongs.map((song, index) => {
                    const isActive = song === currentSong;
                    const songName = song.replace(/\.mp3$|\.wav$|\.waw$/,'');
                    return (
                        <div 
                            key={startIndex + index}
                            className={`${styles.vinylItem} ${isActive ? styles.active : ''}`}
                            onClick={() => onSongSelect(song)}
                        >
                            <div className={styles.vinylDisc}>
                                <Image 
                                    src="/icons/Vinil.png" 
                                    alt="Vinyl" 
                                    width={120} 
                                    height={120} 
                                    priority
                                    className={styles.vinylImage}
                                />
                                <div className={`${styles.songText} ${styles[`theme-${currentTheme}`]}`}> 
                                    <svg 
                                        className={styles.textPath} 
                                        viewBox="0 0 200 200"
                                    >
                                        <defs>
                                            <path 
                                                id={`textPath-${startIndex + index}`} 
                                                d="M 100,100 m -80,0 a 80,80 0 0,1 160,0"
                                            />
                                        </defs>
                                        <text>
                                            <textPath 
                                                href={`#textPath-${startIndex + index}`} 
                                                startOffset="25%"
                                                className={styles.curvedText}
                                            >
                                                {songName}
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {totalPages > 1 && (
                <div className={`${styles.paginationContainer} ${styles[`theme-${currentTheme}`]}`}>
                    <button 
                        className={`${styles.arrowButton} ${styles[`theme-${currentTheme}`]} ${styles.arrowLeft}`}
                        onClick={handlePrevPage}
                        title="Previous page"
                    >
                        <Image 
                            src="/icons/Arrow.png" 
                            alt="Previous" 
                            width={24} 
                            height={24}
                            className={`${styles.arrowIcon} ${styles.arrowLeft}`}
                        />
                    </button>
                    <div className={styles.pageIndicator}>
                        {currentPage + 1} / {totalPages}
                    </div>
                    <button 
                        className={`${styles.arrowButton} ${styles[`theme-${currentTheme}`]}`}
                        onClick={handleNextPage}
                        title="Next page"
                    >
                        <Image 
                            src="/icons/Arrow.png" 
                            alt="Next" 
                            width={24} 
                            height={24}
                            className={styles.arrowIcon}
                        />
                    </button>
                </div>
            )}
        </div>
    );
} 