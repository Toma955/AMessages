"use client";

import React from 'react';
import styles from './LogoutModal.module.css';

export default function LogoutModal({ isOpen, onClose, onConfirm, language = 'hr', message }) {
    if (!isOpen) return null;

    // Odredi poruku
    let promptMessage = message;
    if (!promptMessage) {
        promptMessage = language === 'hr'
            ? 'Želite li izaći?'
            : 'Do you want to log out?';
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <p>{promptMessage}</p>
                <div className={styles.buttons}>
                    <button className={styles.yesButton} onClick={onConfirm}>
                        {language === 'hr' ? 'Da' : 'Yes'}
                    </button>
                    <button className={styles.noButton} onClick={onClose}>
                        {language === 'hr' ? 'Ne' : 'No'}
                    </button>
                </div>
            </div>
        </div>
    );
} 