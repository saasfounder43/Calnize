import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const requestedPlan =
            body?.plan === "early" || body?.plan === "pro" ? body.plan : "pro";
        const returnPath =
            typeof body?.returnPath === "string" && body.returnPath.startsWith("/")
                ? body.returnPath
                : "/dashboard/billing?success=true";

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

        // Get user profile
        const { data: profile } = await supabase
            .from("users")
            .select("email, full_name, plan_type")
            .eq("id", user.id)
            .single();

        // Already on pro — no need to upgrade
        if (
            profile?.plan_type === "pro" ||
            profile?.plan_type === "early" ||
            profile?.plan_type === "paid"
        ) {
            return NextResponse.json({ error: "You are already on a paid plan." }, { status: 400 });
        }

        const apiKey = process.env.LEMONSQUEEZY_API_KEY;
        const storeId = process.env.LEMONSQUEEZY_STORE_ID;
        const variantId =
            requestedPlan === "early"
                ? process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID
                : process.env.LEMONSQUEEZY_VARIANT_ID;

        if (!apiKey || !storeId || !variantId) {
            console.error("Missing Lemon Squeezy configuration");
            return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
        }

        // Create Lemon Squeezy checkout
        const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/vnd.api+json",
                Accept: "application/vnd.api+json",
            },
            body: JSON.stringify({
                data: {
                    type: "checkouts",
                    attributes: {
                        checkout_data: {
                            email: profile?.email || user.email,
                            name: profile?.full_name || undefined,
                            custom: {
                                user_id: user.id,
                                user_email: user.email || "",
                                plan: requestedPlan,
                            },
                        },
                        product_options: {
                            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}${returnPath}`,
                        },
                    },
                    relationships: {
                        store: { data: { type: "stores", id: storeId } },
                        variant: { data: { type: "variants", id: variantId } },
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Lemon Squeezy checkout error:", errorData);
            return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
        }

        const data = await response.json();
        const checkoutUrl = data.data?.attributes?.url;

        if (!checkoutUrl) {
            return NextResponse.json({ error: "No checkout URL received" }, { status: 500 });
        }

        return NextResponse.json({ url: checkoutUrl });
    } catch (error: any) {
        console.error("Billing checkout error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
