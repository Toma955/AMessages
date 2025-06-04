"use client";

import React from 'react';
import Image from 'next/image';
import styles from '@/app/styles/PianoWidget.module.css';

export default function PianoWidget({ isVisible, onActivate, isActive }) {
    return (
        <div className={`${styles.pianoWidgetContainer} ${isVisible ? styles.visible : ''}`}>
            <button 
                className={`${styles.pianoButton} ${isActive ? styles.active : ''}`}
                onClick={onActivate}
            >
                <Image 
                    src="/icons/Piano_Wiget.png"
                    alt="Piano"
                    width={160}
                    height={160}
                    priority
                />
            </button>
        </div>
    );
} 