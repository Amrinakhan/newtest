'use client';

import { useEffect, useState } from 'react';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function FinishSignInPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your login link...');
  const router = useRouter();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Check if the current URL is a sign-in link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus('error');
          setMessage('Invalid or expired login link.');
          alert('❌ Invalid or expired login link.');
          return;
        }

        // Get the email from localStorage
        let email = window.localStorage.getItem('emailForSignIn');

        // If email is not in localStorage, ask the user to enter it
        if (!email) {
          email = window.prompt('Please enter your email for confirmation');
        }

        if (!email) {
          setStatus('error');
          setMessage('Email is required to complete sign-in.');
          alert('❌ Email is required to complete sign-in.');
          return;
        }

        // Complete the sign-in
        const result = await signInWithEmailLink(auth, email, window.location.href);

        // Clear email from localStorage
        window.localStorage.removeItem('emailForSignIn');

        setStatus('success');
        setMessage('✅ Login successful! Redirecting...');
        alert('✅ Login successful! Welcome!');

        // Redirect to home page after 1 second
        setTimeout(() => {
          router.push('/');
        }, 1000);

      } catch (error: any) {
        console.error('Sign-in error:', error);
        setStatus('error');
        setMessage('❌ Error: ' + (error.message || 'Failed to complete sign-in'));
        alert('❌ Sign-in failed: ' + (error.message || 'Unknown error'));
      }
    };

    completeSignIn();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          {status === 'loading' && (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Verifying...
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="text-red-600 text-6xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error
              </h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
