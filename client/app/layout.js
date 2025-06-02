import "@/app/styles/global.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
    title: "AMessages"
};

export default function RootLayout({ children }) {
    return (
        <html lang="hr" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
