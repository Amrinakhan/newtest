import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await client.query(
        `INSERT INTO users (email, password, name, provider, email_verified)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, name`,
        [email, hashedPassword, name || '', 'email', false]
      );

      return NextResponse.json({
        message: 'User created successfully',
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
