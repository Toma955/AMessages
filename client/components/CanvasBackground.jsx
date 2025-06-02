"use client";

import { useEffect, useRef } from "react";
import { themes } from "@/app/config/themes";

export default function CanvasBackground({ currentTheme = 'orange' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        console.log("CanvasBackground mounted and context obtained");

        function resizeCanvas() {
            const { innerWidth, innerHeight } = window;
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            console.log(`Canvas resized to ${innerWidth}x${innerHeight}`);
        }

        // Initial resize
        resizeCanvas();

        const totalBlobs = Math.floor((canvas.width * canvas.height) / 20000);
        const blobs = [];

        function createBlob(color) {
            const scale = 0.6 + Math.random() * 1.8;
            const baseX = Math.random() * canvas.width * 0.9 + canvas.width * 0.05;
            const baseY = Math.random() * canvas.height * 0.9 + canvas.height * 0.05;
            const circles = [];
            const count = 4 + Math.floor(Math.random() * 4);

            let lastX = baseX;
            let lastY = baseY;
            let lastR = (10 + Math.random() * 10) * scale;

            for (let i = 0; i < count; i++) {
                const r = (10 + Math.random() * 15) * scale;
                const overlap = 0.5 + Math.random() * 0.4;
                const spacing = (lastR + r) * overlap;
                const angle = Math.random() * Math.PI * 2;
                const x = lastX + Math.cos(angle) * spacing;
                const y = lastY + Math.sin(angle) * spacing;
                circles.push({ x, y, r });
                lastX = x;
                lastY = y;
                lastR = r;
            }

            const added = [];
            const step = 8;
            const padding = 2;

            for (let dx = -80; dx <= 80; dx += step) {
                for (let dy = -80; dy <= 80; dy += step) {
                    const px = baseX + dx;
                    const py = baseY + dy;
                    const inside = circles.some(
                        (c) => Math.hypot(c.x - px, c.y - py) < c.r - padding
                    );
                    if (inside) continue;

                    let surrounding = 0;
                    for (let c of circles) {
                        const dist = Math.hypot(c.x - px, c.y - py);
                        if (dist < c.r + step * 1.2) surrounding++;
                    }

                    if (surrounding >= 3) {
                        added.push({ x: px, y: py, r: (6 + Math.random() * 4) * scale });
                    }
                }
            }

            const allCircles = [...circles, ...added];
            const speed = 0.05 + Math.random() * 0.25;
            const angle = Math.random() * Math.PI * 2;

            return {
                circles: allCircles,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                color
            };
        }

        function drawBlob(blob) {
            const { circles, color } = blob;
            ctx.fillStyle = color;
            ctx.beginPath();
            circles.forEach(({ x, y, r }) => {
                ctx.moveTo(x + r, y);
                ctx.arc(x, y, r, 0, Math.PI * 2);
            });
            ctx.fill();
        }

        function updateBlob(blob) {
            let centerX = 0;
            let centerY = 0;
            blob.circles.forEach((c) => {
                centerX += c.x;
                centerY += c.y;
            });
            centerX /= blob.circles.length;
            centerY /= blob.circles.length;

            const margin = 60;
            if (centerX < margin || centerX > canvas.width - margin) blob.dx = -blob.dx;
            if (centerY < margin || centerY > canvas.height - margin) blob.dy = -blob.dy;

            blob.circles.forEach((c) => {
                c.x += blob.dx;
                c.y += blob.dy;
            });
        }

        // Clear existing blobs
        blobs.length = 0;

        // Get current theme colors
        const themeColors = themes[currentTheme].colors;
        
        // Create new blobs with theme colors
        themeColors.forEach((color) => {
            for (let i = 0; i < totalBlobs / themeColors.length; i++) {
                blobs.push(createBlob(color));
            }
        });

        let animationFrameId;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = themes[currentTheme].background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            blobs.forEach((blob) => {
                drawBlob(blob);
                updateBlob(blob);
            });
            animationFrameId = requestAnimationFrame(animate);
        }

        // Start animation
        animate();

        // Handle window resize
        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [currentTheme]); // Dodali smo currentTheme kao dependency

    return (
        <canvas 
            ref={canvasRef} 
            className="canvas-background"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                touchAction: 'none'
            }}
        />
    );
}