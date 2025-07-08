import express from "express";
import jwtMiddleware from "../middlewares/jwtMiddleware.js";
import {
    createGroup,
    getGroups,
    getGroupMessages,
    sendGroupMessage,
    addGroupParticipant,
    removeGroupParticipant,
    updateGroupName,
    deleteGroup
} from "../controllers/GroupController.js";

const router = express.Router();

// Group management routes
router.post("/create", jwtMiddleware, createGroup);
router.get("/list", jwtMiddleware, getGroups);
router.get("/:groupId/messages", jwtMiddleware, getGroupMessages);
router.post("/:groupId/messages", jwtMiddleware, sendGroupMessage);
router.post("/:groupId/participants", jwtMiddleware, addGroupParticipant);
router.delete("/:groupId/participants/:userId", jwtMiddleware, removeGroupParticipant);
router.put("/:groupId/name", jwtMiddleware, updateGroupName);
router.delete("/:groupId", jwtMiddleware, deleteGroup);

export default router;
