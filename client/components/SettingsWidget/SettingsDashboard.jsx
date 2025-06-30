import React, { useState } from 'react';
import styles from './SettingsDashboard.module.css';
import Image from 'next/image';

export default function SettingsDashboard(props) {
    const [language, setLanguage] = useState('hrv');

    const handleLanguageToggle = () => {
        setLanguage(prev => prev === 'hrv' ? 'eng' : 'hrv');
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.avatarSquare}>
                <Image src="/icons/Plus.png" alt="" width={48} height={48} />
            </div>
            <button className={styles.changePictureMainButton}>
                Promijeni sliku
            </button>

            <div className={styles.inputGroup}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" defaultValue="User Name" />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" defaultValue="username" />
            </div>
            <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" defaultValue="user@example.com" />
            </div>

            <button className={styles.actionButton} onClick={props.onOpenDocument}>
                <Image src="/icons/Doc.png" alt="" width={24} height={24} />
                <span>Upute za rad</span>
            </button>
            <button className={styles.actionButton}>
                <Image src="/icons/Ai.png" alt="" width={24} height={24} />
                <span>Pričaj sa AI</span>
            </button>
            
            <div className={styles.languageToggle}>
                <span>HRV</span>
                <label className={styles.switch}>
                    <input type="checkbox" checked={language === 'eng'} onChange={handleLanguageToggle} />
                    <span className={styles.slider}></span>
                </label>
                <span>ENG</span>
            </div>

            <button className={`${styles.actionButton} ${styles.deleteButton}`}>
                <Image src="/icons/Delette_Account.png" alt="" width={24} height={24} />
                <span>Izbriši račun</span>
            </button>
        </div>
    );
} 