import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Učitavanje JSON datoteka
const errors = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/errors.json"), 'utf8'));
const success = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../constants/success.json"), 'utf8'));
import createConversation from "./createConversation.js";

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

export default startConversation;
