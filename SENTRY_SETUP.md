# Sentry Integration Setup

This document describes the complete Sentry integration for the AMessages application, covering both client and server-side monitoring.

## Overview

Sentry is now fully integrated into the AMessages application to provide:
- Real-time error monitoring and alerting
- Performance monitoring
- User session replay
- Breadcrumb tracking for debugging
- Custom error boundaries

## Configuration Files

### Client-Side Configuration

1. **`client/sentry.client.config.js`** - Client-side Sentry initialization
2. **`client/sentry.server.config.js`** - Server-side Sentry initialization (Next.js)
3. **`client/sentry.edge.config.js`** - Edge runtime Sentry configuration
4. **`client/next.config.js`** - Updated with Sentry webpack plugin

### Server-Side Configuration

1. **`server/server.js`** - Enhanced with Sentry middleware and error handling
2. **`server/package.json`** - Already includes `@sentry/node` dependency

## Environment Variables

### Client (.env.local)
```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

### Server (.env)
```bash
SENTRY_DSN=your-sentry-dsn-here
NODE_ENV=development
```

## Components and Utilities

### Error Boundaries

1. **`SentryErrorBoundary.jsx`** - Main Sentry error boundary component
   - Catches React component errors
   - Displays user-friendly error messages
   - Captures error events in Sentry
   - Provides error ID for support

2. **Integration in `app/layout.js`** - Wraps the entire application

### Utility Functions (`client/utils/sentry.js`)

- `captureUserAction(action, data)` - Track user interactions
- `captureAPIError(error, context)` - Monitor API failures
- `capturePerformanceIssue(issue, data)` - Track performance problems
- `setUserContext(user)` - Set user information in Sentry
- `monitorAPICall(apiCall, context)` - Monitor API call performance
- `withErrorBoundary(Component, fallback)` - HOC for component error handling

## Usage Examples

### Basic Error Tracking
```javascript
import * as Sentry from "@sentry/nextjs";

try {
    // Your code here
} catch (error) {
    Sentry.captureException(error);
}
```

### User Action Tracking
```javascript
import { captureUserAction } from "@/utils/sentry";

captureUserAction("message_sent", {
    receiverId: chat.id,
    messageLength: message.length
});
```

### API Call Monitoring
```javascript
import { monitorAPICall } from "@/utils/sentry";

const result = await monitorAPICall(
    () => fetch('/api/messages'),
    {
        tags: { endpoint: 'messages' },
        extra: { userId: user.id }
    }
);
```

### Setting User Context
```javascript
import { setUserContext } from "@/utils/sentry";

// When user logs in
setUserContext({
    id: user.id,
    username: user.username,
    email: user.email
});

// When user logs out
setUserContext(null);
```

## Features Enabled

### Client-Side
- ✅ Error boundary with user-friendly fallback
- ✅ Session replay (10% sample rate)
- ✅ Performance monitoring
- ✅ Breadcrumb tracking
- ✅ User context tracking
- ✅ Custom error reporting

### Server-Side
- ✅ Request/response monitoring
- ✅ Express.js middleware integration
- ✅ Error capture and reporting
- ✅ Performance profiling
- ✅ Environment-based configuration

## Monitoring Dashboard

Once configured, you can monitor your application in the Sentry dashboard:

1. **Issues** - View and manage error reports
2. **Performance** - Monitor API response times and bottlenecks
3. **Releases** - Track deployment and version information
4. **Users** - Monitor user sessions and errors
5. **Replays** - Watch user sessions to reproduce issues

## Setup Instructions

1. **Create Sentry Project**
   - Go to [sentry.io](https://sentry.io)
   - Create a new project for your application
   - Copy the DSN from the project settings

2. **Configure Environment Variables**
   - Add `SENTRY_DSN` to your server `.env` file
   - Add `NEXT_PUBLIC_SENTRY_DSN` to your client `.env.local` file

3. **Install Dependencies**
   ```bash
   # Client
   cd client && npm install

   # Server (already installed)
   cd server && npm install
   ```

4. **Test the Integration**
   - Start both client and server
   - Trigger an error to verify Sentry is capturing events
   - Check your Sentry dashboard for incoming events

## Best Practices

1. **Don't log sensitive information** - Sentry captures all data sent to it
2. **Use appropriate log levels** - Use `info`, `warning`, `error` appropriately
3. **Add context to errors** - Include relevant tags and extra data
4. **Monitor performance** - Use performance monitoring for slow operations
5. **Set up alerts** - Configure alerts for critical errors

## Troubleshooting

### Common Issues

1. **Events not appearing in Sentry**
   - Check DSN configuration
   - Verify environment variables are loaded
   - Check network connectivity

2. **Source maps not working**
   - Ensure Sentry webpack plugin is configured
   - Check that source maps are generated in production

3. **Performance data missing**
   - Verify `tracesSampleRate` is set correctly
   - Check that performance monitoring is enabled

### Debug Mode

To enable debug mode, set `debug: true` in your Sentry configuration files. This will log detailed information about Sentry operations to the console.

## Security Considerations

- Never commit DSN values to version control
- Use environment variables for all sensitive configuration
- Consider using different DSNs for development and production
- Review what data is being sent to Sentry regularly 