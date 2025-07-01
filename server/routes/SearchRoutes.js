import express from "express";
import { searchUsers } from "../controllers/SearchController.js";
import jwtMiddleware from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.get("/users/search", jwtMiddleware, searchUsers);

export default router;
