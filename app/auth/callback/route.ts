import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateSlug } from '@/lib/auth/generateSlug';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error('[auth/callback] Session exchange failed:', sessionError.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.redirect(`${origin}/login?error=db_error`);
  }

  if (!existingUser) {
    const slug = await generateSlug(user.email!, supabase);

    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      slug,
      plan_type: 'free',
      onboarding_completed: false,
      calendar_connected: false,
    });

    if (insertError) {
      console.error('[auth/callback] Insert failed:', insertError.message);
      return NextResponse.redirect(`${origin}/login?error=insert_failed`);
    }

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (!existingUser.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
