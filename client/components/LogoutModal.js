"use client";

import React from 'react';
import styles from './LogoutModal.module.css';

export default function LogoutModal({ isOpen, onClose, onConfirm, language = 'hr' }) {
    if (!isOpen) return null;

    const text = {
        hr: {
            title: 'Želite li izaći?',
            yes: 'Da',
            no: 'Ne'
        },
        en: {
            title: 'Do you want to exit?',
            yes: 'Yes',
            no: 'No'
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2>{text[language].title}</h2>
                <div className={styles.buttons}>
                    <button 
                        className={styles.noButton}
                        onClick={onClose}
                    >
                        {text[language].no}
                    </button>
                    <button 
                        className={styles.yesButton}
                        onClick={onConfirm}
                    >
                        {text[language].yes}
                    </button>
                </div>
            </div>
        </div>
    );
} 