import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase";

// Verify Lemon Squeezy webhook signature
function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
    );
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-signature") || "";

        const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
            return NextResponse.json(
                { error: "Webhook secret not configured" },
                { status: 500 }
            );
        }

        // Verify signature
        if (!signature || !verifyWebhookSignature(body, signature, webhookSecret)) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        const event = JSON.parse(body);
        const eventName = event.meta?.event_name;
        const customData = event.meta?.custom_data;

        console.log(`[LemonSqueezy Webhook] Event: ${eventName}`);

        const supabase = createServerSupabaseClient();

        switch (eventName) {
            case "order_created": {
                console.log("[LemonSqueezy] Order created:", event.data?.id);
                break;
            }

            case "subscription_created": {
                const userId = customData?.user_id;
                const subscriptionId = String(event.data?.id || "");

                if (!userId) {
                    console.error("No user_id in custom data for subscription_created");
                    break;
                }

                console.log(`[LemonSqueezy] Activating Pro for user: ${userId}`);

                const { error } = await supabase
                    .from("users")
                    .update({
                        plan: "pro",
                        subscription_status: "active",
                        subscription_id: subscriptionId,
                    })
                    .eq("id", userId);

                if (error) {
                    console.error("Error upgrading user:", error);
                } else {
                    console.log(`[LemonSqueezy] User ${userId} upgraded to Pro`);

                    // Send confirmation email
                    try {
                        const { sendEmail } = await import("@/lib/email");
                        const userEmail = customData?.user_email;

                        if (userEmail) {
                            await sendEmail({
                                to: userEmail,
                                subject:
                                    "Your Calnize Pro subscription is active 🎉",
                                html: buildUpgradeEmail(),
                            });
                        }
                    } catch (emailErr) {
                        console.error(
                            "Email notification error (non-blocking):",
                            emailErr
                        );
                    }
                }
                break;
            }

            case "subscription_updated": {
                const subscriptionId = String(event.data?.id || "");
                const status = event.data?.attributes?.status;

                if (subscriptionId) {
                    console.log(
                        `[LemonSqueezy] Subscription ${subscriptionId} updated to: ${status}`
                    );

                    const updateData: Record<string, string> = {
                        subscription_status: status || "active",
                    };

                    // If subscription is no longer active, downgrade
                    if (
                        status === "expired" ||
                        status === "past_due" ||
                        status === "unpaid"
                    ) {
                        updateData.plan = "free";
                    }

                    const { error } = await supabase
                        .from("users")
                        .update(updateData)
                        .eq("subscription_id", subscriptionId);

                    if (error) {
                        console.error("Error updating subscription:", error);
                    }
                }
                break;
            }

            case "subscription_cancelled": {
                const subscriptionId = String(event.data?.id || "");

                if (subscriptionId) {
                    console.log(
                        `[LemonSqueezy] Subscription ${subscriptionId} cancelled`
                    );

                    const { error } = await supabase
                        .from("users")
                        .update({
                            plan: "free",
                            subscription_status: "cancelled",
                        })
                        .eq("subscription_id", subscriptionId);

                    if (error) {
                        console.error("Error downgrading user:", error);
                    }
                }
                break;
            }

            default:
                console.log(`[LemonSqueezy] Unhandled event: ${eventName}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function buildUpgradeEmail(): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.calnize.com";
    return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #6C63FF;">Welcome to Calnize Pro! 🎉</h2>
      <p>Your Calnize Pro subscription is now active.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> Calnize Pro</p>
        <p style="margin: 0 0 8px 0;"><strong>Price:</strong> $9/month</p>
        <p style="margin: 0;"><strong>Status:</strong> Active</p>
      </div>
      <p>You now have access to:</p>
      <ul style="color: #4a4a4a; line-height: 1.8;">
        <li>Unlimited Booking Types</li>
        <li>Advanced Availability Settings</li>
        <li>Priority Support</li>
        <li>Custom Branding (Coming Soon)</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background: #6C63FF; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Sent from Calnize &bull; <a href="${appUrl}/dashboard/billing" style="color: #6C63FF;">Manage Billing</a></p>
    </div>
  `;
}
