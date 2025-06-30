const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const Sentry = require("@sentry/node");
// const { Express: SentryExpress } = require("@sentry/integrations"); // više nije potrebno
const startupChecks = require("./utils/startupChecks");
const path = require('path');
const passport = require('./config/passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Prometheus monitoring
const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"]
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 2, 5]
});

// Load environment variables with explicit path
const result = dotenv.config();
console.log('=== Dotenv Debug ===');
console.log('Dotenv result:', result);
console.log('Parsed:', result.parsed);
console.log('Error:', result.error);
console.log('===================');

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'EXISTS' : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'EXISTS' : 'MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);
console.log('===================================');

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

console.log(`Admin credentials loaded: ${ADMIN_USERNAME}`);

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('🔍 Socket.IO Auth: Token provided:', !!token);
    console.log('🔍 Socket.IO Auth: JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!token) {
        console.log('❌ Socket.IO Auth: No token provided');
        return next(new Error('Authentication error'));
    }

    try {
        console.log('🔍 Socket.IO Auth: Attempting to verify token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('✅ Socket.IO Auth: Token verified successfully');
        console.log('🔍 Socket.IO Auth: Decoded token:', { id: decoded.id, username: decoded.username });
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
    } catch (err) {
        console.log('❌ Socket.IO Auth: Token verification failed:', err.message);
        next(new Error('Authentication error'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.username} (ID: ${socket.userId}) connected`);
    
    // Add user to connected users map
    connectedUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle typing events
    socket.on('typing', (data) => {
        const { receiverId, isTyping } = data;
        socket.to(`user_${receiverId}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.username,
            isTyping
        });
    });

    // Handle message read receipts
    socket.on('message_read', (data) => {
        const { messageId, senderId } = data;
        socket.to(`user_${senderId}`).emit('message_read_receipt', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.username} (ID: ${socket.userId}) disconnected`);
        connectedUsers.delete(socket.userId);
    });
});

// Make io available globally
global.io = io;
global.connectedUsers = connectedUsers;

// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    profilesSampleRate: 1.0,
});

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport inicijalizacija
app.use(passport.initialize());

// Static files za pjesme
app.use('/songs', express.static(path.join(__dirname, 'songs')));

app.use((req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`Request received: ${now} - [${req.method}] ${req.originalUrl}`);
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => {
        httpRequestCounter.inc({ method: req.method, route: req.originalUrl, status: res.statusCode });
        end({ method: req.method, route: req.originalUrl, status: res.statusCode });
    });
    next();
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

// require("./routes")(app);
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/auth", require("./routes/GoogleAuthRoutes"));
app.use("/api/group", require("./routes/GroupRoutes"));
app.use("/api/messages", require("./routes/MessageRoutes"));
app.use("/api/search", require("./routes/SearchRoutes"));
app.use("/api", require("./routes/UserRoutes"));
app.use('/api/media', require('./routes/media'));

app.get("/test", (req, res) => {
    res.send("Server is up");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Capture error in Sentry
    Sentry.captureException(err);
    
    res.status(500).json({ 
        success: false, 
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong!' 
    });
});

require("./backup");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await startupChecks();
        server.listen(PORT, () => {
            const now = new Date().toISOString().replace("T", " ").slice(0, 19);
            console.log(`🚀 Server started at ${now} on port ${PORT}`);
            console.log(`🔌 Socket.IO server is running`);
        });
    } catch (err) {
        console.error("Startup failed:", err.message);
        Sentry.captureException(err);
        process.exit(1);
    }
}

startServer();
