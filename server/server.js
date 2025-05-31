const express = require("express"); // Express framework
const cors = require("cors"); // Omogućuje CORS zahtjeve
const dotenv = require("dotenv"); 
const helmet = require("helmet"); // HTTP 
const Sentry = require("@sentry/node"); // Sentry za nadzor pogrešaka u aplikaciji
const { handleNodeRequest, handleNodeError } = require("@sentry/node"); // Middleware za integraciju Sentryja s Expressom
const startupChecks = require("./utils/startupChecks"); // Pokreće provjere prije startanja servera

dotenv.config(); 

Sentry.init({
    dsn: process.env.SENTRY_DSN, //Sentry projekt
    tracesSampleRate: 1.0 // Praćenje performansi
});

const app = express();

app.use((req, res, next) => {
    handleNodeRequest(req, res); // Sentry nadzor zahtjeva
    next();
});

app.use(cors());
app.use(helmet());
app.use(express.json()); // Parsira JSON 

app.use((req, res, next) => {
    const now = new Date().toLocaleString(); // Bilježi sve dolazne zahtjeve
    console.log(`Request received: ${now} - [${req.method}] ${req.originalUrl}`);
    next();
});

require("./routes")(app); // Automatski učitava sve rute iz mape "routes"
app.use("/api/auth", require("./routes/AuthRoutes")); 
app.use("/api/group", require("./routes/GroupRoutes"));
app.use("/api/messages", require("./routes/MessageRoutes"));
app.use("/api/search", require("./routes/SearchRoutes"));
app.use("/api", require("./routes/UserRoutes"));

app.get("/test", (req, res) => {
    res.send("Server is up"); // Testna ruta za provjeru rada servera
});

app.use((err, req, res, next) => {
    handleNodeError(err, req, res); // Sentry hvata neobrađene greške
    next(err);
});

require("./backup");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await startupChecks(); // Provodi inicijalne provjere prije pokretanja servera
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
