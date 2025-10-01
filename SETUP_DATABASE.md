# Database Setup Instructions

## Users Table Created! ✅

The users table has been created in your Neon PostgreSQL database.

## If you need to run it manually in Neon Console:

1. Go to: https://console.neon.tech/
2. Select your project: `neondb`
3. Go to SQL Editor
4. Copy and paste this SQL:

```sql
-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  provider VARCHAR(50), -- 'email', 'google', 'facebook', 'apple'
  provider_id VARCHAR(255),
  image VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
```

5. Click "Run" to execute

## To view your users table:

```sql
SELECT * FROM users;
```

## To check if table exists:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'users';
```

## Database Connection Details:
- Host: ep-wandering-wave-adgvg3g0.c-2.us-east-1.aws.neon.tech
- Database: neondb
- User: neondb_owner
- Port: 5432
- SSL: Required

## Authentication System is Ready! 🎉

Your app is now connected to PostgreSQL and ready to:
- Register new users with hashed passwords
- Login with email/password
- Social authentication (Google, Facebook, Apple) - just needs OAuth keys
