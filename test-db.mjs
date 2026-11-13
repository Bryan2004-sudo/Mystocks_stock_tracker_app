import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bryan:o8aLd9uMcXamCxRC@cluster0.exosspt.mongodb.net/?retryWrites=true&w=majority';

async function testConnection() {
    console.log('\n=== MongoDB Connection Test (Node.js) ===\n');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));

    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('\nConnecting...');
        await client.connect();

        const db = client.db();
        const admin = db.admin();
        const status = await admin.serverStatus();

        console.log('\n✅ Connected successfully!');
        console.log('  Database:', db.databaseName);
        console.log('  MongoDB version:', status.version);
        console.log('  Uptime (seconds):', status.uptimeSeconds);

        const collections = await db.listCollections().toArray();
        console.log('  Collections:', collections.length);

        await client.close();
        console.log('\n✅ Disconnected cleanly.');
        console.log('\n=== Test Passed ===\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Connection failed!');
        console.error('  Error:', err.message);
        console.error('\n=== Test Failed ===\n');
        process.exit(1);
    }
}

testConnection();
