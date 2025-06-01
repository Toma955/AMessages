import "@/app/styles/global.css";
import CanvasBackground from "@/components/CanvasBackground";

export const metadata = {
    title: "Login - AMessages",
    description: "Secure login page"
};

export default function LoginLayout({ children }) {
    return (
        <>
            <div className="fixed inset-0 -z-10">
                <CanvasBackground />
            </div>
            {children}
        </>
    );
}
//
