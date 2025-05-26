const request = require("supertest");
const express = require("express");
const path = require("path");
const userRoutes = require("../routes/UserRoutes");

const config = require(path.resolve(__dirname, "testConfig.json"));
const user = config.users.user2;

const app = express();
app.use(express.json());
app.use("/api", userRoutes);

describe(`Kreiranje korisnika - ${user.username}`, () => {
    test("Uspješno kreira korisnika i pokreće backend procese", async () => {
        try {
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

            console.log("Response status:", res.statusCode);
            console.log("Response body:", res.body);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message_code).toBe("USER_CREATED");
            expect(res.body).toHaveProperty("userId");

        } catch (err) {
            console.error("Test failed with error:", err);
            throw err;
        }
    });
});
