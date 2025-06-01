"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingCounter() {
    const [percent, setPercent] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const duration = 3000;
        const steps = 100;
        const intervalTime = duration / steps;

        const interval = setInterval(() => {
            setPercent((prev) => {
                const next = prev + 1;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => router.push("/login"), 100);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="loading-overlay">
            <h1 className="loading-text">{percent}%</h1>
        </div>
    );
}
