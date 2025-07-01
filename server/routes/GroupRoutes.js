import express from "express";
const router = express.Router();

router.get("/groups", (req, res) => {
  res.send("Groups route active.");
});

export default router;
