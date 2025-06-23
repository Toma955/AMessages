"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import hrv from "../locales/Hrv.json";
import eng from "../locales/Eng.json";
import RegisterForm from "./RegisterForm";
import api from "../utils/api";

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

export default function LoginForm({ 
    backIcon, 
    googleIcon, 
    magnifyingGlassIcon,
    leftIcon,
    rightIcon,
    calendarIcon,
    maleIcon,
    femaleIcon,
    yesIcon,
    noIcon
}) {
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

    const handleGoogleLogin = () => console.log("Google login requested.");
    const handleResetPassword = () => console.log("Reset password requested.");
    const handleCreateAccount = () => {
        console.log("Create Account clicked, setting showRegister to true");
        setShowRegister(true);
    };
    
    const handleLogin = async () => {
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
            if (data.isAdmin) {
                console.log('Admin login detected, setting admin flag');
                localStorage.setItem('isAdmin', 'true');
            } else {
                console.log('Regular user login');
            }
            
            // Backend odlučuje gdje korisnik ide
            const redirectUrl = data.redirectUrl || '/main';
            console.log('Redirecting to:', redirectUrl);
            router.push(redirectUrl);
            setCookie('token', data.token);

           
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

    console.log("showRegister state:", showRegister);

    if (showRegister) {
        console.log("Rendering RegisterForm");
        return <RegisterForm 
            onBack={() => setShowRegister(false)} 
            language={language}
            backIcon={backIcon}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            calendarIcon={calendarIcon}
            maleIcon={maleIcon}
            femaleIcon={femaleIcon}
            googleIcon={googleIcon}
            magnifyingGlassIcon={magnifyingGlassIcon}
            yesIcon={yesIcon}
            noIcon={noIcon}
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

                            <input 
                                type="text" 
                                placeholder={t.usernamePlaceholder}
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                className="login-input"
                            />

                            <input
                                type={passwordVisible ? "text" : "password"}
                                placeholder={t.passwordPlaceholder}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="login-input"
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                            />

                            <div className="icon-buttons">
                                <button
                                    className="icon-circle white"
                                    onClick={handleGoogleLogin}
                                    onMouseEnter={() => setHoverText(t.googleHover)}
                                    onMouseLeave={() => setHoverText("")}
                                >
                                    <Image
                                        src={googleIcon}
                                        alt="Google"
                                        width={24}
                                        height={24}
                                    />
                                </button>
                                <button
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
                                    className={`icon-circle ${passwordVisible ? "red" : "green"}`}
                                    onClick={() => setPasswordVisible((prev) => !prev)}
                                    onMouseEnter={() => setHoverText(passwordVisible ? t.hideHover : t.showHover)}
                                    onMouseLeave={() => setHoverText("")}
                                >
                                    <Image
                                        src={magnifyingGlassIcon}
                                        alt="Show"
                                        width={24}
                                        height={24}
                                    />
                                </button>
                                <button
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
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? "Logging in..." : t.loginButton}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
