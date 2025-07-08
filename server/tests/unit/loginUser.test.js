import request from "supertest";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import authRoutes from "../../routes/AuthRoutes.js";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../testConfig.json"), 'utf8'));
const user = config.users.user1;

const app = express();
app.use(express.json());
app.use("/api", authRoutes);

describe("Login korisnika", () => {
    test("Prijavljuje korisnika iz testConfig", async () => {
        const res = await request(app)
            .post("/api/login")
            .set("X-Forwarded-For", user.ip)
            .send({ username: user.username, password: user.password });

        console.log("RESPONSE BODY:", res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message_code).toBe("LOGIN_SUCCESS");
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("userId");
    });
});
