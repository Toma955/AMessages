"use client";

import { useState } from "react";
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

export default function LoginForm() {
    const router = useRouter();
    const [language, setLanguage] = useState("en");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [hoverText, setHoverText] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [showRegister, setShowRegister] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const t = language === "en" ? eng : hrv;
    const showReset = passwordInput.length > 0;

    const handleGoogleLogin = () => console.log("Google login requested.");
    const handleResetPassword = () => console.log("Reset password requested.");
    const handleCreateAccount = () => setShowRegister(true);
    
    const handleLogin = async () => {
        try {
            if (!emailInput || !passwordInput) {
                setError('Please fill in all fields');
                return;
            }

            setError("");
            setIsLoading(true);

            const data = await api.post('/api/auth/login', {
                username: emailInput,
                password: passwordInput
            });

            // Store the token in both localStorage and cookie
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            setCookie('token', data.token);

            // Redirect to main page
            router.push('/main');
            
        } catch (err) {
            console.error('Login error:', err);
            // Extract error code from the error message
            const errorCode = err.message.includes(':') ? err.message.split(':')[0] : err.message;
            setError(getErrorMessage(errorCode));
        } finally {
            setIsLoading(false);
        }
    };

    if (showRegister) {
        return <RegisterForm onBack={() => setShowRegister(false)} language={language} />;
    }

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <div className="login-box login">
                    <h1 className="title">{t.loginTitle}</h1>
                    {hoverText && <div className="hover-message">{hoverText}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <input 
                        type="text" 
                        placeholder={t.emailPlaceholder}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
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
                        {showReset ? (
                            <button
                                className="icon-circle white"
                                onClick={handleResetPassword}
                                onMouseEnter={() => setHoverText(t.resetHover)}
                                onMouseLeave={() => setHoverText("")}
                            >
                                <Image
                                    src="/icons/reset-password.png"
                                    alt="Reset"
                                    width={24}
                                    height={24}
                                />
                            </button>
                        ) : (
                            <button
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
                        )}

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
                                src="/icons/Magnifying_glass.png"
                                alt="Show"
                                width={24}
                                height={24}
                            />
                        </button>

                        <button
                            className="icon-circle red"
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
    );
}
