// src/App.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ShoppingCart, Plus, Minus, X, Home, ChevronRight, Truck, MapPin,
  Loader2, Cake, Heart
} from "lucide-react";

import { supabase } from "./supabaseClient";

/* ------------- Constants & Data ------------- */
const COLLECTION_ORDERS = "doceeser_pedidos";
const COLLECTION_CARTS = "carts";
const DELIVERY_FEE = 2.99;
const ETA_TEXT = "20–35 min"; // tempo estimado fornecido

// --- DADOS ADICIONAIS AÇAÍ ---
const ACAI_TOPPINGS = [
  { name: "Banana", price: 0.01 },
  { name: "Morango", price: 2.00 },
  { name: "Leite Ninho", price: 1.00 },
  { name: "Leite Condensado", price: 0.01 },
  { name: "Creme de Ninho", price: 1.00 },
  { name: "Nutella", price: 3.00 },
  { name: "Amendoim", price: 1.00 },
];

const ACAI_ID = 18;
const ACAI_BASE_PRICE = 17.90;

const initialProducts = [
  // ... (mantive exatamente os produtos do seu arquivo original)
  {
    id: 9,
    name: "Red velvet com Ninho e Morangos",
    price: 15.90,
    category: 'bolos',
    description: "Massa aveludada e macia, coberta com creme de leite Ninho cremoso e morangos fresquinhos no topo. Uma combinação elegante.",
    imageUrl: "https://i.imgur.com/3UDWhLR.png"
  },
  {
    id: 2,
    name: "Bolo Cenoura com chocolate",
    price: 15.90,
    category: 'bolos',
    description: "Mini vulcão de cenoura: uma massa fofinha e úmida de bolo de cenoura, recheada com explosão de calda cremosa de chocolate.",
    imageUrl: "https://i.imgur.com/aaUdL2b.png"
  },
  {
    id: 10,
    name: "Chocolate com Morangos",
    price: 15.90,
    category: 'bolos',
    description: "Bolo fofinho de chocolate, cobertura cremosa 50% e morangos fresquinhos.",
    imageUrl: "https://i.imgur.com/MMbQohl.png"
  },
  {
    id: 13,
    name: "Chocolatudo!!!",
    price: 15.90,
    category: 'bolos',
    description: "Bolo chocolatudo com creme de chocolate 50% e granulados.",
    imageUrl: "https://i.imgur.com/3Hva4Df.png"
  },
  {
    id: 16,
    name: "Bolo de Ferreiro com Nutella",
    price: 16.90,
    category: 'bolos',
    description: "Bolo de chocolate com amendoim, Nutella e chocolate 50%.",
    imageUrl: "https://i.imgur.com/OamNqov.png"
  },

  // Categoria COPO DA FELICIDADE
  {
    id: 17,
    name: "Copo Oreo com Nutella",
    price: 24.90,
    category: 'copo_felicidade',
    description: "Camadas de creme de Ninho, Oreo e Nutella.",
    imageUrl: "https://i.imgur.com/1EZRMVl.png"
  },
  {
    id: 24,
    name: "Copo Maracujá com Brownie",
    price: 24.90,
    category: 'copo_felicidade',
    description: "Creme de maracujá, chocolate 50% e pedaços de brownie.",
    imageUrl: "https://i.imgur.com/PypEwAz.png"
  },
  {
    id: 25,
    name: "Copo Brownie Dois Amores",
    price: 22.90,
    category: 'copo_felicidade',
    description: "Dois amores + brownie macio em camadas.",
    imageUrl: "https://i.imgur.com/mMQtXDB.png"
  },
  {
    id: 26,
    name: "Copo Encanto de Ninho e Morangos",
    price: 22.90,
    category: 'copo_felicidade',
    description: "Camadas de creme de Ninho e morangos frescos.",
    imageUrl: "https://i.imgur.com/EgFhhwL.png"
  },
  {
    id: 27,
    name: "Copo de Brownie com Ferreiro e Nutella",
    price: 26.90,
    category: 'copo_felicidade',
    description: "Brownie, Ferrero, chocolate 50% e Nutella.",
    imageUrl: "https://i.imgur.com/t6xeVDf.png"
  },

  // Categoria BROWNIES
  {
    id: 20,
    name: "Brownie De Ninho e Nutella",
    price: 11.90,
    category: 'brownie',
    description: "Brownie com creme de Ninho e Nutella.",
    imageUrl: "https://i.imgur.com/vWdYZ8K.png"
  },
  {
    id: 21,
    name: "Brownie Recheado com Nutella e Morangos",
    price: 22.90,
    category: 'brownie',
    description: "Brownie recheado com creme de Ninho, Nutella e morangos.",
    imageUrl: "https://i.imgur.com/P1pprjF.png"
  },
  {
    id: 22,
    name: "Brownie Ferreiro com Nutella",
    price: 11.90,
    category: 'brownie',
    description: "Brownie com Nutella e amendoim torrado.",
    imageUrl: "https://i.imgur.com/rmp3LtH.png"
  },
  {
    id: 23,
    name: "Brownie Duo com Oreo",
    price: 11.90,
    category: 'brownie',
    description: "Brownie com cobertura de chocolate e pedaços de Oreo.",
    imageUrl: "https://i.imgur.com/8IbcWWj.png"
  },

  // Categoria AÇAÍ
  {
    id: ACAI_ID,
    name: "Copo de Açaí 250ml",
    price: ACAI_BASE_PRICE,
    category: 'acai',
    description: "Copo de Açaí cremoso — escolha seus acompanhamentos.",
    imageUrl: "https://i.imgur.com/OrErP8N.png"
  },

  // Categoria SALGADOS
  {
    id: 6,
    name: "Empada de Camarão e Requeijão",
    price: 12.00,
    category: 'salgado',
    description: "Camarão cremoso com requeijão. Feito na marmitinha.",
    imageUrl: "https://i.imgur.com/rV18DkJ.png"
  }
];

