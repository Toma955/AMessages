"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingCounter() {
    const [percent, setPercent] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;

        const duration = 15000;
        const steps = 100;
        const intervalTime = duration / steps;

        const interval = setInterval(() => {
            setPercent((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    router.push("/login");
                    return 100;
                }
                return prev + 1;
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [hasMounted, router]);

    if (!hasMounted) return null;

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black z-50 relative">
            <h1 className="text-8xl font-bold text-white">{percent}%</h1>
        </div>
    );
}
