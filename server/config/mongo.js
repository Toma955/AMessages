import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo(mongoUri) {
    if (isConnected) return mongoose.connection;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not defined");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 10000
    });

    isConnected = true;
    return mongoose.connection;
}

export function getMongoConnection() {
    if (!isConnected) return null;
    return mongoose.connection;
}



