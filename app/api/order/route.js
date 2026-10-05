import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { customer, items, total, userId } = await req.json();

    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.address ||
      !items?.length
    ) {
      return NextResponse.json(
        { error: "Missing order details." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Save the order in Supabase
    const { error } = await supabase.from("orders").insert({
      user_id: userId,
      customer_name: customer.name,
      email: customer.email,
      address: customer.address,
      total: total,
      items: items,
    });

    if (error) {
      console.error("Supabase error:", error);

      return NextResponse.json(
        { error: `Supabase error: ${error.message}` },
        { status: 500 }
      );
    }

    // Send confirmation email through Mailgun
    const auth = Buffer.from(
      `api:${process.env.MAILGUN_API_KEY}`
    ).toString("base64");

    const body = `
Thank you ${customer.name}!

Your order has been received.

Total: ₦${Number(total).toLocaleString()}

Items:
${items.map((item) => `- ${item.name}`).join("\n")}

Delivery address:
${customer.address}

Thank you for shopping with us.
`;

    const mailgunResponse = await fetch(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: process.env.MAIL_FROM,
          to: customer.email,
          subject: "Order Confirmation",
          text: body,
        }),
      }
    );

    if (!mailgunResponse.ok) {
      const mailgunError = await mailgunResponse.text();

      console.error("Mailgun error:", mailgunError);

      return NextResponse.json(
        {
          error:
            "Order was saved, but the confirmation email could not be sent.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
    });
  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      {
        error: "Server error. Check your Supabase/Mailgun settings.",
      },
      { status: 500 }
    );
  }
}
