import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      booking_type_id,
      host_id,
      invitee_name,
      invitee_email,
      start_time,
      end_time
    } = body

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            variant_id: Number(process.env.LEMONSQUEEZY_VARIANT_ID),
            checkout_data: {
              email: invitee_email
            },
            custom_data: {
              booking_type_id,
              host_id,
              invitee_name,
              invitee_email,
              start_time,
              end_time
            }
          }
        }
      })
    })

    const data = await response.json()

    const checkoutUrl = data?.data?.attributes?.url

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 })
  }
}
