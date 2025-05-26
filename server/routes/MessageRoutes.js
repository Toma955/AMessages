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
const authMiddleware = require("../middleware/AuthMiddleware");

router.get("/messages", getAllMessages);
router.post("/messages/start", authMiddleware, startConversation);
router.post("/messages/send", authMiddleware, sendMessage);
router.get("/messages/:userId", authMiddleware, receiveMessages);
router.post("/messages/archive/:userId", authMiddleware, (req, res) => {
  archiveMessages(req.user.id, req.params.userId);
  res.status(200).json({ success: true });
});
router.delete("/messages/:userId", authMiddleware, deleteConversation);

module.exports = router;
