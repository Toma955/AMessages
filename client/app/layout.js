import "@/app/styles/global.css";
import ClientLayout from "@/components/ClientLayout";
import LogRocketInitializer from "@/components/LogRocketInitializer";
import CanvasBackground from "@/components/CanvasBackground";
import ErrorBoundary from "@/components/ErrorBoundary";
import SentryErrorBoundary from "@/components/SentryErrorBoundary";

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
