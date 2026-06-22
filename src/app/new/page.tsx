import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import NewMeetingContent from './NewMeetingContent';

export default async function NewMeetingPage() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login?next=/new');
    }
  } catch (err) {
    console.error('New meeting page auth error:', err);
    redirect('/login?next=/new');
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewMeetingContent />
    </Suspense>
  );
}
