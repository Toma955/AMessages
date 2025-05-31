"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/login"), 300); // kasni redirect za UX
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white transition-opacity duration-500 ease-in-out">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Loading {progress}%</h1>
        <div className="mt-4 h-2 w-64 bg-gray-700 rounded">
          <div
            className="h-full bg-green-500 rounded transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
