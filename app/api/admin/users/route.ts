import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: currentUser } } = await supabase.auth.getUser(token);

        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Admin check
        const { data: profile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Use service role for admin tasks
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/users/update - Update user status/plan
export async function POST(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: currentUser } } = await supabase.auth.getUser(token);

        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Admin check
        const { data: profile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { userId, updates } = body;

        if (!userId || !updates || typeof updates !== 'object') return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

        // Allowlist updatable fields so a request body can't set arbitrary
        // columns on the users table (e.g. unexpected privilege fields).
        const ALLOWED_USER_UPDATE_FIELDS = ['plan_type', 'role'] as const;
        const sanitizedUpdates: Record<string, unknown> = {};
        for (const field of ALLOWED_USER_UPDATE_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(updates, field)) {
                sanitizedUpdates[field] = (updates as Record<string, unknown>)[field];
            }
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update(sanitizedUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
