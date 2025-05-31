// app/layout.js
import "./styles/global.css";
import CanvasBackground from "@/components/CanvasBackground";

export const metadata = {
  title: "AMessages",
  description: "Next-gen messaging platform",
};

export default function RootLayout({ children }) {
  return (
   <html lang="hr">
  <body className="m-0 p-0 overflow-hidden">
    <div className="fixed inset-0 -z-10">
      <CanvasBackground />
    </div>
    <main className="relative z-10 h-screen w-screen flex items-center justify-center">
      {children}
    </main>
  </body>
</html>
  );
}
