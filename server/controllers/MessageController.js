const getAllMessages = (req, res) => {
  return res.status(200).json({ success: true, message: "Message controller ready." });
};

module.exports = {
  getAllMessages
};
