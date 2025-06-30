"use client";

import React from 'react';
import Image from 'next/image';
import styles from './SettingsWidget.module.css';

export default function SettingsWidget({ avatar, username, isVisible, onAvatarClick }) {
    return (
        <div className={`${styles.settingsWidgetContainer} ${isVisible ? styles.visible : ''}`}>
            <div className={styles.userInfoContainer}>
                <div className={styles.avatarWrapper}>
                    <button onClick={onAvatarClick} className={styles.avatarButton}>
                        <Image
                            src={avatar || '/avatars/default.png'}
                            alt="Profile avatar"
                            width={80}
                            height={80}
                            className={styles.avatar}
                        />
                    </button>
                </div>
                <div className={styles.username}>{username}</div>
            </div>
        </div>
    );
} 