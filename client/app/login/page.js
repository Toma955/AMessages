"use client";

import { useState } from "react";
import Image from "next/image";
import hrv from "@/locales/Hrv.json";
import eng from "@/locales/Eng.json";

export default function LoginPage() {
   
    const [language, setLanguage] = useState("en");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [hoverText, setHoverText] = useState("");
    const [passwordInput, setPasswordInput] = useState("");

   
    const t = language === "en" ? eng : hrv;
    const showReset = passwordInput.length > 0;

    // Handler funkcije
    const handleGoogleLogin = () => console.log("Google login requested.");
    const handleResetPassword = () => console.log("Reset password requested.");
    const handleCreateAccount = () => console.log("Create new account.");

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <div className="login-box">
                    <h1 className="title">{t.loginTitle}</h1>
                    {hoverText && <p className="hover-message">{hoverText}</p>}

                    <input type="text" placeholder={t.emailPlaceholder} className="mb-3" />

                    <input
                        type={passwordVisible ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="mb-4"
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
                            <Image src="/icons/Languages.png" alt="Lang" width={24} height={24} />
                        </button>

                        <button
                            className={`icon-circle ${passwordVisible ? "red" : "green"}`}
                            onClick={() => setPasswordVisible((prev) => !prev)}
                            onMouseEnter={() =>
                                setHoverText(passwordVisible ? t.hideHover : t.showHover)
                            }
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
                            className="icon-circle orange"
                            onClick={handleCreateAccount}
                            onMouseEnter={() => setHoverText(t.newUserHover)}
                            onMouseLeave={() => setHoverText("")}
                        >
                            <Image src="/icons/New_User.png" alt="Add" width={24} height={24} />
                        </button>
                    </div>

                    <button className="primary-button">{t.loginButton}</button>
                </div>
            </div>
        </div>
    );
}
