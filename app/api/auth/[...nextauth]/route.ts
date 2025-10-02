import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

const authOptions: NextAuthOptions = {
  providers: [
    // Uncomment when OAuth credentials are configured
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID || '',
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    // }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID || '',
    //   clientSecret: process.env.APPLE_SECRET || '',
    // }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const client = await pool.connect();
        try {
          const result = await client.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [credentials.email, 'email']
          );

          if (result.rows.length === 0) {
            throw new Error('No user found');
          }

          const user = result.rows[0];

          if (!user.password) {
            throw new Error('Invalid login method');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } finally {
          client.release();
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const client = await pool.connect();
      try {
        // Check if user exists
        const existingUser = await client.query(
          'SELECT * FROM users WHERE email = $1',
          [user.email]
        );

        if (existingUser.rows.length === 0) {
          // Create new user
          await client.query(
            `INSERT INTO users (email, name, image, provider, provider_id, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              user.email,
              user.name || '',
              user.image || '',
              account?.provider || 'email',
              account?.providerAccountId || '',
              true,
            ]
          );
        } else {
          // Update existing user
          await client.query(
            `UPDATE users SET name = $1, image = $2, updated_at = CURRENT_TIMESTAMP
             WHERE email = $3`,
            [user.name || '', user.image || '', user.email]
          );
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      } finally {
        client.release();
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
