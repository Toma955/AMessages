import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './RadioListWidget.module.css';

export default function RadioListWidget({ onStationSelect, currentStation, isVisible, onClose }) {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [show, setShow] = useState(isVisible);
    const [animationClass, setAnimationClass] = useState('');
    const timeoutRef = useRef();

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            setAnimationClass(styles.slideIn || 'slideIn');
        } else if (show) {
            setAnimationClass(styles.slideOut || 'slideOut');
            timeoutRef.current = setTimeout(() => {
                setShow(false);
            }, 300);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [isVisible]);

    useEffect(() => {
        if (!show) return;
        setLoading(true);
        setError(null);
        fetch('/api/media/radio/stations')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStations(data.stations);
                } else {
                    setError('Greška kod dohvaćanja stanica.');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Greška kod dohvaćanja stanica.');
                setLoading(false);
            });
    }, [show]);

    if (!show) return null;

    return (
        <div className={`${styles.stationsListContainer} ${animationClass}`}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%'
            }}
        >
            <div className={styles.stationsList}>
                {loading ? (
                    <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Učitavanje...</div>
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
                ) : stations.length === 0 ? (
                    <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Nema stanica.</div>
                ) : (
                    stations.map((station, index) => (
                        <button
                            key={station.stationuuid || station.url || index}
                            className={`${styles.stationItem} ${currentStation?.stationuuid === station.stationuuid ? styles.active : ''}`}
                            onClick={() => onStationSelect && onStationSelect(station, index)}
                            style={{ color: '#fff', fontWeight: 500 }}
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
                                <div className={styles.stationName} style={{ color: '#fff' }}>{station.name}</div>
                                <div className={styles.stationTags}>
                                    {station.tags?.split(',').slice(0, 2).map(tag => (
                                        <span key={tag} className={styles.tag}>{tag.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
} 