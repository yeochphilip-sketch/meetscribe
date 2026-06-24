'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const details = searchParams.get('details');

  const getErrorMessage = () => {
    if (!error) return 'Something went wrong during sign in.';
    
    const messages: Record<string, string> = {
      'no_code': 'No authentication code was provided.',
      'pkce_not_found': 'PKCE code verifier not found. This usually means the cookie was blocked or cleared during the Google redirect. Try signing in again.',
      'no_user': 'Authentication succeeded but no user was found.',
      'token_exchange_failed': 'The authentication server rejected the request. The code may have expired.',
      'unexpected': 'An unexpected error occurred.',
    };

    return messages[error] || details || error;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white">Authentication Failed</h1>
        
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-left">
          <p className="text-red-400 text-sm">{getErrorMessage()}</p>
          {error && (
            <p className="text-gray-500 text-xs mt-2 font-mono">Code: {error}</p>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-colors">
            Try Again
          </Link>
          <Link href="/" className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-3 font-medium transition-colors">
            Go Home
          </Link>
        </div>

        <p className="text-gray-500 text-xs">
          If this keeps happening, try disabling browser extensions or using a different browser.
        </p>
      </div>
    </div>
  );
}
