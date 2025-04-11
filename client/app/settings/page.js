"use client";
import Link from "next/link";
import "../styles/settings.css";

export default function SettingsPage() {
    return (
        <div className="settings-root">
            <h1>Ovo je Settings</h1>
            <Link href="/">
                <button>Home</button>
            </Link>
        </div>
    );
}
