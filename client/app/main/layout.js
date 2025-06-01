import "../styles/main.css";

export default function MainLayout({ children }) {
    return (
        <main className="main-root" style={{ position: 'relative', zIndex: 1 }}>
            {children}
        </main>
    );
}
