
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

    // Save payment details
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
    <div style={styles.container}>
      <h2 style={styles.title}>Pagamento via PIX</h2>
      <p style={styles.subtitle}>
        Escaneie o QR Code ou copie o código PIX abaixo.
        <br />
        A confirmação é automática após o pagamento.
      </p>

      {!qr && (
        <button onClick={gerarPix} disabled={loading} style={styles.button}>
          {loading ? "Gerando PIX..." : "Gerar PIX"}
        </button>
      )}

      {qr && (
        <div style={styles.qrBox}>
          <img
            src={`data:image/png;base64,${qr}`}
            alt="QR Code PIX"
            style={styles.qr}
          />

          <textarea
            readOnly
            value={copy}
            style={styles.copy}
            onClick={(e) => e.target.select()}
          />

          <p style={styles.info}>
            Assim que o pagamento for identificado, seu pedido será atualizado
            automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxWidth: 400,
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
  },
  button: {
    background: "#32BCAD",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
  },
  qrBox: {
    marginTop: 20,
  },
  qr: {
    width: 240,
    marginBottom: 15,
  },
  copy: {
    width: "100%",
    height: 80,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    resize: "none",
    fontSize: 12,
  },
  info: {
    marginTop: 12,
    fontSize: 13,
    color: "#777",
  },
};
