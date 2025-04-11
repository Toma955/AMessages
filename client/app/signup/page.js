"use client";
import Link from "next/link";
import "../styles/signup.css";

export default function SignupPage() {
    return (
        <div className="signup-root">
            <h1>Ovo je Signup</h1>
            <Link href="/">
                <button>Home</button>
            </Link>
        </div>
    );
}
