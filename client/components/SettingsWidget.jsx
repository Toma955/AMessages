"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/app/styles/SettingsWidget.module.css';
import LogoutModal from './LogoutModal';

export default function SettingsWidget({ isVisible, onActivate }) {
    const [language, setLanguage] = useState('HR');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'HR' ? 'EN' : 'HR');
    };

    const handleSettingsClick = () => {
        if (onActivate) {
            onActivate();
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    const handleConfirmDelete = async () => {
        // Pretpostavljamo da postoji API endpoint DELETE /api/users/:id
        // Ovdje bi trebalo dohvatiti userId iz auth contexta ili localStorage-a
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Nije moguće dohvatiti korisnički ID.');
            setShowDeleteModal(false);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('isAdmin');
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
                window.location.href = '/login';
            } else {
                alert('Greška pri brisanju računa.');
            }
        } catch (e) {
            alert('Greška pri komunikaciji s poslužiteljem.');
        }
        setShowDeleteModal(false);
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
                    <button className={`${styles.gridButton} ${styles.deleteButton}`} onClick={handleDeleteClick}>
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
            <LogoutModal
                isOpen={showDeleteModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                language={language === 'HR' ? 'hr' : 'en'}
                message={language === 'HR' ? 'Želite li izbrisati account?' : 'Do you want to delete your account?'}
            />
        </div>
    );
} 