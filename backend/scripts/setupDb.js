const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read and execute schema
        const schemaPath = path.join(__dirname, '../src/db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);
        console.log('✅ Database schema created successfully');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDatabase();
