"use client";

import Image from 'next/image';

export default function GroupButton({ onClick, title = "Grup info" }) {
    return (
        <button 
            className="group-button" 
            title={title} 
            onClick={onClick}
            style={{
                width: '100%',
                height: '50px',
                borderRadius: '25px',
                backgroundColor: 'rgb(224, 133, 67)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0,
                minWidth: '24px',
                minHeight: '16px'
            }}
        >
            <Image
                src="/icons/grup.png"
                alt="Group"
                width={24}
                height={24}
                style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            />
        </button>
    );
} 