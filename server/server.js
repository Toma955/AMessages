const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const startupChecks = require("./utils/startupChecks");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
