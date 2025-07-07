import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));

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
