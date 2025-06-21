import { useEffect, useState } from "react";

export default function Preloader({ isLoaded, onFinish }) {
  const [progress, setProgress] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let interval;
    if (!isLoaded) {
      setProgress(0);
      setHide(false);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 10);
    } else {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setHide(true);
              if (onFinish) onFinish();
            }, 400); // animacija nestajanja
            return 100;
          }
          return prev + 2;
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isLoaded, onFinish]);

  return (
    <div
      className={`preloader-overlay${hide ? " preloader-hide" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
        zIndex: 9999,
        display: hide ? "none" : "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.4s",
        opacity: hide ? 0 : 1,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: "bold" }}>Loading {progress}%</h1>
        <div style={{ marginTop: 16, height: 8, width: 256, background: "#333", borderRadius: 8 }}>
          <div
            style={{
              height: "100%",
              background: "#22c55e",
              borderRadius: 8,
              width: `${progress}%`,
              transition: "width 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
} 