const categories = {
  all: 'Todos os Produtos',
  bolos: 'Bolos',
  copo_felicidade: 'Copo da Felicidade',
  brownie: 'Brownies',
  acai: 'Açaí',
  salgado: 'Salgados',
};

const PAYMENT_METHODS = [{ id: 'pix', name: 'Pix', details: 'Pagamento via QR Code ou chave Pix.' }];

/* ------------- Helpers ------------- */
const formatBR = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

/* ------------- Guest ID helpers ------------- */
const GUEST_KEY = "doceeser_guest_id";
const ensureGuestId = () => {
  try {
    let id = localStorage.getItem(GUEST_KEY);
    if (!id) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) id = crypto.randomUUID();
      else id = `guest_${Date.now()}`;
      localStorage.setItem(GUEST_KEY, id);
    }
    return id;
  } catch (e) {
    return `guest_${Date.now()}`;
  }
};

/* ------------- Cart persistence helpers (Supabase upsert fallback) ------------- */
const saveCartToSupabase = async (userId, cart) => {
  try {
    if (!userId) return;
    // try upsert into table 'carts' (if exists). If the table doesn't exist, this will fail silently.
    await supabase
      .from(COLLECTION_CARTS)
      .upsert({ id: userId, items: cart, updatedAt: new Date().toISOString() })
      .select();
  } catch (err) {
    console.warn("Erro salvando carrinho no Supabase (provavel tabela ausente):", err);
  }
};

/* ------------- Create order in Supabase ------------- */
const createOrderInSupabase = async ({ cart, total, customer, deliveryType }) => {
  try {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `ord_${Date.now()}`;
    const payload = {
      id,
      status: 'novo',
      createdAt: new Date().toISOString(),
      total: Number(total || 0),
      items: cart, // denormalizado para facilitar leitura no frontend
      customer: customer || {}
    };
    const { data, error } = await supabase
      .from(COLLECTION_ORDERS)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro insert pedido:", error);
      return null;
    }
    return id;
  } catch (err) {
    console.error("Erro ao criar pedido (supabase):", err);
    return null;
  }
};

/* ---------- LocalStorage helpers for 'Meus Pedidos' ---------- */
const LOCAL_ORDERS_KEY = "doceeser_local_orders";

const saveLocalOrderId = (orderId) => {
  try {
    const existingJson = localStorage.getItem(LOCAL_ORDERS_KEY);
    const arr = existingJson ? JSON.parse(existingJson) : [];
    const newArr = [orderId, ...arr.filter(id => id !== orderId)];
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(newArr.slice(0, 50)));
  } catch (e) {
    console.warn("Erro salvando localOrders", e);
  }
};

const readLocalOrders = () => {
  try {
    const existingJson = localStorage.getItem(LOCAL_ORDERS_KEY);
    return existingJson ? JSON.parse(existingJson) : [];
  } catch (e) {
    return [];
  }
};

/* ------------- Small UI components ------------- */
// ProductCard, OrderSummary, AcaiModal kept unchanged — reuse your implementations
// (I'll include them below unchanged to keep the app working exactly as before)

