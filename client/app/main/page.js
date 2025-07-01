"use client";

import { useEffect, useState } from 'react';

export default function MainPage() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const adminStatus = localStorage.getItem('isAdmin');
        
        if (adminStatus === 'true') {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, []);

    return (
        <div className="main-page">
            <section className="welcome-section">
                <h1>Welcome to AMessages</h1>
                <p>Your secure messaging platform</p>
                {isAdmin && (
                    <div className="admin-badge">
                        <span>👑 Admin Mode</span>
                    </div>
                )}
            </section>
            
            {isAdmin && (
                <section className="admin-section">
                    <h2>Admin Panel</h2>
                    <div className="admin-actions">
                        <button className="admin-btn">View All Users</button>
                        <button className="admin-btn">System Stats</button>
                        <button className="admin-btn">Reset IP Attempts</button>
                    </div>
                </section>
            )}
            
            <section className="features-section">
                <div className="feature-card">
                    <h3>Instant Messaging</h3>
                    <p>Connect with others in real-time</p>
                </div>
                <div className="feature-card">
                    <h3>Secure Communication</h3>
                    <p>Your messages are protected</p>
                </div>
                <div className="feature-card">
                    <h3>Easy to Use</h3>
                    <p>Simple and intuitive interface</p>
                </div>
            </section>
            
            {/* Debug info */}
            <div style={{marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px'}}>
                <h3>Debug Info:</h3>
                <p>isAdmin state: {isAdmin ? 'true' : 'false'}</p>
                <p>localStorage isAdmin: {typeof window !== 'undefined' ? localStorage.getItem('isAdmin') : 'N/A'}</p>
            </div>
        </div>
    );
}
