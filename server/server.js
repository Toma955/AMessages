const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const Sentry = require("@sentry/node");
const { handleNodeRequest, handleNodeError } = require("@sentry/node");
const startupChecks = require("./utils/startupChecks");

dotenv.config();

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0
});

const app = express();

app.use((req, res, next) => {
    handleNodeRequest(req, res);
    next();
});

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`Request received: ${now} - [${req.method}] ${req.originalUrl}`);
    next();
});

require("./routes")(app);
app.use("/api", require("./routes/SearchRoutes"));

app.get("/test", (req, res) => {
    res.send("Server is up");
});

app.use((err, req, res, next) => {
    handleNodeError(err, req, res);
    next(err);
});

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
