import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ googleConnected: false }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('oauth_tokens')
            .select('user_id')
            .eq('user_id', user.id)
            .maybeSingle();

        return NextResponse.json({
            googleConnected: !!data,
            error: error?.message
        });
    } catch (error: any) {
        return NextResponse.json({ googleConnected: false, error: error.message }, { status: 500 });
    }
}
