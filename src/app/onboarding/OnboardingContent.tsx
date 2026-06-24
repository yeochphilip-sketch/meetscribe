'use client';

import { useState } from 'react';

function generatePKCE() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]).join('');
}

export default function OnboardingContent() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    localStorage.setItem('meetscribe-onboarding', JSON.stringify({ name, company, role }));

    const codeVerifier = generatePKCE();
    
    const stateData = btoa(JSON.stringify({ 
      v: codeVerifier, 
      n: '/plan',
      ts: Date.now()
    }));
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const redirectTo = `https://meetscribe-v2.vercel.app/auth/callback`;
    
    const params = new URLSearchParams({
      provider: 'google',
      redirect_to: redirectTo,
      scopes: 'email profile openid',
      state: stateData,
    });

    window.location.href = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Tell us a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
n          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">Company</label>
            <input id="company" type="text" required value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Acme Inc" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <input id="role" type="text" required value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sales Manager" />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Continue with Google'}
          </button>
        </form>
      </div>
    </div>
  );
}
