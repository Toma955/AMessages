"use client";

import React from 'react';
import Image from 'next/image';
import './SettingsWidget.css';

export default function SettingsWidget({ avatar, username, isVisible, onAvatarClick, gender }) {
    
    const [avatarSrc, setAvatarSrc] = React.useState(avatar);

    React.useEffect(() => {
        setAvatarSrc(avatar);
    }, [avatar]);
    
    const handleError = () => {
        setAvatarSrc(`/avatars/${gender}.png`);
    };
    
    return (
        <div className={`settingsWidgetContainer ${isVisible ? 'visible' : ''}`}>
            <div className="userInfoContainer">
                <div className="avatarWrapper">
                    <button onClick={onAvatarClick} className="avatarButton">
                        <Image
                            src={avatarSrc || `/avatars/${gender}.png`}
                            alt="Profile avatar"
                            width={80}
                            height={80}
                            className="avatar"
                            onError={handleError}
                        />
                    </button>
                </div>
                <div className="username">{username}</div>
            </div>
        </div>
    );
} 