"use client";
import Link from "next/link";
import "../styles/main.css";

export default function MainPage() {
    return (
        <div className="main-root">
            <h1>Ovo je Main</h1>
            <Link href="/">
                <button>Home</button>
            </Link>
        </div>
    );
}
