import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        image VARCHAR(500),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
    `);

    client.release();

    return NextResponse.json({
      message: 'Users table created successfully!'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
