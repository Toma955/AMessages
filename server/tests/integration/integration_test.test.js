const dotenv = require("dotenv");
dotenv.config();
const request = require("supertest");
const express = require("express");
const path = require("path");
const fs = require("fs");
const userRoutes = require("../../routes/UserRoutes.js");
const authRoutes = require("../../routes/AuthRoutes.js");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../testConfig.json"), "utf8"));

const user1 = config.users.user1;
const user2 = config.users.user2;

const app = express();
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", authRoutes);

describe(" Integracijski tok korisnika, kreiranje, logiranje, logoutovanje i brisanje usera ", () => {
    let token1 = "";
    let token2 = "";
    let userId1 = null;
    let userId2 = null;

    test("Kreiraj user1", async () => {
        try {
            const res = await request(app).post("/api/users").send(user1);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("userId");
            userId1 = res.body.userId;
        } catch (err) {
            console.error(" Greška: kreiranje user1", err);
            throw err;
        }
    });

    test(" Kreiraj user2", async () => {
        try {
            const res = await request(app).post("/api/users").send(user2);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("userId");
            userId2 = res.body.userId;
        } catch (err) {
            console.error(" Greška: kreiranje user2", err);
            throw err;
        }
    });

    test(" Login user1", async () => {
        try {
            const res = await request(app)
                .post("/api/login")
                .set("X-Forwarded-For", user1.ip)
                .send({ username: user1.username, password: user1.password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("userId");

            token1 = res.body.token;
            userId1 = res.body.userId;
        } catch (err) {
            console.error(" Greška: login user1", err);
            throw err;
        }
    });

    test(" Login user2", async () => {
        try {
            const res = await request(app)
                .post("/api/login")
                .set("X-Forwarded-For", user2.ip)
                .send({ username: user2.username, password: user2.password });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("userId");

            token2 = res.body.token;
            userId2 = res.body.userId;
        } catch (err) {
            console.error(" Greška: login user2", err);
            throw err;
        }
    });

    test(" Logout user1", async () => {
        try {
            const res = await request(app)
                .post("/api/logout")
                .set("Authorization", `Bearer ${token1}`)
                .send({ userId: userId1 });

            expect(res.statusCode).toBe(200);
        } catch (err) {
            console.error(" Greška: logout user1", err);
            throw err;
        }
    });

    test("Logout user2", async () => {
        try {
            const res = await request(app)
                .post("/api/logout")
                .set("Authorization", `Bearer ${token2}`)
                .send({ userId: userId2 });

            expect(res.statusCode).toBe(200);
        } catch (err) {
            console.error(" Greška: logout user2", err);
            throw err;
        }
    });

    test(" Delete user1", async () => {
        try {
            const res = await request(app).delete(`/api/users/${userId1}`);
            expect(res.statusCode).toBe(200);
        } catch (err) {
            console.error(" Greška: delete user1", err);
            throw err;
        }
    });

    test(" Delete user2", async () => {
        try {
            const res = await request(app).delete(`/api/users/${userId2}`);
            expect(res.statusCode).toBe(200);
        } catch (err) {
            console.error(" Greška: delete user2", err);
            throw err;
        }
    });
});
