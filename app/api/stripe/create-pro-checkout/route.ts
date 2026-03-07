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

        // Create or get Stripe customer
        const { data: profile } = await supabase
            .from("users")
            .select("stripe_customer_id, email, full_name")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                metadata: {
                    supabase_user_id: user.id,
                },
            });
            customerId = customer.id;

            // Update user with customer ID
            await supabase
                .from("users")
                .update({ stripe_customer_id: customerId })
                .eq("id", user.id);
        }

        // Create checkout session for Pro Plan
        // In a real app, you'd use a Price ID from your Stripe Dashboard
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Calnize Pro Plan",
                            description: "Unlimited booking types and paid bookings.",
                        },
                        unit_amount: 1900, // $19.00
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
            metadata: {
                user_id: user.id,
                plan: "pro",
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Stripe session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
