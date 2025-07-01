import express from "express";
const router = express.Router();

router.get("/settings", (req, res) => {
  res.send("Settings route active.");
});

export default router;
