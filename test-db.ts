
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection(): Promise<void> {
    console.log("\n=== MongoDB Connection Test ===\n");

    if (!MONGODB_URI) {
        console.error("MONGODB_URI is missing from your environment.");
        process.exitCode = 1;
        return;
    }

    console.log("Connection string: Configured via environment");

    try {
        console.log("\nConnecting...");

        const conn = await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            ...(process.env.MONGODB_DB
                ? { dbName: process.env.MONGODB_DB }
                : {}),
        });

        // Get the MongoDB database instance
        const db = conn.connection.db;

        if (!db) {
            throw new Error(
                "MongoDB database connection is unavailable."
            );
        }

        // Get MongoDB server information
        const version = await db.admin().serverStatus();

        console.log("\n✅ Connected successfully!");
        console.log("  Database:", conn.connection.name);
        console.log("  MongoDB version:", version.version);
        console.log(
            "  Uptime (seconds):",
            version.uptimeSeconds
        );

        // Test a simple operation
        const collections = await db
            .listCollections()
            .toArray();

        console.log("  Collections:", collections.length);

        console.log("\n=== Test Passed ===\n");
    } catch (err: unknown) {
        console.error("\n❌ Connection failed!");

        console.error(
            "  Error:",
            err instanceof Error
                ? err.message
                : String(err)
        );

        console.error("\n=== Test Failed ===\n");

        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ MongoDB connection closed.");
    }
}

void testConnection();
