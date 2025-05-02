const getAllConversations = (req, res) => {
  return res.status(200).json({ success: true, message: "Conversation controller ready." });
};

module.exports = {
  getAllConversations
};