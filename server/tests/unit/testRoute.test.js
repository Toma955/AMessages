import request from "supertest";
import express from "express";

const app = express();

app.get("/test", (req, res) => {
  res.send("Server aktivan");
});

describe("Test ruta", () => {
  test("vraća status 200 i tekst 'Server aktivan'", async () => {
    const res = await request(app).get("/test");

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Server aktivan");
  });
});
