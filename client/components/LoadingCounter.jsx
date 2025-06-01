"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingCounter() {
    const [percent, setPercent] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setPercent((prev) => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(interval);
                    // Start fade out animation
                    setIsVisible(false);
                    // Wait for animation to complete before navigation
                    setTimeout(() => router.push("/login"), 500);
                    return 100;
                }
                return next;
            });
        }, 25);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div 
            className="loading-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.7)',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                zIndex: 10
            }}
        >
            <div 
                style={{
                    textAlign: 'center',
                    color: '#ff884d',
                    transform: `scale(${isVisible ? 1 : 0.8})`,
                    transition: 'transform 0.5s ease-in-out'
                }}
            >
                <p className="loading-text" style={{ fontSize: '5rem', fontWeight: 'bold' }}>{percent}%</p>
                <div 
                    style={{
                        width: '300px',
                        height: '4px',
                        background: '#333',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        margin: '20px auto'
                    }}
                >
                    <div 
                        style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: '#ff884d',
                            transition: 'width 0.3s ease-in-out'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
