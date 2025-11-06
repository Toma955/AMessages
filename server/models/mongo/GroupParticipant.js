import mongoose, { Schema } from "mongoose";

const GroupParticipantSchema = new Schema(
    {
        groupId: { type: Number, index: true, required: true },
        userId: { type: Number, index: true, required: true },
        role: { type: String, enum: ["member", "admin", "owner"], default: "member" },
        joinedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

GroupParticipantSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export default mongoose.models.GroupParticipant || mongoose.model("GroupParticipant", GroupParticipantSchema);



