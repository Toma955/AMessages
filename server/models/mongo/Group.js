import mongoose, { Schema } from "mongoose";

const GroupSchema = new Schema(
    {
        groupId: { type: Number, index: true, required: true, unique: true },
        name: { type: String, required: true },
        ownerId: { type: Number, required: true }
    },
    { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);



