import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema(
    {
        participantIds: { type: [Number], index: true, required: true },
        isGroup: { type: Boolean, default: false },
        groupId: { type: Number },
        lastMessage: { type: String },
        lastMessageAt: { type: Date },
        unreadCounts: { type: Map, of: Number, default: {} }
    },
    { timestamps: true }
);

ConversationSchema.index({ participantIds: 1, lastMessageAt: -1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);



