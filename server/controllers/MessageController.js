const getAllMessages = (req, res) => {
    return res.status(200).json({ success: true, message: "Message controller ready." });
};

const startConversation = require("./conversations/createConversation");
const createConversation = require("./conversations/createConversation");
const sendMessage = require("./conversations/sendMessage");
const receiveMessages = require("./conversations/receiveMessages");
const archiveMessages = require("./conversations/archiveMessages");
const deleteConversation = require("./conversations/deleteConversation");

module.exports = {
    getAllMessages,
    startConversation,
    createConversation,
    sendMessage,
    receiveMessages,
    archiveMessages,
    deleteConversation
};
