"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/RadioStationsList.module.css';

export default function RadioStationsList({ stations, onStationSelect, currentStation, isVisible, animationClass = '' }) {
    const [show, setShow] = useState(isVisible);
    const timeoutRef = useRef();

    useEffect(() => {
        if (isVisible) {
            setShow(true);
        } else if (show) {
            timeoutRef.current = setTimeout(() => {
                setShow(false);
            }, 500); // trajanje animacije
        }
        return () => clearTimeout(timeoutRef.current);
    }, [isVisible]);

    if (!show) return null;

    return (
        <div className={`${styles.stationsListContainer} ${animationClass ? styles[animationClass] || animationClass : ''}`}>
            <div className={styles.stationsList}>
                {stations.map((station, index) => (
                    <button
                        key={station.stationuuid}
                        className={`${styles.stationItem} ${currentStation?.stationuuid === station.stationuuid ? styles.active : ''}`}
                        onClick={() => onStationSelect(station, index)}
                    >
                        <div className={styles.stationIcon}>
                            {station.favicon ? (
                                <Image
                                    src={station.favicon}
                                    alt={station.name}
                                    width={32}
                                    height={32}
                                    className={styles.stationLogo}
                                />
                            ) : (
                                <div className={styles.defaultIcon}>
                                    <Image
                                        src="/icons/Radio.png"
                                        alt="Radio"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.stationInfo}>
                            <div className={styles.stationName}>{station.name}</div>
                            <div className={styles.stationTags}>
                                {station.tags?.split(',').slice(0, 2).map(tag => (
                                    <span key={tag} className={styles.tag}>{tag.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
} 