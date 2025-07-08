# Google OAuth Setup Guide

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://amessages.onrender.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret

## 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://amessages-frontend.onrender.com
```

## 3. Database Setup

The system will automatically create the users table with Google OAuth support when you first run the application.

## 4. Testing

1. Start your server: `npm start`
2. Start your frontend: `npm run dev`
3. Go to login page and click the Google icon
4. Complete Google OAuth flow
5. You should be redirected back to your app and logged in

## 5. Features

- ✅ Google OAuth login
- ✅ Automatic user creation for new Google users
- ✅ JWT token generation
- ✅ User profile data (name, email, avatar)
- ✅ Session management
- ✅ Error handling

## 6. Security Notes

- Always use HTTPS in production
- Keep your Client Secret secure
- Regularly rotate your JWT secret
- Validate tokens on protected routes 