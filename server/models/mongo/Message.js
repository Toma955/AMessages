import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", index: true, required: true },
        senderId: { type: Number, required: true },
        receiverId: { type: Number },
        groupId: { type: Number },
        text: { type: String, required: true },
        status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
        readAt: { type: Date }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);



