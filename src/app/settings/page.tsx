import { Suspense } from 'react';
import { requireAuth } from '@/utils/supabase/require-auth';
import SettingsContent from './SettingsContent';

export default async function SettingsPage() {
  await requireAuth();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
