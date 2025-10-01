import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Check if user exists
      const result = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );

      return NextResponse.json({
        exists: result.rows.length > 0,
        user: result.rows.length > 0 ? result.rows[0] : null
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
