const getAllMessages = (req, res) => {
  return res.status(200).json({ success: true, message: "Message controller ready." });
};

const startConversation = require("./messages/startConversation");
const createConversation = require("./messages/createConversation");
const sendMessage = require("./messages/sendMessage");
const receiveMessages = require("./messages/receiveMessages");
const archiveMessages = require("./messages/archiveMessages");
const deleteConversation = require("./messages/deleteConversation");

module.exports = {
  getAllMessages,
  startConversation,
  createConversation,
  sendMessage,
  receiveMessages,
  archiveMessages,
  deleteConversation
};
