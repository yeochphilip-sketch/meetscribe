import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PlanContent from './PlanContent';

export default async function PlanPage() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login?next=/plan');
    }
  } catch (err) {
    console.error('Plan page auth error:', err);
    redirect('/login?next=/plan');
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlanContent />
    </Suspense>
  );
}
