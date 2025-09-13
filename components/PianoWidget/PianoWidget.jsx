"use client";

import React from 'react';
import Image from 'next/image';
import './PianoWidget.css';

export default function PianoWidget({ isVisible, onActivate, isActive }) {
    return (
        <div className={`pianoWidgetContainer ${isVisible ? 'visible' : ''}`}>
            <button 
                className={`pianoButton ${isActive ? 'active' : ''}`}
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