import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();

        // If no plan selected yet, go to plan page
        if (!profile?.plan) {
          return NextResponse.redirect(new URL('/plan', req.url));
        }
      }
      
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.redirect(new URL('/login', req.url));
}
