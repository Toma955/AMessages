"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Listener za load event
    const handleLoad = () => setReady(true);
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    let interval;
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95 && !ready) {
          return 95;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setHide(true);
          setTimeout(() => router.push("/login"), 500); // redirect nakon fade-out
          return 100;
        }
        return prev + 1;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [router, ready]);

  useEffect(() => {
    if (ready && progress < 100) {
      const finish = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(finish);
            return 100;
          }
          return prev + 2;
        });
      }, 10);
      return () => clearInterval(finish);
    }
  }, [ready, progress]);

  return (
    <div
      className={`flex h-screen w-screen items-center justify-center bg-black text-white transition-opacity duration-500 ease-in-out${hide ? " preloader-fadeout" : ""}`}
      style={{
        opacity: hide ? 0 : 1,
        pointerEvents: hide ? "none" : undefined,
        transition: "opacity 0.5s"
      }}
    >
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
