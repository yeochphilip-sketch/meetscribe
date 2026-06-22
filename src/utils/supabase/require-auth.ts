import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/login');
    }
    
    return user;
  } catch (err) {
    console.error('requireAuth error:', err);
    redirect('/login');
  }
}
