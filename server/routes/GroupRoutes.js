import express from "express";
import { handleCreateGroup, handleGetUserGroups, handleGetGroupMessages, handleSendGroupMessage, handleAddParticipant, handleRemoveParticipant } from "../controllers/GroupController.js";
import jwtMiddleware from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/create", jwtMiddleware, handleCreateGroup);
router.get("/user-groups", jwtMiddleware, handleGetUserGroups);
router.get("/messages/:groupId", jwtMiddleware, handleGetGroupMessages);
router.post("/send-message", jwtMiddleware, handleSendGroupMessage);
router.post("/add-participant", jwtMiddleware, handleAddParticipant);
router.post("/remove-participant", jwtMiddleware, handleRemoveParticipant);

export default router;
