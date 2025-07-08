"use client";

import { useEffect } from "react";
import LoginForm from "@/components/LoginForm/LoginForm.jsx";
import "@/app/styles/login.css";

import backIcon from "/icons/Back.png";
import googleIcon from "/icons/Google.png";
import magnifyingGlassIcon from "/icons/Magnifying_glass.png";
import leftIcon from "/icons/Left.png";
import rightIcon from "/icons/Next.png";
import calendarIcon from "/icons/Calendar.png";
import maleIcon from "/icons/Male.png";
import femaleIcon from "/icons/Female.png";
import yesIcon from "/icons/Yes.png";
import noIcon from "/icons/No.png";

export default function LoginPage() {
    useEffect(() => {
        // Signaliziraj mountanje login stranice
        window.dispatchEvent(new Event("login-mounted"));
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
        </div>
    );
}
