import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function CheckoutPix({ pedido }) {
  const [qr, setQr] = useState(null);
  const [copy, setCopy] = useState(null);
  const [loading, setLoading] = useState(false);

  async function gerarPix() {
    setLoading(true);

    const res = await fetch(
      "https://elpinlotdogazhpdwlqr.supabase.co/functions/v1/pix-create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: pedido.id,
          amount: pedido.total,
          description: `Pedido #${pedido.id}`,
        }),
      }
    );

    const data = await res.json();

    await supabase
      .from("doceeser_pedidos")
      .update({
        payment_method: "pix",
        payment_status: "aguardando_pagamento",
        payment_id: data.payment_id,
      })
      .eq("id", pedido.id);

    setQr(data.qr_code_base64);
    setCopy(data.qr_code);
    setLoading(false);
  }

  return (
    <div>
      <button onClick={gerarPix} disabled={loading}>
        {loading ? "Gerando PIX..." : "Pagar com PIX"}
      </button>

      {qr && (
        <img
          src={`data:image/png;base64,${qr}`}
          alt="PIX QR Code"
          style={{ maxWidth: 260, marginTop: 10 }}
        />
      )}

      {copy && <textarea readOnly value={copy} />}
    </div>
  );
}