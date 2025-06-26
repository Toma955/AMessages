const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy - using hardcoded credentials
const GOOGLE_CLIENT_ID = '27094931648-hvjgmve0irldebe6d6u897m72cf4h610.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
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