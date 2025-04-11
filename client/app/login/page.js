"use client";
import Link from "next/link";
import "../styles/login.css";

export default function LoginPage() {
    return (
        <div className="login-root">
            <h1>Ovo je Login</h1>
            <Link href="/">
                <button>Home</button>
            </Link>
        </div>
    );
}
