"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/SettingsWidget.module.css';

export default function SettingsWidget({ isVisible, onActivate }) {
    const [language, setLanguage] = useState('HR');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'HR' ? 'EN' : 'HR');
    };

    const handleSettingsClick = () => {
        if (onActivate) {
            onActivate();
        }
    };

    return (
        <div className={`${styles.settingsWidgetContainer} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.settingsContent}>
                <div className={styles.settingsGrid}>
                    <button 
                        className={styles.gridButton}
                        onClick={handleSettingsClick}
                    >
                        <Image 
                            src="/icons/Cogwheel.png"
                            alt="Settings"
                            width={64}
                            height={64}
                            priority
                        />
                    </button>
                    <button 
                        className={styles.gridButton}
                        onClick={handleSettingsClick}
                    >
                        <Image 
                            src="/icons/Menu.png"
                            alt="Menu"
                            width={64}
                            height={64}
                        />
                    </button>
                    <button className={`${styles.gridButton} ${styles.deleteButton}`}>
                        <Image 
                            src="/icons/Delete_Account.png"
                            alt="Delete Account"
                            width={64}
                            height={64}
                        />
                    </button>
                    <button 
                        className={styles.gridButton}
                        onClick={toggleLanguage}
                    >
                        <span className={styles.languageText}>{language}</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 