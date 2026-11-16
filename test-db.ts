import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bryan:o8aLd9uMcXamCxRC@cluster0.exosspt.mongodb.net/?retryWrites=true&w=majority';

async function testConnection() {
    console.log('\n=== MongoDB Connection Test ===\n');
    console.log('Connection string:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@'));

    try {
        console.log('\nConnecting...');
        const conn = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
        const version = await mongoose.connection.db.admin().serverStatus();

        console.log('\n✅ Connected successfully!');
        console.log('  Database:', mongoose.connection.name);
        console.log('  MongoDB version:', version.version);
        console.log('  Uptime (seconds):', version.uptimeSeconds);

        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('  Collections:', collections.length);

        await mongoose.disconnect();
        console.log('\n✅ Disconnected cleanly.');
        console.log('\n=== Test Passed ===\n');
        process.exit(0);
    } catch (err: any) {
        console.error('\n❌ Connection failed!');
        console.error('  Error:', err.message);
        console.error('\n=== Test Failed ===\n');
        process.exit(1);
    }
}

testConnection();
