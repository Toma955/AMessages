"use client";

export default function MainPage() {
    return (
        <div className="main-page">
            <section className="welcome-section">
                <h1>Welcome to AMessages</h1>
                <p>Your secure messaging platform</p>
            </section>
            
            <section className="features-section">
                <div className="feature-card">
                    <h3>Instant Messaging</h3>
                    <p>Connect with others in real-time</p>
                </div>
                <div className="feature-card">
                    <h3>Secure Communication</h3>
                    <p>Your messages are protected</p>
                </div>
                <div className="feature-card">
                    <h3>Easy to Use</h3>
                    <p>Simple and intuitive interface</p>
                </div>
            </section>
        </div>
    );
}
