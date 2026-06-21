import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Always redirect to plan page after successful auth
      // Plan page will check if user already has a plan
      return NextResponse.redirect(new URL('/plan', req.url));
    }
  }

  return NextResponse.redirect(new URL('/login', req.url));
}
