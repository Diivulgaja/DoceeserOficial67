import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const body = await req.json();
  if (body?.data?.id) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("doceeser_pedidos")
      .update({ payment_status: "pago" })
      .eq("payment_id", body.data.id);
  }
  return new Response("ok");
});