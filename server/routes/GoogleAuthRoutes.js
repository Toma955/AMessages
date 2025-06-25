const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = () => {
    return process.env.GOOGLE_CLIENT_ID && 
           process.env.GOOGLE_CLIENT_SECRET && 
           process.env.GOOGLE_CLIENT_ID !== 'placeholder-client-id';
};

// Google OAuth login route
router.get('/google', (req, res) => {
    if (!isGoogleOAuthConfigured()) {
        return res.status(503).json({ 
            error: 'Google OAuth not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file' 
        });
    }
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res);
});

// Google OAuth callback route
router.get('/google/callback', (req, res, next) => {
    if (!isGoogleOAuthConfigured()) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?error=oauth_not_configured`);
    }
    
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: false 
    })(req, res, next);
}, async (req, res) => {
    try {
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: req.user.id,
                username: req.user.username,
                email: req.user.email,
                provider: req.user.provider
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?error=oauth_failed`);
    }
});

// Check if user is authenticated
router.get('/status', (req, res) => {
    res.json({ 
        authenticated: req.isAuthenticated(),
        user: req.user 
    });
});

module.exports = router; 