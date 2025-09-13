"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [hide, setHide] = useState(false);
  const [serverAlive, setServerAlive] = useState(null);

  // Provjera je li server živ
  useEffect(() => {
    fetch("/test")
      .then((res) => {
        if (res.ok) {
          setServerAlive(true);
        } else {
          setServerAlive(false);
        }
      })
      .catch(() => setServerAlive(false));
  }, []);

  // Sinkronizirani preload
  useEffect(() => {
    if (serverAlive !== true) return;
    const images = [
      '/icons/Arrow.png', '/icons/Cogwheel.png', '/icons/Magnifying_glass.png', '/icons/Mixer.png',
      '/icons/Piano.png', '/icons/Radio.png', '/icons/Record.png', '/icons/Themes.png', '/icons/Shutdown.png',
      '/icons/Green.png', '/icons/Orange.png', '/icons/Yellow.png', '/icons/White.png', '/icons/Red.png', '/icons/Blue.png', '/icons/Black.png',
      '/icons/Swap.png', '/icons/Resize.png', '/icons/Slide.png', '/icons/Delete.png', '/avatars/AI.png', '/avatars/default.png',
      '/icons/Record_player_sound.png', '/icons/Grup_message_sound.png', '/icons/Piano_sound.png', '/icons/Radio_sound.png', '/icons/Notifications.png', '/icons/Sound.png',
      '/icons/Woman.png', '/icons/Man.png'
    ];
    const componentTasks = [
      () => import('@/components/SearchWidget/SearchWidget.jsx'),
      () => import('@/components/SettingsWidget/SettingsDashboard.jsx'),
      () => import('@/components/ChatWindow/ChatWindow.jsx'),
      () => import('@/components/ChatList/ChatListItem.jsx'),
      () => import('@/components/EndToEndMessenger/EndToEndMessenger.jsx'),
      () => import('@/components/RadioPlayer/RadioPlayer.jsx'),
      () => import('@/components/RecordPlayer/RecordPlayer.jsx'),
      () => import('@/components/PianoWidget/PianoWidget.jsx'),
      () => import('@/components/SettingsWidget/SettingsWidget.jsx'),
      () => import('@/components/LogoutModal/LogoutModal.jsx'),
      () => import('@/components/DocumentReader/DocumentReader.jsx'),
      () => import('@/components/RadioPlayer/RadioListWidget.jsx'),
    ];
    const imageTasks = images.map(src => () => new Promise((resolve) => {
      const img = new window.Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = resolve;
    }));
    const allTasks = [...componentTasks, ...imageTasks];
    let completed = 0;
    const total = allTasks.length;
    let cancelled = false;

    (async () => {
      for (const task of allTasks) {
        if (cancelled) return;
        await task();
        completed++;
        setProgress(Math.round((completed / total) * 100));
      }
      // Prefetch rute (ne čekamo, ali pokrećemo)
      router.prefetch('/login');
      router.prefetch('/main');
      router.prefetch('/admin');
      // Čekaj signal iz login stranice
      function handleLoginMounted() {
        setHide(true);
        setTimeout(() => router.push("/login"), 500);
      }
      window.addEventListener("login-mounted", handleLoginMounted);
      // Clean up listener ako se komponenta unmounta
      return () => window.removeEventListener("login-mounted", handleLoginMounted);
    })();
    return () => { cancelled = true; };
  }, [serverAlive, router]);

  if (serverAlive === false) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <h1 className="text-4xl font-bold">404 | Server Not Found</h1>
      </div>
    );
  }

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
