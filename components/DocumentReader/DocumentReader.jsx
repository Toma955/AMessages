import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './DocumentReader.module.css';
import Image from 'next/image';

export default function DocumentReader({ onClose }) {
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fontSize, setFontSize] = useState(18);
    const [language, setLanguage] = useState('hrv');
    const contentRef = useRef(null);

    const src = language === 'hrv' ? '/documents/Upute.md' : '/documents/Guide.md';

    useEffect(() => {
        if (!src) return;
        setLoading(true);
        setError(null);
        fetch(src)
            .then(res => {
                if (!res.ok) throw new Error('Ne mogu dohvatiti dokument.');
                return res.text();
            })
            .then(setMarkdown)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [src]);

    const handleFontIncrease = () => setFontSize(f => Math.min(f + 2, 40));
    const handleFontDecrease = () => setFontSize(f => Math.max(f - 2, 10));
    const handleLanguageToggle = () => setLanguage(l => l === 'hrv' ? 'eng' : 'hrv');

    return (
        <div className={styles.readerContainer}>
            <div ref={contentRef} className={styles.markdownContent} style={{ fontSize: fontSize, color: '#111' }}>
                {loading && <p>Učitavanje...</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
                {!loading && !error && <ReactMarkdown>{markdown}</ReactMarkdown>}
            </div>
            <div className={styles.controlsBar}>
                <button onClick={handleFontIncrease} title="Povećaj font"><Image src="/icons/Plus.png" alt="Povećaj" width={20} height={20} /></button>
                <button onClick={handleFontDecrease} title="Smanji font"><Image src="/icons/Minus.png" alt="Smanji" width={20} height={20} /></button>
                <button onClick={handleLanguageToggle} title="Promijeni jezik">
                    {language === 'hrv' ? 'HR' : 'EN'}
                </button>
                <button onClick={onClose} title="Zatvori"><Image src="/icons/Close.png" alt="Zatvori" width={20} height={20} /></button>
            </div>
        </div>
    );
} 