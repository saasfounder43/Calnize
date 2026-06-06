import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if the current authenticated user is an admin.
 * @param supabase The Supabase client
 * @returns boolean
 */
export async function isAdmin(supabase: SupabaseClient) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        return profile?.role === 'admin';
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false;
    }
}
