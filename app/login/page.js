"use client";

import { useEffect } from "react";
import LoginForm from "@/components/LoginForm/LoginForm.jsx";
import "@/app/styles/login.css";

// Icons will be loaded via Next.js Image component in the components

export default function LoginPage() {
    useEffect(() => {
        // Signaliziraj mountanje login stranice
        window.dispatchEvent(new Event("login-mounted"));
    }, []);

    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <LoginForm />
        </div>
    );
}
