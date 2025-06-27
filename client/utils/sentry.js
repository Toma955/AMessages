import * as Sentry from "@sentry/nextjs";

// Utility functions for Sentry monitoring

export const captureUserAction = (action, data = {}) => {
    Sentry.addBreadcrumb({
        category: 'user_action',
        message: action,
        level: 'info',
        data
    });
};

export const captureAPIError = (error, context = {}) => {
    Sentry.captureException(error, {
        tags: {
            type: 'api_error',
            ...context.tags
        },
        extra: {
            ...context.extra,
            timestamp: new Date().toISOString()
        }
    });
};

export const capturePerformanceIssue = (issue, data = {}) => {
    Sentry.captureMessage(issue, {
        level: 'warning',
        tags: {
            type: 'performance_issue'
        },
        extra: data
    });
};

export const setUserContext = (user) => {
    if (user) {
        Sentry.setUser({
            id: user.id,
            username: user.username,
            email: user.email
        });
    } else {
        Sentry.setUser(null);
    }
};

export const setTag = (key, value) => {
    Sentry.setTag(key, value);
};

export const setContext = (name, context) => {
    Sentry.setContext(name, context);
};

// Monitor API calls
export const monitorAPICall = async (apiCall, context = {}) => {
    const startTime = Date.now();
    
    try {
        const result = await apiCall();
        
        // Log successful API call
        Sentry.addBreadcrumb({
            category: 'api',
            message: 'API call successful',
            level: 'info',
            data: {
                ...context,
                duration: Date.now() - startTime
            }
        });
        
        return result;
    } catch (error) {
        // Log failed API call
        captureAPIError(error, {
            tags: context.tags,
            extra: {
                ...context.extra,
                duration: Date.now() - startTime
            }
        });
        throw error;
    }
};

// Monitor component errors
export const withErrorBoundary = (Component, fallback = null) => {
    return function ErrorBoundaryWrapper(props) {
        try {
            return <Component {...props} />;
        } catch (error) {
            Sentry.captureException(error, {
                tags: {
                    component: Component.name || 'Unknown',
                    type: 'component_error'
                },
                extra: {
                    props: JSON.stringify(props)
                }
            });
            
            return fallback || <div>Something went wrong</div>;
        }
    };
}; 