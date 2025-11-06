import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        userId: { type: Number, index: true, required: true, unique: true },
        username: { type: String, index: true, required: true, unique: true },
        email: { type: String },
        isAdmin: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);



