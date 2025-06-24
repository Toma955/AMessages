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

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState(null);

    const [startupLog, setStartupLog] = useState("");
    const [loadingLog, setLoadingLog] = useState(false);
    const [logError, setLogError] = useState(null);

    const [startupLogFontSize, setStartupLogFontSize] = useState(0.95);

    // Funkcija za dohvat korisnika (može se pozvati i ručno)
    const fetchUsers = () => {
        setLoadingUsers(true);
        setUsersError(null);
        fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.users);
                } else {
                    setUsersError('Greška kod dohvata korisnika');
                }
                setLoadingUsers(false);
            })
            .catch(() => {
                setUsersError('Greška kod dohvata korisnika');
                setLoadingUsers(false);
            });
    };

    const fetchStartupLog = () => {
        setLoadingLog(true);
        setLogError(null);
        fetch('http://localhost:5000/api/admin/logs/startup')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStartupLog(data.log);
                } else {
                    setLogError('Greška kod dohvata loga');
                }
                setLoadingLog(false);
            })
            .catch(() => {
                setLogError('Greška kod dohvata loga');
                setLoadingLog(false);
            });
    };

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

        fetchUsers(); // koristi novu funkciju
        fetchStartupLog();

        return () => window.removeEventListener('resize', checkScreenSize);
    }, [router]);

    const handleLogout = async () => {
        // Call backend logout to close session
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                await fetch('http://localhost:5000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ userId })
                });
            }
        } catch (e) {
            // Ignore errors, continue with logout
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        // Remove token cookie for all paths
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        // Umesto reload-a koristi router.push
        router.push('/login');
    };

    const handleLogSliderChange = (type, value) => {
        setLogValues(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleDeleteUser = (userId) => {
        alert(`Brisanje korisnika s ID: ${userId}`);
        // Ovdje možeš dodati backend poziv za brisanje
    };

    if (!isAdmin) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <h1>Admin Dashboard</h1>
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
                                        {/* <Link href="/main">
                                            <button className="nav-btn">Go to Main</button>
                                        </Link> */}
                                        <button onClick={handleLogout} className="logout-btn">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* <Link href="/main">
                                    <button className="nav-btn">Go to Main</button>
                                </Link> */}
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
                        {loadingUsers ? (
                            <div>Učitavanje korisnika...</div>
                        ) : usersError ? (
                            <div style={{color: 'red'}}>{usersError}</div>
                        ) : (
                            <div className="user-list-admin">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Name</th>
                                            <th>Surname</th>
                                            <th>Gender</th>
                                            <th>Date of Birth</th>
                                            <th>Theme</th>
                                            <th>Language</th>
                                            <th>Created At</th>
                                            <th>
                                                <button className="refresh-users-btn" onClick={fetchUsers} title="Refresh users">
                                                    <img src="/icons/Refresh.png" alt="Refresh" style={{width: 22, height: 22}} />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>{user.name}</td>
                                                <td>{user.surname}</td>
                                                <td>{user.gender}</td>
                                                <td>{user.date_of_birth}</td>
                                                <td>{user.theme}</td>
                                                <td>{user.language}</td>
                                                <td>{user.created_at}</td>
                                                <td>
                                                    <button className="delete-user-btn" onClick={() => handleDeleteUser(user.id)} title="Delete user">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="admin-section logs-section">
                        <div className="logs-title-row">
                            <h2>System Logs</h2>
                        </div>
                        <div className="logs-grid">
                            <div className="log-square">
                                <h3>Startup Logs</h3>
                                <div className="log-content">
                                    <div className="log-slider startup-slider">
                                        <input
                                            type="range"
                                            min="0.7"
                                            max="2"
                                            step="0.01"
                                            value={startupLogFontSize}
                                            className="log-range"
                                            onChange={e => setStartupLogFontSize(Number(e.target.value))}
                                        />
                                        <span className="log-value">{startupLogFontSize.toFixed(2)}x</span>
                                    </div>
                                    <button className="refresh-users-btn" onClick={fetchStartupLog} style={{marginBottom: 8}}>
                                        <img src="/icons/Refresh.png" alt="Refresh" style={{width: 22, height: 22}} />
                                    </button>
                                    {loadingLog ? (
                                        <div>Učitavanje loga...</div>
                                    ) : logError ? (
                                        <div style={{color: 'red'}}>{logError}</div>
                                    ) : startupLog && (
                                        <pre className="startup-log-box" style={{fontSize: `${startupLogFontSize}rem`}}>{startupLog}</pre>
                                    )}
                                </div>
                            </div>
                            {Object.entries(logData).filter(([type]) => type !== 'startup').map(([type, entries]) => (
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
