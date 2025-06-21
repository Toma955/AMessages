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
        let interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setHide(true);
                    return 100;
                }
                return prev + 1;
            });
        }, 15);
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
                        <h1 className="text-4xl font-bold">Loading {progress}%</h1>
                        <div className="mt-4 h-2 w-64 bg-gray-700 rounded">
                            <div
                                className="h-full bg-green-500 rounded"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
