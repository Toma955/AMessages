const request = require("supertest");
const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const userRoutes = require("../routes/UserRoutes");
const config = require("./testConfig.json");

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

const getUserIdByUsername = (username) => {
    const dbPath = path.resolve(__dirname, "../database/data/client_info.db");
    if (!fs.existsSync(dbPath)) {
        console.warn(`Baza ne postoji: ${dbPath}`);
        return null;
    }

    const db = new Database(dbPath);
    const row = db.prepare("SELECT id FROM clients WHERE username = ?").get(username);
    db.close();
    return row?.id || null;
};

describe("Resetiranje testnih korisnika iz testConfig.json", () => {
    const user1 = config.users.user1;
    const user2 = config.users.user2;

    test("Briše korisnika user1 ako postoji", async () => {
        const userId = getUserIdByUsername(user1.username);
        if (!userId) {
            console.log("Korisnik user1 već ne postoji.");
            return expect(true).toBe(true);
        }

        const res = await request(app).delete(`/api/users/${userId}`);
        console.log("Odgovor za brisanje user1:", res.statusCode, res.body);
        expect([200, 404]).toContain(res.statusCode);
    });

    test("Briše korisnika user2 ako postoji", async () => {
        const userId = getUserIdByUsername(user2.username);
        if (!userId) {
            console.log("Korisnik user2 već ne postoji.");
            return expect(true).toBe(true);
        }

        const res = await request(app).delete(`/api/users/${userId}`);
        console.log("Odgovor za brisanje user2:", res.statusCode, res.body);
        expect([200, 404]).toContain(res.statusCode);
    });
});
