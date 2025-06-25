const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy - temporarily disabled until credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'placeholder-client-id') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findByGoogleId(profile.id);
            
            if (user) {
                return done(null, user);
            }
            
            // Create new user if doesn't exist
            const newUser = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value,
                provider: 'google'
            };
            
            user = await User.create(newUser);
            return done(null, user);
            
        } catch (error) {
            return done(error, null);
        }
    }));
} else {
    console.log('Google OAuth disabled - missing credentials. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 