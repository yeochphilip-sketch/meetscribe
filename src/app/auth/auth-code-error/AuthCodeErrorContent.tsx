'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white">Authentication Failed</h1>
        
        <p className="text-gray-400">
          {errorDescription || error || 'Something went wrong during sign in. Please try again.'}
        </p>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-colors"
          >
            Back to Login
          </a>
          <a
            href="/"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-3 font-medium transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
