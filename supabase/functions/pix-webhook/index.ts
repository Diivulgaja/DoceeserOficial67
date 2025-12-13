import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const body = await req.json();

  // Aqui você pode validar assinatura se quiser
  console.log("Webhook recebido:", body);

  return new Response("ok");
});