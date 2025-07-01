import express from "express";
import {
    getAllMessages,
    startConversation,
    sendMessage,
    receiveMessages,
    archiveMessages,
    deleteConversation
} from "../controllers/MessageController.js";
import jwtMiddleware from "../middlewares/jwtMiddleware.js";
import markMessagesAsRead from "../controllers/conversations/markMessagesAsRead.js";

const router = express.Router();

router.get("/", jwtMiddleware, getAllMessages);
router.post("/start", jwtMiddleware, startConversation);
router.post("/send", jwtMiddleware, sendMessage);
router.get("/:userId", jwtMiddleware, receiveMessages);
router.post("/archive/:userId", jwtMiddleware, (req, res) => {
    archiveMessages(req.user.id, req.params.userId);
    res.status(200).json({ success: true });
});
router.delete("/:userId", jwtMiddleware, deleteConversation);
router.post("/read", jwtMiddleware, markMessagesAsRead);

export default router;
