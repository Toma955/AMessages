"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import "../styles/admin.css";

// Simple Horizontal Line Indicator
function HorizontalIndicator({ value, maxValue = 10, label, color = "#FF5F1F" }) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    
    return (
        <div className="horizontal-indicator">
            <div className="indicator-header">
                <div className="indicator-label">{label}</div>
                <div className="indicator-value">{value}</div>
            </div>
            
            <div className="indicator-container">
                <div className="indicator-track">
                    <div className="indicator-numbers">
                        {Array.from({ length: 11 }, (_, i) => (
                            <span key={i} className="indicator-number">{i}</span>
                        ))}
                    </div>
                    <div className="indicator-line"></div>
                    <div 
                        className="indicator-fill"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: color
                        }}
                    ></div>
                </div>
            </div>
            
            <div className="indicator-footer">
                <span>0</span>
                <span>10</span>
            </div>
        </div>
    );
}

// System Resource Widget
function SystemResourceWidget({ label, value, maxValue, unit = "%", color = "#FF5F1F" }) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    
    return (
        <div className="system-resource-widget">
            <div className="resource-header">
                <div className="resource-label">{label}</div>
                <div className="resource-value">{value}{unit}</div>
            </div>
            <div className="resource-bar-container">
                <div className="resource-bar">
                    <div 
                        className="resource-fill"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: color
                        }}
                    ></div>
                </div>
            </div>
            <div className="resource-footer">
                <span>0%</span>
                <span>100%</span>
            </div>
        </div>
    );
}

// Example log data for each type
const logData = {
    startup: [
        "Startup check initiated.",
        ".env file exists.",
        "Database auth.db exists.",
        "Startup checks passed."
    ],
    auth: [
        "User login successful",
        "JWT token generated",
        "Session created",
        "User logout"
    ],
    requests: [
        "GET /api/users",
        "POST /api/auth/login",
        "PUT /api/settings",
        "DELETE /api/users/123"
    ],
    errors: [
        "Database connection failed",
        "Invalid JWT token",
        "User not found",
        "Permission denied"
    ],
    user: [
        "New user registered",
        "Profile updated",
        "User deleted",
        "Password changed"
    ]
};

export default function AdminPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 7,
        activeUsers: 3,
        totalMessages: 0
    });
    const [systemResources, setSystemResources] = useState({
        ram: 65,
        cpu: 45
    });

    // Log slider states
    const [logValues, setLogValues] = useState({
        startup: 80,
        auth: 70,
        requests: 90,
        errors: 50,
        user: 60
    });

    useEffect(() => {
        // Check if user is admin
        const adminStatus = localStorage.getItem('isAdmin');
        const token = localStorage.getItem('token');
        
        console.log('Admin page - localStorage check:');
        console.log('  adminStatus:', adminStatus);
        console.log('  token:', token ? 'exists' : 'missing');
        
        if (!token) {
            router.push('/login');
            return;
        }

        if (adminStatus === 'true') {
            setIsAdmin(true);
            setUserData({
                username: 'admin',
                role: 'admin'
            });
        } else {
            // Redirect non-admin users
            router.push('/main');
        }

        // Check screen size
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 767);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        router.push('/login');
    };

    const handleLogSliderChange = (type, value) => {
        setLogValues(prev => ({
            ...prev,
            [type]: value
        }));
    };

    if (!isAdmin) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <h1>👑 Admin Dashboard</h1>
                    <div className="admin-actions">
                        {isMobile ? (
                            <>
                                <button 
                                    className="nav-btn"
                                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                                >
                                    {showMobileMenu ? '✕' : '☰'} Menu
                                </button>
                                {showMobileMenu && (
                                    <div className="mobile-menu">
                                        <Link href="/main">
                                            <button className="nav-btn">Go to Main</button>
                                        </Link>
                                        <button onClick={handleLogout} className="logout-btn">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Link href="/main">
                                    <button className="nav-btn">Go to Main</button>
                                </Link>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="admin-content">
                    <section className="admin-section">
                        <h2>System Overview</h2>
                        <div className="stats-grid">
                            <SystemResourceWidget
                                label="RAM Usage"
                                value={systemResources.ram}
                                maxValue={100}
                                unit="%"
                                color="#FF5F1F"
                            />
                            <SystemResourceWidget
                                label="CPU Usage"
                                value={systemResources.cpu}
                                maxValue={100}
                                unit="%"
                                color="#00ff00"
                            />
                            <HorizontalIndicator 
                                value={stats.totalUsers} 
                                label="Total Users" 
                                color="#FF5F1F"
                            />
                            <HorizontalIndicator 
                                value={stats.activeUsers} 
                                label="Active Users" 
                                color={stats.activeUsers === 0 ? "#00ff00" : "#FF5F1F"}
                            />
                        </div>
                    </section>

                    <section className="admin-section">
                        <h2>User Management</h2>
                        <div className="admin-actions">
                            <button className="admin-btn">View All Users</button>
                            <button className="admin-btn">Delete User</button>
                            <button className="admin-btn">Reset IP Attempts</button>
                        </div>
                    </section>

                    <section className="admin-section logs-section">
                        <div className="logs-title-row">
                            <h2>System Logs</h2>
                        </div>
                        <div className="logs-grid">
                            {Object.entries(logData).map(([type, entries]) => (
                                <div className="log-square" key={type}>
                                    <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Logs</h3>
                                    <div className="log-content">
                                        {entries.length > 3 && (
                                            <div className="log-slider">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={logValues[type]}
                                                    className="log-range"
                                                    onChange={e => handleLogSliderChange(type, e.target.value)}
                                                />
                                                <span className="log-value">{logValues[type]}%</span>
                                            </div>
                                        )}
                                        <div className="log-entries">
                                            {entries.map((entry, i) => (
                                                <div className={`log-entry ${type}`} key={i}>{entry}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
