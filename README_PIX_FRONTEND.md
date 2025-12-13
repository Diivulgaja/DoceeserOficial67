
## PIX no Frontend

Use o componente:

import CheckoutPix from "./components/CheckoutPix";

<CheckoutPix pedidoId={pedido.id} total={pedido.total} />

Ele já chama a Supabase Function pix-create e exibe QR Code.
