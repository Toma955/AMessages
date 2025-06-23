"use client";

import { useEffect, useState } from "react";
import CanvasBackground from "@/components/CanvasBackground";
import LoginForm from "@/components/LoginForm";
import "@/app/styles/login.css";

// Import images
import backIcon from "../../public/icons/Back.png";
import googleIcon from "../../public/icons/Google.png";
import magnifyingGlassIcon from "../../public/icons/Magnifying_glass.png";
import leftIcon from "../../public/icons/Left.png";
import rightIcon from "../../public/icons/Next.png";
import calendarIcon from "../../public/icons/Calendar.png";
import maleIcon from "../../public/icons/Male.png";
import femaleIcon from "../../public/icons/Female.png";
import yesIcon from "../../public/icons/Yes.png";
import noIcon from "../../public/icons/No.png";

export default function LoginPage() {
    const [progress, setProgress] = useState(0);
    const [hide, setHide] = useState(false);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setProgress(i);
            if (i >= 100) {
                clearInterval(interval);
                setTimeout(() => setHide(true), 200);
            }
        }, 20);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <LoginForm 
                backIcon={backIcon}
                googleIcon={googleIcon}
                magnifyingGlassIcon={magnifyingGlassIcon}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                calendarIcon={calendarIcon}
                maleIcon={maleIcon}
                femaleIcon={femaleIcon}
                yesIcon={yesIcon}
                noIcon={noIcon}
            />
            {!hide && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black text-white"
                    style={{
                        zIndex: 9999,
                        opacity: hide ? 0 : 1,
                        pointerEvents: hide ? "none" : undefined,
                        transition: "opacity 0.5s"
                    }}
                >
                    <div className="text-center">
                        <div className="preloader-text">Loading {progress}%</div>
                    </div>
                </div>
            )}
        </div>
    );
}
