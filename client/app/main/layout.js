import { Suspense } from "react";
import ClientMainLayout from "./ClientMainLayout";
import CanvasBackground from "@/components/CanvasBackground/CanvasBackground";

export default function MainLayout({ children }) {
    return (
        <Suspense fallback={
            <div className="main-container">
                <CanvasBackground currentTheme="orange" />
                <div className="content-container">
                    <div className="contacts-panel panel-border">
                        <div className="panel-content">
                            <div className="contacts-list">
                                {/* Loading state */}
                            </div>
                        </div>
                    </div>
                    <div className="chat-area panel-border">
                        <div className="drop-chat-hint">
                            Loading...
                        </div>
                    </div>
                    <div className="details-panel panel-border">
                        {/* Loading state */}
                    </div>
                </div>
            </div>
        }>
            <ClientMainLayout>
                {children}
            </ClientMainLayout>
        </Suspense>
    );
}
