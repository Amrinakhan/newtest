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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET ? [
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            return null;
          }

          console.log('Attempting authorization for:', credentials.email);

          const client = await pool.connect();
          try {
            const result = await client.query(
              'SELECT * FROM users WHERE email = $1 AND provider = $2',
              [credentials.email, 'email']
            );

            console.log('Auth check for:', credentials.email, 'Found:', result.rows.length);

            if (result.rows.length === 0) {
              console.log('No user found for email:', credentials.email);
              return null;
            }

            const user = result.rows[0];

            if (!user.password) {
              console.error('User has no password');
              return null;
            }

            // Check if it's an auto-generated password (passwordless login)
            const isAutoPassword = credentials.password.startsWith('auto-generated-');

            if (isAutoPassword) {
              // For passwordless login, just verify it's the correct auto-password format
              const expectedAutoPassword = 'auto-generated-' + credentials.email.replace(/[^a-zA-Z0-9]/g, '') + '-password';

              if (credentials.password === expectedAutoPassword) {
                // Valid passwordless login - allow access
                console.log('Passwordless login successful for:', credentials.email);

                return {
                  id: user.id.toString(),
                  email: user.email,
                  name: user.name,
                  image: user.image,
                };
              } else {
                console.error('Invalid passwordless token');
                return null;
              }
            } else {
              // Regular password check
              const isValid = await bcrypt.compare(credentials.password, user.password);

              console.log('Password valid:', isValid);

              if (!isValid) {
                console.error('Invalid password for user:', credentials.email);
                return null;
              }
            }

            console.log('Authorization successful for:', credentials.email);
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (queryError) {
            console.error('Database query error:', queryError);
            return null;
          } finally {
            client.release();
          }
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
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
