'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

type ModalView = 'main' | 'signin' | 'join' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'main' | 'join' | 'signin';
}

export default function AuthModal({ isOpen, onClose, initialView = 'main' }: AuthModalProps) {
  const [view, setView] = useState<ModalView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to register');
        return;
      }

      // Auto login after registration
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      onClose();
      window.location.reload();
    } catch (error) {
      setError('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOnlyLogin = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user exists
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const userData = await checkResponse.json();

      if (userData.exists) {
        // User already exists - auto login without password
        const autoPassword = 'auto-generated-' + email.replace(/[^a-zA-Z0-9]/g, '') + '-password';

        const result = await signIn('credentials', {
          email,
          password: autoPassword,
          redirect: false,
        });

        if (result?.ok) {
          onClose();
          window.location.reload();
        } else {
          // If auto-password doesn't work, redirect to manual login
          setError('Please use Sign In button to enter your password.');
          setView('signin');
        }
        setLoading(false);
        return;
      }

      // User doesn't exist - create new account
      // Use email-based password (consistent for each email)
      const autoPassword = 'auto-generated-' + email.replace(/[^a-zA-Z0-9]/g, '') + '-password';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: autoPassword,
          name: email.split('@')[0]
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Wait a moment for database to sync (especially important on Vercel)
        await new Promise(resolve => setTimeout(resolve, 500));

        // Auto login with the new account
        const result = await signIn('credentials', {
          email,
          password: autoPassword,
          redirect: false,
        });

        if (result?.ok) {
          onClose();
          window.location.reload();
        } else {
          // Log error for debugging
          console.error('Login failed after registration:', result?.error);

          // Try one more time with longer delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryResult = await signIn('credentials', {
            email,
            password: autoPassword,
            redirect: false,
          });

          if (retryResult?.ok) {
            onClose();
            window.location.reload();
          } else {
            setError('Account created but login failed: ' + (retryResult?.error || 'Unknown error'));
          }
        }
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetView = () => {
    setView('main');
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full relative max-h-[90vh] overflow-hidden flex">
        <button
          onClick={() => { onClose(); resetView(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >
          ×
        </button>

        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 p-12 flex-col justify-center items-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Get access to exclusive deals!
            </h2>
            <p className="text-gray-700 text-lg">
              Join for free or log in to get exclusive offers
            </p>
          </div>
          <div className="relative w-full max-w-md">
            <img
              src="https://www.shutterstock.com/image-vector/online-store-via-mobile-phone-600nw-1841495218.jpg"
              alt="Online Shopping"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-[90vh]">

        {/* Main View - Choose Sign In or Join */}
        {view === 'main' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome</h2>

            <button
              onClick={() => setView('join')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Join for Free
            </button>

            <button
              onClick={() => setView('signin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Sign In View */}
        {view === 'signin' && (
          <div className="space-y-4">
            <button
              onClick={resetView}
              className="text-gray-600 hover:text-gray-800 mb-2"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => alert('Forgot password feature coming soon!')}
              className="w-full text-blue-600 hover:text-blue-800 text-sm"
            >
              Forgot Password?
            </button>

            <div className="text-center text-gray-600">
              <p className="text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => setView('register')}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create new account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Join for Free View */}
        {view === 'join' && (
          <div className="space-y-4">
            <button
              onClick={resetView}
              className="text-gray-600 hover:text-gray-800 mb-2"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Join for Free</h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={() => handleSocialSignIn('facebook')}
              disabled={loading}
              className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <span>f</span> Continue with Facebook
            </button>

            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors border border-gray-300 flex items-center justify-center gap-2 disabled:bg-gray-100"
            >
              <span>G</span> Continue with Google
            </button>

            <button
              onClick={() => handleSocialSignIn('apple')}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <span></span> Continue with Apple
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <button
              onClick={handleEmailOnlyLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Continue with Email'}
            </button>

            <p className="text-xs text-center text-gray-600 mt-4">
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-gray-900">
                Membership Terms
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-900">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {/* Register View */}
        {view === 'register' && (
          <div className="space-y-4">
            <button
              onClick={() => setView('signin')}
              className="text-gray-600 hover:text-gray-800 mb-2"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-xs text-center text-gray-600 mt-4">
              By signing up you agree to our{' '}
              <a href="#" className="underline hover:text-gray-900">
                Membership Terms
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-900">
                Privacy Policy
              </a>
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
