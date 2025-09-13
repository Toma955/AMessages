import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
// import * as Sentry from "@sentry/node";
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

const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL || "http://localhost:3000",
            'https://amessages.vercel.app',
            'https://amessages-frontend.vercel.app',
            'https://amessages-git-main.vercel.app',
            'https://amessages-git-develop.vercel.app',
            'https://amessages-git-feature.vercel.app',
            'https://amessages-git-patch.vercel.app',
            'https://amessages-git-hotfix.vercel.app',
            'https://amessages-git-main-tomababic.vercel.app',
            'https://amessages-git-develop-tomababic.vercel.app'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const connectedUsers = new Map();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    connectedUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        connectedAt: new Date()
    });

    socket.join(`user_${socket.userId}`);

    socket.on('typing', (data) => {
        const { receiverId, isTyping } = data;
        socket.to(`user_${receiverId}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.username,
            isTyping
        });
    });

    socket.on('message_read', (data) => {
        const { messageId, senderId } = data;
        socket.to(`user_${senderId}`).emit('message_read_receipt', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
        });
    });

    socket.on('group_message', (data) => {
        const { groupId, message } = data;
        socket.to(`group_${groupId}`).emit('group_message', {
            groupId,
            message,
            sender: socket.userId,
            senderName: socket.username,
            timestamp: new Date()
        });
    });

    socket.on('join_group', (groupId) => {
        socket.join(`group_${groupId}`);
    });

    socket.on('leave_group', (groupId) => {
        socket.leave(`group_${groupId}`);
    });

    socket.on('disconnect', () => {
        connectedUsers.delete(socket.userId);
    });
});

global.io = io;
global.connectedUsers = connectedUsers;

// Sentry.init({
//     dsn: process.env.SENTRY_DSN || '',
//     environment: process.env.NODE_ENV || 'development',
// });

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'https://amessages.vercel.app',
        'https://amessages-frontend.vercel.app',
        'https://amessages-git-main.vercel.app',
        'https://amessages-git-develop.vercel.app',
        'https://amessages-git-feature.vercel.app',
        'https://amessages-git-patch.vercel.app',
        'https://amessages-git-hotfix.vercel.app',
        'https://amessages-git-main-tomababic.vercel.app',
        'https://amessages-git-develop-tomababic.vercel.app'
    ], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/songs', express.static(path.join(__dirname, 'songs')));

app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on("finish", () => {
        httpRequestCounter.inc({ method: req.method, route: req.originalUrl, status: res.statusCode });
        end({ method: req.method, route: req.originalUrl, status: res.statusCode });
    });
    next();
});

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

app.get("/", (req, res) => {
    res.json({ 
        message: "AMessages Backend API", 
        status: "running",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            messages: "/api/messages",
            groups: "/api/group",
            search: "/api/search",
            media: "/api/media",
            admin: "/api/admin"
        }
    });
});

app.get("/test", (req, res) => {
    res.send("Server is up");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // if (process.env.SENTRY_DSN) {
    //     Sentry.captureException(err);
    // }
    
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
        // if (process.env.SENTRY_DSN) {
        //     Sentry.captureException(err);
        // }
        process.exit(1);
    }
}

startServer();
