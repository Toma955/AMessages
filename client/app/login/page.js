"use client";

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
