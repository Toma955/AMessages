import fs from "fs";
import path from "path";
import errors from "../../constants/errors.json" assert { type: "json" };
import success from "../../constants/success.json" assert { type: "json" };

const deleteConversation = (req, res) => {
  const userId = req.user?.id;
  const otherId = req.params.userId;

  if (!userId || !otherId) {
    return res.status(400).json({ success: false, error_code: errors.MISSING_REQUIRED_FIELD });
  }

  const chatFolder = path.resolve(__dirname, `../../database/users/${userId}/chat/${otherId}`);

  try {
    if (!fs.existsSync(chatFolder)) {
      return res.status(404).json({ success: false, error_code: errors.CONVERSATION_NOT_FOUND });
    }

    fs.rmSync(chatFolder, { recursive: true, force: true });

    return res.status(200).json({
      success: true,
      message_code: success.CONVERSATION_DELETED
    });

  } catch (err) {
    console.error("deleteConversation error:", err.message);
    return res.status(500).json({
      success: false,
      error_code: errors.INTERNAL_ERROR,
      message: "Failed to delete conversation"
    });
  }
};

export default deleteConversation;
