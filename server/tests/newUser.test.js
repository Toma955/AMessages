const request = require("supertest");
const express = require("express");
const path = require("path");
const userRoutes = require("../routes/UserRoutes");

const config = require(path.resolve(__dirname, "testConfig.json"));
const user = config.users.user1;

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe("Kreiranje korisnika", () => {
    test("Uspješno kreira korisnika i pokreće backend procese", async () => {
        const res = await request(app).post("/api/users").send({
            username: user.username,
            password: user.password,
            name: user.name,
            surname: user.surname,
            gender: user.gender,
            date_of_birth: user.date_of_birth,
            theme: user.theme,
            language: user.language
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message_code).toBe("USER_CREATED");
        expect(res.body).toHaveProperty("userId");
    });
});
