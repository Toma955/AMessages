import { useState, useEffect } from 'react';
import styles from '@/app/styles/RecordPlayer.module.css';

const RecordPlayer = ({ isVisible, currentTheme }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setIsPlaying(false);
            setIsActive(false);
        }
    }, [isVisible]);

    return (
        <div className={`${styles.recordPlayerContainer} ${isVisible ? styles.visible : ''}`}>
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
                            onClick={() => setIsPlaying(false)}
                        >
                            <img src="/icons/Next.png" alt="Previous" width={36} height={36} />
                        </button>

                        <button 
                            className={`${styles.controlButton} ${styles.playButton}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            <img 
                                src={`/icons/${isPlaying ? 'Pause' : 'Play'}.png`} 
                                alt={isPlaying ? 'Pause' : 'Play'} 
                                width={36} 
                                height={36} 
                            />
                        </button>

                        <button 
                            className={styles.controlButton}
                            onClick={() => setIsPlaying(false)}
                        >
                            <img src="/icons/Next.png" alt="Next" width={36} height={36} />
                        </button>

                        <button 
                            className={`${styles.controlButton} ${styles.menuButton}`}
                            onClick={() => setIsActive(!isActive)}
                        >
                            <img src="/icons/Menu.png" alt="Menu" width={36} height={36} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPlayer; 