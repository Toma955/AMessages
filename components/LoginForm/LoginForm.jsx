"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import hrv from "../../locales/Hrv.json";
import eng from "../../locales/Eng.json";
import RegisterForm from "../RegisterForm/RegisterForm.jsx";
import api from "../../utils/api";
import LogRocket from 'logrocket';
import './LoginForm.css';

const setCookie = (name, value, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'INVALID_CREDENTIALS':
            return 'Invalid username or password';
        case 'TOO_MANY_ATTEMPTS':
            return 'Too many login attempts. Please try again later';
        case 'USER_NOT_FOUND':
            return 'User not found';
        case 'MISSING_REQUIRED_FIELD':
            return 'Please fill in all required fields';
        default:
            return 'An error occurred while logging in';
    }
};

export default function LoginForm() {
    const router = useRouter();
    const [language, setLanguage] = useState("en");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [hoverText, setHoverText] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [usernameInput, setUsernameInput] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const t = language === "en" ? eng : hrv;
    const showReset = passwordInput.length > 0;

    const handleGoogleLogin = () => {
        // Redirect to Google OAuth
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://amessages.onrender.com';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    // Handle OAuth success callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        
        if (token) {
            // Store token and redirect
            localStorage.setItem('token', token);
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            localStorage.setItem('userId', tokenData.userId);
            if (tokenData.provider === 'google') {
                localStorage.setItem('isGoogleUser', 'true');
            }
            
            // Clean URL and redirect
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/main');
        }
        
        if (error) {
            if (error === 'authentication_failed') {
                setError('Your session has expired. Please login again.');
            } else if (error === 'invalid_token') {
                setError('Invalid authentication token. Please login again.');
            } else if (error === 'token_expired') {
                setError('Your session has expired. Please login again.');
            } else if (error === 'oauth_failed') {
                setError('Google authentication failed. Please try again.');
            } else if (error === 'oauth_not_configured') {
                setError('Google authentication is not configured. Please use regular login.');
            } else {
                setError('Authentication failed. Please try again.');
            }
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [router]);

    const handleResetPassword = () => console.log("Reset password requested.");
    const handleCreateAccount = () => {
        console.log("Create Account clicked, setting showRegister to true");
        setShowRegister(true);
    };
    
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        try {
            if (!usernameInput || !passwordInput) {
                setError('Please fill in all fields');
                return;
            }

            setError("");
            setIsLoading(true);

            // Normal user login (includes admin login handled by backend)
            const data = await api.post('/api/auth/login', {
                username: usernameInput,
                password: passwordInput
            });

            console.log('Login response:', data);
           
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            // Provjeri je li korisnik admin prema JWT tokenu
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                if (payload.role === 'admin') {
                    localStorage.setItem('isAdmin', 'true');
                } else {
                    localStorage.removeItem('isAdmin');
                }
            } catch (e) {
                localStorage.removeItem('isAdmin');
            }
            
            // Backend odlučuje gdje korisnik ide
            const redirectUrl = data.redirectUrl || '/main';
            console.log('Redirecting to:', redirectUrl);
            router.push(redirectUrl);
            setCookie('token', data.token);

            console.log('LogRocket: Identifying user:', data.userId, usernameInput);
            LogRocket.identify(data.userId, {
                email: usernameInput,
                name: usernameInput,
                userId: data.userId,
                provider: data.provider,
                isAdmin: data.isAdmin,
                isGoogleUser: data.isGoogleUser
            });
            console.log('LogRocket: User identified successfully');

        } catch (err) {
            console.error('Login error:', err);
           
            const errorCode = err.message.includes(':') ? err.message.split(':')[0] : err.message;
            setError(getErrorMessage(errorCode));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    if (showRegister) {
        return <RegisterForm 
            onBack={() => setShowRegister(false)} 
            language={language}
        />;
    }

    return (
        <>
            <div style={{ display: isLoaded ? undefined : "none" }}>
                <div className="login-container">
                    <div className="login-form-wrapper">
                        <div className="login-box login">
                            <h1 className="title">{t.loginTitle}</h1>
                            {hoverText && <div className="hover-message">{hoverText}</div>}
                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleLogin} autoComplete="on">
                                <input 
                                    type="text" 
                                    placeholder={t.usernamePlaceholder}
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    className="login-input"
                                    name="username"
                                    autoComplete="username"
                                />

                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder={t.passwordPlaceholder}
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="login-input"
                                    name="password"
                                    autoComplete="current-password"
                                />

                                <div className="icon-buttons">
                                    <button
                                        type="button"
                                        className="icon-circle white"
                                        onClick={handleGoogleLogin}
                                        onMouseEnter={() => setHoverText(t.googleHover)}
                                        onMouseLeave={() => setHoverText("")}
                                    >
                                        <Image
                                            src="/icons/Google.png"
                                            alt="Google"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-circle white"
                                        onClick={() => setLanguage((prev) => (prev === "en" ? "hr" : "en"))}
                                        onMouseEnter={() => setHoverText(t.languageHover)}
                                        onMouseLeave={() => setHoverText("")}
                                    >
                                        <Image 
                                            src="/icons/Languages.png" 
                                            alt="Lang" 
                                            width={24} 
                                            height={24}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className={`icon-circle ${passwordVisible ? "red" : "green"}`}
                                        onClick={() => setPasswordVisible((prev) => !prev)}
                                        onMouseEnter={() => setHoverText(passwordVisible ? t.hideHover : t.showHover)}
                                        onMouseLeave={() => setHoverText("")}
                                    >
                                        <Image
                                            src="/icons/Magnifying_glass.png"
                                            alt="Show"
                                            width={24}
                                            height={24}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-circle white"
                                        onClick={handleCreateAccount}
                                        onMouseEnter={() => setHoverText(t.newUserHover)}
                                        onMouseLeave={() => setHoverText("")}
                                    >
                                        <Image 
                                            src="/icons/New_User.png" 
                                            alt="Add" 
                                            width={24} 
                                            height={24}
                                        />
                                    </button>
                                </div>

                                <button 
                                    className="primary-button"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Logging in..." : t.loginButton}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
