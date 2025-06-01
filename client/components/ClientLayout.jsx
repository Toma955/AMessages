'use client';

import CanvasBackground from "./CanvasBackground";

export default function ClientLayout({ children }) {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
            }}>
                <CanvasBackground />
            </div>
            <div style={{ 
                position: 'relative',
                zIndex: 1,
                minHeight: '100vh'
            }}>
                {children}
            </div>
        </div>
    );
} 