import "./styles/global.css";

export const metadata = {
    title: "AMessages",
    description: "Jednostavna aplikacija za dopisivanje"
};

export default function RootLayout({ children }) {
    return (
        <html lang="hr">
            <head />
            <body>{children}</body>
        </html>
    );
}
