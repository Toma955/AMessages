const createConversation = require("./createConversation");
const errors = require("../../constants/errors.json");
const success = require("../../constants/success.json");

const startConversation = (req, res) => {
  const senderId = req.user?.id;
  const receiverId = req.body.receiverId;

  if (!senderId || !receiverId) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ success: false, error_code: errors.INVALID_OPERATION });
  }

  const created = createConversation(senderId, receiverId);

  return res.status(created ? 201 : 200).json({
    success: true,
    message_code: created ? success.CONVERSATION_CREATED : success.CONVERSATION_EXISTS
  });
};

module.exports = startConversation;
