import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { fileURLToPath } from 'url';
import path from "path";
import passport from "./config/passport.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import client from "prom-client";
import "./backup.js";
import startupChecks from "./utils/startupChecks.js";
import AdminRoutes from "./routes/AdminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prometheus monitoring
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

//  Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});


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

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.username} (ID: ${socket.userId}) connected`);
    
    
    connectedUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        connectedAt: new Date()
    });

    // Join user to room
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

    // Handle messages read
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

global.io = io;
global.connectedUsers = connectedUsers;

// Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    profilesSampleRate: 1.0,
});

//CORS for frontend
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport 
app.use(passport.initialize());

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

// Prometheus 
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});


import AuthRoutes from "./routes/AuthRoutes.js";
import GoogleAuthRoutes from "./routes/GoogleAuthRoutes.js";
import GroupRoutes from "./routes/GroupRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import SearchRoutes from "./routes/SearchRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import mediaRoutes from "./routes/media.js";

app.use("/api/auth", AuthRoutes);
app.use("/api/auth", GoogleAuthRoutes);
app.use("/api/group", GroupRoutes);
app.use("/api/messages", MessageRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api", UserRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', AdminRoutes);

app.get("/test", (req, res) => {
    res.send("Server is up");
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    
 
    Sentry.captureException(err);
    
    res.status(500).json({ 
        success: false, 
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await startupChecks();
        server.listen(PORT, () => {
            const now = new Date().toISOString().replace("T", " ").slice(0, 19);
            console.log(` Server started at ${now} on port ${PORT}`);
            console.log(` Socket.IO server is running`);
        });
    } catch (err) {
        console.error("Startup failed:", err.message);
        Sentry.captureException(err);
        process.exit(1);
    }
}

startServer();
