import "@/app/styles/global.css";
import CanvasBackground from "@/components/CanvasBackground";

export const metadata = {
    title: "AMessages",
    description: "Next-gen messaging platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hr">
            <body>
                <CanvasBackground />
                {children}
            </body>
        </html>
    );
}
