import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("users")
            .select("stripe_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Error creating portal session:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