const ProductCard = ({ product, onAdd, onCustomize }) => {
  const isAcai = product.id === ACAI_ID;
  return (
    <div className="flex flex-col rounded-xl shadow-lg overflow-hidden bg-white">
      <div className="h-40 overflow-hidden relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={(e)=>e.target.src="https://placehold.co/400x250/cccccc/333333?text=Doce+É+Ser"} />
        <div className="absolute top-0 right-0 p-2 rounded-bl-lg bg-amber-600 text-white text-xs font-bold">{product.category}</div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.description}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="font-extrabold text-amber-700">{formatBR(product.price)}</span>
          
                </div>
                <p className="text-xs text-gray-500 mt-2">Tempo estimado: {ETA_TEXT}</p>
              </div>
            </div>
          )}
        <div>
          <OrderSummary cart={cart} deliveryType={deliveryType} />
        </div>
  );
  const AboutPage = (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-amber-700">Doce É Ser</h2>
      <p className="mt-4 text-gray-600">Nascida da paixão em equilibrar o doce e o salgado, a Doce É Ser é mais do que uma loja: é um ponto de encontro para quem ama a culinária artesanal. Trabalhamos com ingredientes frescos e receitas exclusivas para garantir que cada mordida seja uma experiência inesquecível.</p>
      <button onClick={()=>setPage('menu')} className="mt-6 bg-amber-700 text-white px-4 py-2 rounded">Ver cardápio</button>
    </div>
  );

  /* ------------- Render logic ------------- */
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const trackedOrderIdFromPath = currentPath.startsWith('/pedido/') ? currentPath.replace('/pedido/', '').split('/')[0] : null;

  if (page === 'tracking' && trackedOrderIdFromPath) {
    return (
      <div>
        {lastCreatedOrderId === trackedOrderIdFromPath && (
          <div className="bg-green-600 text-white p-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">Pedido enviado com sucesso!</div>
                  <div className="text-sm">Número do pedido: <strong>{trackedOrderIdFromPath}</strong></div>
                </div>
                <div className="text-right">
                  <div>{ETA_TEXT}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <OrderTrackingPage orderId={trackedOrderIdFromPath} />
      </div>
    );
  }

  if (page === 'meus-pedidos') {
    return <MyOrdersPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={()=>{ setPage('menu'); window.history.pushState({}, '', '/'); }}>
            <Cake className="w-6 h-6 text-amber-500" />
            <h1 className="font-bold">Doce É Ser</h1>
          </div>
          <nav className="hidden md:flex gap-4">
            <button onClick={()=>{ setPage('menu'); window.history.pushState({}, '', '/'); }} className={`px-3 py-1 rounded ${page==='menu' ? 'bg-amber-100 text-amber-700' : ''}`}>Menu</button>
            <button onClick={()=>{ setPage('about'); window.history.pushState({}, '', '/about'); }} className={`px-3 py-1 rounded ${page==='about' ? 'bg-amber-100 text-amber-700' : ''}`}>Sobre</button>
            <button onClick={()=>{ setPage('meus-pedidos'); window.history.pushState({}, '', '/meus-pedidos'); }} className="px-3 py-1 rounded">Meus pedidos</button>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ setPage('cart'); window.history.pushState({}, '', '/cart'); }} className="relative bg-amber-700 text-white p-3 rounded-full">
              <ShoppingCart className="w-5 h-5"/>
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full bg-red-600 flex items-center justify-center border-2 border-white">{cartItemCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pb-12">
        {page === 'menu' && MenuPage}
        {page === 'cart' && CartPage}
        {page === 'delivery' && DeliveryPage}
        {page === 'payment' && PaymentPage}
        {page === 'about' && AboutPage}
      </main>

      {isAcaiModalOpen && acaiProduct && (
        <AcaiModal
          product={acaiProduct}
          onClose={closeAcaiModal}
          onAdd={(selectedToppings) => {
            const priceExtra = selectedToppings.reduce((s, n) => s + (ACAI_TOPPINGS.find(t=>t.name===n)?.price || 0), 0);
            const item = {
              id: acaiProduct.id,
              uniqueId: `acai-${Date.now()}`,
              name: acaiProduct.name,
              toppings: selectedToppings,
              price: (ACAI_BASE_PRICE + priceExtra),
              quantity: 1,
              isCustom: true
            };
            addCustomAcai(item);
          }}
        />
      )}

      <footer className="bg-gray-800 text-white p-4 text-center">
        <div>Desenvolvido por @DivulgaJà</div>
      </footer>
    </div>
  );
};

/* ------------- Acai Modal Component ------------- */
const AcaiModal = ({ product, onClose, onAdd }) => {
  const [selected, setSelected] = useState([]);
  const toggle = (name) => setSelected(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  const total = ACAI_BASE_PRICE + selected.reduce((s, n) => s + (ACAI_TOPPINGS.find(t=>t.name===n)?.price || 0), 0);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <p className="text-sm text-gray-600 mt-2">Selecione adicionais:</p>
        <div className="mt-4 space-y-2">
          {ACAI_TOPPINGS.map(t => {
            const active = selected.includes(t.name);
            return (
              <div key={t.name} onClick={()=>toggle(t.name)} className={`p-3 rounded border cursor-pointer ${active ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div>{t.name}</div>
                  <div className="text-sm text-gray-600">{formatBR(t.price)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="font-bold">Total: {formatBR(total)}</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            <button onClick={()=>onAdd(selected)} className="px-4 py-2 rounded bg-amber-700 text-white">Adicionar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
