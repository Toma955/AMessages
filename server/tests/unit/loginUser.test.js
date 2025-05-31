require("dotenv").config();
const request = require("supertest");
const express = require("express");
const authRoutes = require("../../routes/AuthRoutes");
const config = require("../testUtils");

const app = express();
app.use(express.json());
app.use("/api", authRoutes);

describe(" Login korisnika", () => {
    const user = config.users.user1;

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
