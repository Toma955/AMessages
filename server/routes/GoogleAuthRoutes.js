import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
const router = express.Router();


const isGoogleOAuthConfigured = () => {
    
    const GOOGLE_CLIENT_ID = '27094931648-hvjgmve0irldebe6d6u897m72cf4h610.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = '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';
    const FRONTEND_URL = 'http://localhost:3000';
    
    console.log('Debug - Google OAuth check:');
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? 'EXISTS' : 'MISSING');
    console.log('FRONTEND_URL:', FRONTEND_URL);
    
    return GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET;
};


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

        
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?token=${token}`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?error=oauth_failed`);
    }
});


router.get('/status', (req, res) => {
    res.json({ 
        authenticated: req.isAuthenticated(),
        user: req.user 
    });
});

export default router; 