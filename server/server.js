const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Logger middleware – ovo sam zamislio da ispiše vrijeme nekog zahtjeva
app.use((req, res, next) => {
    const now = new Date().toLocaleString();
    console.log(`📥 Zahtjev primljen: ${now} - [${req.method}] ${req.originalUrl}`);
    next();
});

// Ruta za testiranje aplikacije, vraća inace status 200
app.get("/test", (req, res) => {
    res.send("✅ Server aktivan");
});

// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server pokrenut na portu ${PORT}`);
});
