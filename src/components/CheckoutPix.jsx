import { useState } from "react";

export default function CheckoutPix({ pedidoId, total }) {
  const [qr, setQr] = useState(null);
  const [copy, setCopy] = useState(null);
  const [loading, setLoading] = useState(false);

  async function pagarPix() {
    setLoading(true);
    const res = await fetch(
      "https://elpinlotdogazhpdwlqr.supabase.co/functions/v1/pix-create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: pedidoId,
          amount: total,
          description: `Pedido #${pedidoId}`,
        }),
      }
    );
    const data = await res.json();
    setQr(data.qr_code_base64);
    setCopy(data.qr_code);
    setLoading(false);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={pagarPix} disabled={loading}>
        {loading ? "Gerando PIX..." : "Pagar com PIX"}
      </button>

      {qr && (
        <div>
          <img
            src={`data:image/png;base64,${qr}`}
            alt="PIX QR Code"
            style={{ maxWidth: 260, marginTop: 10 }}
          />
        </div>
      )}

      {copy && (
        <textarea
          readOnly
          value={copy}
          style={{ width: "100%", marginTop: 10 }}
        />
      )}
    </div>
  );
}