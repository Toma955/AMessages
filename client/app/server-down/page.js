'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/not-found.css';
import CanvasBackground from '@/components/CanvasBackground/CanvasBackground';

export default function ServerDown() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let interval;
    let timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/test');
        if (response.ok) {
          router.replace('/'); // Vrati se na početnu ako server oživi
        }
      } catch (error) {
        // Nastavi provjeravati
      }
    };

    // Provjeravaj svake 3 sekunde
    interval = setInterval(checkStatus, 3000);

    // Zaustavi provjeru nakon 1 minute
    timeout = setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false); // Prestani s provjerama
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <>
      <CanvasBackground />
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title" style={{ fontSize: '5rem' }}>404</h1>
          {isChecking ? (
            <p className="not-found-submessage">Pokušavamo ponovno uspostaviti vezu...</p>
          ) : (
            <>
              <p className="not-found-submessage">Server nije dostupan.</p>
              <p className="not-found-submessage">Server is unavailable.</p>
            </>
          )}
        </div>
      </div>
    </>
  );
} 