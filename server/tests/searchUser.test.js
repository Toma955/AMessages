const request = require("supertest");
const express = require("express");
const path = require("path");

const searchRoutes = require("../routes/SearchRoutes");
const config = require(path.resolve(__dirname, "../tests/testConfig.json"));

const app = express();
app.use(express.json());
app.use("/api", searchRoutes);

describe("Pretraga korisnika user1 i user2", () => {
  test("Korisnik user1 pronađen", async () => {
    const user = config.users.user1;
    const res = await request(app).get(`/api/users/search?query=${user.username.slice(0, 3)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.results.find((u) => u.username === user.username);
    expect(found).toBeDefined();
  });

  test("Korisnik user2 pronađen", async () => {
    const user = config.users.user2;
    const res = await request(app).get(`/api/users/search?query=${user.username.slice(0, 3)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.results.find((u) => u.username === user.username);
    expect(found).toBeDefined();
  });
});
