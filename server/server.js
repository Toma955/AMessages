const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const Sentry = require("@sentry/node");
const startupChecks = require("./utils/startupChecks");

// Init .env
dotenv.config();

// Init Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

const app = express();

// Sentry request logger
app.use(Sentry.Handlers.requestHandler());

app.use(cors());
app.use(helmet());
app.use(express.json());

// Request log
app.use((req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`Request received: ${now} - [${req.method}] ${req.originalUrl}`);
    next();
});

// Rute
require("./routes")(app);

// Test endpoint
app.get("/test", (req, res) => {
    res.send("Server is up");
});

// Sentry error handler (mora biti nakon ruta)
app.use(Sentry.Handlers.errorHandler());

// Backup scheduler (pokreće se neovisno)
require("./backup");

const PORT = process.env.PORT || 5000;

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
