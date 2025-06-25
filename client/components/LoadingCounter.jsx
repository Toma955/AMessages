"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const animateProgress = (start, end, duration, setPercent) => {
    return new Promise(resolve => {
        const stepTime = 20; 
        const totalSteps = duration / stepTime;
        const increment = (end - start) / totalSteps;
        let currentProgress = start;

        const interval = setInterval(() => {
            currentProgress += increment;
            if (currentProgress >= end) {
                clearInterval(interval);
                setPercent(end); 
                resolve();
            } else {
                setPercent(Math.floor(currentProgress));
            }
        }, stepTime);
    });
};

async function checkServerWithTimeout(timeout) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch('http://localhost:5000/test', { signal: controller.signal });
        clearTimeout(id);
        return response.ok;
    } catch (error) {
        return false;
    }
}

export default function LoadingCounter() {
    const [percent, setPercent] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isCheckingServer, setIsCheckingServer] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const setSafePercent = (val) => { if (isMounted) setPercent(val); };

        const initialize = async () => {
            // Provjera servera
            const firstTry = await checkServerWithTimeout(1000);
            if (!firstTry) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const secondTry = await checkServerWithTimeout(1000);
                if (!secondTry) {
                    router.push('/server-down'); // Preusmjeri ako server ne odgovara
                    return;
                }
            }
            
            if (!isMounted) return;
            setIsCheckingServer(false); // Počni prikazivati postotke

            // Nastavi s animacijom
            await router.prefetch('/login');
            await animateProgress(0, 50, 400, setSafePercent);
            await router.prefetch('/main');
            await animateProgress(50, 100, 400, setSafePercent);

            if (isMounted) {
                setIsVisible(false);
                setTimeout(() => router.push('/login'), 500);
            }
        };

        initialize();
        return () => { isMounted = false; };
    }, [router]);

    // Ne prikazuj ništa dok se provjeri server
    if (isCheckingServer) {
        return null;
    }

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
                            transition: 'width 0.02s ease-out'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
