import "@/app/styles/global.css";
import ClientLayout from "@/components/ClientLayout/ClientLayout";
import LogRocketInitializer from "@/components/LogRocketInitalizer/LogRocketInitializer";
import CanvasBackground from "@/components/CanvasBackground/CanvasBackground";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import SentryErrorBoundary from "@/components/SentryErrorBoundary/SentryErrorBoundary";

// Context providers
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { MediaProvider } from "@/context/MediaContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

export const metadata = {
    title: "AMessages"
};

export default function RootLayout({ children }) {
    return (
        <html lang="hr" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <LogRocketInitializer />
                <CanvasBackground currentTheme="orange" />
                <SentryErrorBoundary>
                    <ErrorBoundary>
                        <AuthProvider>
                            <SocketProvider>
                                <ChatProvider>
                                    <ThemeProvider>
                                        <MediaProvider>
                                            <ClientLayout>
                                                {children}
                                            </ClientLayout>
                                        </MediaProvider>
                                    </ThemeProvider>
                                </ChatProvider>
                            </SocketProvider>
                        </AuthProvider>
                    </ErrorBoundary>
                </SentryErrorBoundary>
            </body>
        </html>
    );
}
