import startConversation from "./conversations/createConversation.js";
import createConversation from "./conversations/createConversation.js";
import sendMessage from "./conversations/sendMessage.js";
import receiveMessages from "./conversations/receiveMessages.js";
import archiveMessages from "./conversations/archiveMessages.js";
import deleteConversation from "./conversations/deleteConversation.js";

const getAllMessages = (req, res) => {
    return res.status(200).json({ success: true, message: "Message controller ready." });
};

export {
    getAllMessages,
    startConversation,
    createConversation,
    sendMessage,
    receiveMessages,
    archiveMessages,
    deleteConversation
};
