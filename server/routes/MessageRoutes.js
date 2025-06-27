const express = require("express");
const router = express.Router();

const {
    getAllMessages,
    startConversation,
    sendMessage,
    receiveMessages,
    archiveMessages,
    deleteConversation
} = require("../controllers/MessageController");

const jwtMiddleware = require("../middlewares/jwtMiddleware");
const markMessagesAsRead = require("../controllers/conversations/markMessagesAsRead");

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

module.exports = router;
