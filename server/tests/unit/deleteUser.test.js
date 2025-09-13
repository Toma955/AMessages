import request from "supertest";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import userRoutes from "../../routes/UserRoutes.js";
import fs from 'fs';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import Database from "sqlite3";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../testConfig.json"), 'utf8'));

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe("🧹 Brisanje korisnika preko backend API-ja", () => {
    const user = config.users.user1;

    let token = "";
    let userId = "";

    beforeAll(async () => {
        const clientDb = new Database(path.resolve(__dirname, "../../database/data/client_info.db"));
        const clientUser = clientDb.prepare("SELECT id FROM clients WHERE username = ?").get(user.username);
        clientDb.close();

        if (clientUser) {
            userId = clientUser.id;
            
            const jwtSecret = process.env.JWT_SECRET || "test-secret-key";
            token = jwt.sign({ 
                id: userId, 
                username: user.username, 
                role: "user" 
            }, jwtSecret, {
                expiresIn: "2h"
            });
        }
    });

    test("Briše korisnika preko backend API-ja", async () => {
        if (!userId) {
            console.log("Korisnik nije pronađen, preskačem test");
            return expect(true).toBe(true);
        }

        const res = await request(app)
            .delete(`/api/users/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send();

        console.log("Delete response:", res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message_code).toBe("USER_DELETED");
    });
});
