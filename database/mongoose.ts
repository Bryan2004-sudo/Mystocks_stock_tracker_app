
import mongoose from "mongoose";

declare global {
    var mongooseCache:
        | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
        | undefined;
}

const cached =
    globalThis.mongooseCache ??
    (globalThis.mongooseCache = {
        conn: null,
        promise: null,
    });

export const connectToDatabase = async (): Promise<
    typeof mongoose
> => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            "MONGODB_URI must be set within .env.local"
        );
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            ...(process.env.MONGODB_DB
                ? { dbName: process.env.MONGODB_DB }
                : {}),
        });
    }

    try {
        cached.conn = await cached.promise;

        console.log(
            `Connected to MongoDB (${process.env.NODE_ENV})`
        );

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
};
