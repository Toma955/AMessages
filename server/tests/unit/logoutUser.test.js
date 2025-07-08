import request from "supertest";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import authRoutes from "../../routes/AuthRoutes.js";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../testConfig.json"), 'utf8'));

const app = express();
app.use(express.json());
app.use("/api", authRoutes);

describe("✅ Logout postojećeg korisnika iz testConfig", () => {
    const user = config.users.user1;
    const loginDb = new Database("database/data/login.db");

    let token = "";
    let userId = "";
    let ip = "";

    beforeAll(() => {
        const session = loginDb
            .prepare(
                `SELECT user_id, ip_address FROM sessions WHERE username = ? AND status = 'active' ORDER BY login_time DESC LIMIT 1`
            )
            .get(user.username);

        if (!session) throw new Error(" Nema aktivne sesije za korisnika!");

        userId = session.user_id;
        ip = session.ip_address;

        const jwtSecret = process.env.JWT_SECRET || "test-secret-key";
        token = jwt.sign({ id: userId, username: user.username, ip }, jwtSecret, {
            expiresIn: "2h"
        });
    });

    test(" Logout aktivnog korisnika", async () => {
        const res = await request(app)
            .post("/api/logout")
            .set("Authorization", `Bearer ${token}`)
            .send({ userId });

        console.log("Logout response:", res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message_code).toBe("LOGOUT_SUCCESS");
    });
});
