"use client";
import Link from "next/link";
import { useState } from "react";
import "./styles/page.css";
import Hrv from "../locales/Hrv.json";
import Eng from "../locales/Eng.json";

export default function HomePage() {
    const [lang, setLang] = useState("hr");
    const t = lang === "hr" ? Hrv : Eng;

    const testServer = async () => {
        try {
            const res = await fetch("http://localhost:5000/test");
            const data = await res.text();
            console.log("✅ Odgovor sa servera:", data);
            alert(data);
        } catch (err) {
            console.error("Server nedostupan");
            alert("Server nije dostupan");
        }
    };

    const switchLang = () => {
        setLang(lang === "hr" ? "en" : "hr");
    };

    return (
        <div className="home-page">
            <h1>{t.title}</h1>

            <div className="button-group">
                <Link href="/login">
                    <button>{t.login}</button>
                </Link>
                <Link href="/signup">
                    <button>{t.signup}</button>
                </Link>
                <Link href="/main">
                    <button>{t.main}</button>
                </Link>
                <Link href="/settings">
                    <button>{t.settings}</button>
                </Link>
                <button onClick={testServer}>{t.test_server}</button>
                <button onClick={switchLang}>{t.switch_lang}</button>
            </div>
        </div>
    );
}
