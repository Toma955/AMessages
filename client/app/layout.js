import "@/app/styles/global.css";
import ClientLayout from "@/components/ClientLayout/ClientLayout";
import LogRocketInitializer from "@/components/LogRocketInitalizer/LogRocketInitializer";
import CanvasBackground from "@/components/CanvasBackground/CanvasBackground";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import SentryErrorBoundary from "@/components/SentryErrorBoundary/SentryErrorBoundary";

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
                        <ClientLayout>
                            {children}
                        </ClientLayout>
                    </ErrorBoundary>
                </SentryErrorBoundary>
            </body>
        </html>
    );
}
