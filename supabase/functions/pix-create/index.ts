import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { amount, description, order_id } = await req.json();

  const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response("Missing token", { status: 500 });
  }

  const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transaction_amount: amount,
      description,
      payment_method_id: "pix",
      external_reference: order_id
    })
  });

  const data = await mpRes.json();

  return new Response(JSON.stringify({
    payment_id: data.id,
    qr_code: data.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64
  }), { headers: { "Content-Type": "application/json" }});
});