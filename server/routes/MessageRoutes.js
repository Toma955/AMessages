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

router.get("/messages", jwtMiddleware, getAllMessages);
router.post("/messages/start", jwtMiddleware, startConversation);
router.post("/messages/send", jwtMiddleware, sendMessage);
router.get("/messages/:userId", jwtMiddleware, receiveMessages);
router.post("/messages/archive/:userId", jwtMiddleware, (req, res) => {
    archiveMessages(req.user.id, req.params.userId);
    res.status(200).json({ success: true });
});
router.delete("/messages/:userId", jwtMiddleware, deleteConversation);

module.exports = router;
