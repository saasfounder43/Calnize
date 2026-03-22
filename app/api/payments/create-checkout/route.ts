import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_type_id, host_id, invitee_name, invitee_email, start_time, end_time } = body;

    if (!booking_type_id || !host_id || !invitee_name || !invitee_email || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Fetch booking type to check for payment_link
    const { data: bookingType, error: btError } = await supabase
      .from("booking_types")
      .select("payment_link, price, currency, title")
      .eq("id", booking_type_id)
      .single();

    if (btError || !bookingType) {
      return NextResponse.json({ error: "Booking type not found" }, { status: 404 });
    }

    // FIX: If payment_link is set → redirect directly to it (PayPal, Razorpay, UPI etc.)
    if (bookingType.payment_link) {
      return NextResponse.json({ checkoutUrl: bookingType.payment_link });
    }

    // Fallback: LemonSqueezy if no payment_link configured
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey || !variantId || !storeId) {
      return NextResponse.json(
        { error: "No payment method configured for this booking. Please contact the host." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            variant_id: Number(variantId),
            checkout_data: {
              email: invitee_email,
            },
            custom_data: {
              booking_type_id,
              host_id,
              invitee_name,
              invitee_email,
              start_time,
              end_time,
            },
          },
        },
      }),
    });

    const data = await response.json();
    const checkoutUrl = data?.data?.attributes?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 });
  }
}
