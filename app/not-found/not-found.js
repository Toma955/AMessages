'use client';

import './styles/not-found.css';
import CanvasBackground from '@/components/CanvasBackground/CanvasBackground';

export default function NotFound() {
  return (
    <>
      <CanvasBackground />
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <p className="not-found-message">Stranica nije pronađena / Page Not Found</p>
          <p className="not-found-submessage">
            Tražena stranica ne postoji. / The requested page does not exist.
          </p>
        </div>
      </div>
    </>
  );
} 