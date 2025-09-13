"use client";

import * as Sentry from "@sentry/nextjs";
import { Component } from "react";
import './SentryErrorBoundary.css';

class SentryErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, eventId: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo);
            const eventId = Sentry.captureException(error);
            this.setState({ eventId });
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong!</h2>
                    <p>
                        We've been notified and are working to fix the issue.
                        {this.state.eventId && (
                            <span>
                                {" "}
                                Error ID: {this.state.eventId}
                            </span>
                        )}
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.reload();
                        }}
                        className="retry-button"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default SentryErrorBoundary; 