import React, { useState, useRef } from 'react';
import styles from './SettingsDashboard.module.css';
import Image from 'next/image';
import api from '../../services/api';

export default function SettingsDashboard(props) {
    const { avatar, gender } = props;
    const [language, setLanguage] = useState('hrv');
    const [avatarSrc, setAvatarSrc] = useState(avatar);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef(null);

    const handleLanguageToggle = () => {
        setLanguage(prev => prev === 'hrv' ? 'eng' : 'hrv');
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            // Ovdje treba aktivirati rutu na serveru
            // const response = await api.post('/users/me/profile-picture', formData, {
            //     headers: { 'Content-Type': 'multipart/form-data' }
            // });
            // if (response.data.success) {
            // Privremeno, dok se ne implementira upload
            const newAvatarSrc = URL.createObjectURL(file);
            setAvatarSrc(newAvatarSrc);
            // }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            // Vratiti na stari avatar ako upload ne uspije
            setAvatarSrc(avatar);
        }
    };
    
    const handleImageError = () => {
        setAvatarSrc(`/avatars/${gender}.png`);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Jeste li sigurni da želite obrisati svoj račun? Ova akcija se ne može poništiti.')) {
            setIsDeleting(true);
            try {
                const response = await api.delete('/api/me');
                if (response.success) {
                    // Obriši token iz localStorage
                    localStorage.removeItem('token');
                    // Preusmjeri na login stranicu
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Greška pri brisanju računa. Pokušajte ponovno.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
            />
            <div className={styles.avatarSquare} onClick={handleAvatarClick}>
                <Image 
                    src={avatarSrc} 
                    alt="User Avatar" 
                    width={48} 
                    height={48}
                    onError={handleImageError}
                />
            </div>
            <button className={styles.changePictureMainButton} onClick={handleAvatarClick}>
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
            <button className={styles.actionButton} onClick={props.onOpenAiChat}>
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

            <button 
                className={`${styles.actionButton} ${styles.deleteButton}`} 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
            >
                <Image src="/icons/Delette_Account.png" alt="" width={24} height={24} />
                <span>{isDeleting ? 'Brisanje...' : 'Izbriši račun'}</span>
            </button>
        </div>
    );
} 