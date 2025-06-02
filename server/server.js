const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const Sentry = require("@sentry/node");
const { handleNodeRequest, handleNodeError } = require("@sentry/node");
const startupChecks = require("./utils/startupChecks");

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

dotenv.config();

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0
});

const app = express();

/*
app.use((req, res, next) => {
    handleNodeRequest(req, res);
    next();
});
*/

// Enable CORS for frontend
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true
}));

app.use(helmet());
app.use(express.json());

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

require("./routes")(app);
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/group", require("./routes/GroupRoutes"));
app.use("/api/messages", require("./routes/MessageRoutes"));
app.use("/api/search", require("./routes/SearchRoutes"));
app.use("/api", require("./routes/UserRoutes"));

app.get("/test", (req, res) => {
    res.send("Server is up");
});

/*
app.use((err, req, res, next) => {
    handleNodeError(err, req, res);
    next(err);
});
*/

require("./backup");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await startupChecks();
        app.listen(PORT, () => {
            const now = new Date().toISOString().replace("T", " ").slice(0, 19);
            console.log(`Server started at ${now} on port ${PORT}`);
        });
    } catch (err) {
        console.error("Startup failed:", err.message);
        process.exit(1);
    }
}

startServer();
