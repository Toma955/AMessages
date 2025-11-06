import mongoose from "mongoose";
import Conversation from "../../models/mongo/Conversation.js";
import Message from "../../models/mongo/Message.js";

export async function saveMessage({ conversationId, senderId, receiverId, groupId, text }) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const message = await Message.create([
            { conversationId, senderId, receiverId, groupId, text }
        ], { session });

        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $set: { lastMessage: text, lastMessageAt: new Date() },
                ...(receiverId ? { $inc: { [`unreadCounts.${receiverId}`]: 1 } } : {})
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return message[0];
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

export async function getMessages({ conversationId, limit = 50, before }) {
    const query = { conversationId };
    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }
    return Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
}



