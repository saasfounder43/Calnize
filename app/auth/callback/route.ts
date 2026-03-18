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
    .select('id, user_type, slug')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.redirect(`${origin}/login?error=db_error`);
  }

  // Create or retrieve slug
  let userSlug = existingUser?.slug;

  if (!userSlug) {
    userSlug = await generateSlug(user.email!, supabase);
    
    // Update existing user with new slug if trigger created them without one
    if (existingUser) {
      await supabase.from('users').update({ slug: userSlug }).eq('id', user.id);
    }
  }

  if (!existingUser) {
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? null,
      profile_picture: user.user_metadata?.avatar_url ?? null,
      slug: userSlug,
      timezone: null,
      calendar_connected: false,
    });

    if (insertError) {
      return NextResponse.redirect(`${origin}/login?error=insert_failed`);
    }

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (!existingUser.user_type) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
