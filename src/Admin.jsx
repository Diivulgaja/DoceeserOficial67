// src/Admin.jsx
import React, { useEffect, useState, useMemo } from 'react';
// Substituímos a importação do arquivo local pela biblioteca direta para evitar erros de resolução
import { createClient } from '@supabase/supabase-js';
import { 
  Trash2, Clock, Check, Loader2, 
  ShoppingBag, DollarSign, Users, 
  MapPin, Phone, Package, LogOut, 
  Bell, BellOff, Bike, ChevronRight,
  Filter, Store, MessageCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';

// --- CONFIGURAÇÃO DO SUPABASE ---
// ⚠️ IMPORTANTE: Substitua os valores abaixo pelas suas credenciais reais do Supabase
// Você encontra essas informações em: Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://elpinlotdogazhpdwlqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscGlubG90ZG9nYXpocGR3bHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjU3MjEsImV4cCI6MjA4MDkwMTcyMX0.alb18e60SkJGV1EBcjJb8CSmj7rshm76qcxRog_B2uY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --------------------------------

const ADMIN_PASSWORD = '071224';
const TABLE = 'doceeser_pedidos';
const MOTOBOY_NUMBER = '5548991692018'; // número do motoboy (DDI+DDD+numero)

const STATUS_LABELS = {
  novo: 'Novo',
  preparando: 'Preparando',
  pronto: 'Pronto',
  entregue: 'Entregue'
};

const STATUS_COLORS = {
  novo: 'bg-blue-100 text-blue-700 border-blue-200',
  preparando: 'bg-amber-100 text-amber-700 border-amber-200',
  pronto: 'bg-green-100 text-green-700 border-green-200',
  entregue: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function Admin() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('doceeser_admin'));
  const [passwordInput, setPasswordInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [view, setView] = useState('orders'); // 'orders' or 'dashboard'
  const [autoSendWhatsapp, setAutoSendWhatsapp] = useState(false);
  const [stats, setStats] = useState({});

  // ask notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // helper: play sound
  const playSound = () => {
    try {
      const audio = new Audio('/ding.mp3'); // coloque ding.mp3 em public/
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som de notificação', e);
    }
  };

  // format whatsapp message for an order
  const formatWhatsappMessage = (order) => {
    const customer = order.customer || {};
    const fullAddress = `${customer.rua || ''}, ${customer.numero || ''} - ${customer.bairro || ''}`.trim();
    const mapsLinkRaw = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    const mapsLink = encodeURIComponent(mapsLinkRaw);

    const items = Array.isArray(order.items)
      ? order.items.map(it =>
          `${it.quantity || 1}x ${it.name}${it.toppings ? ` (+${it.toppings.join(', ')})` : ''}`
        ).join('%0A')
      : '';

    const body =
      `🚚 *NOVO PEDIDO* - Doce É Ser%0A%0A` +
      `👤 *Cliente:* ${customer.nome || '-'}%0A` +
      `📱 *Telefone:* ${customer.telefone || '-'}%0A` +
      `📍 *Endereço:* ${fullAddress}%0A` +
      `🗺 *Mapa:* ${mapsLink}%0A%0A` +
      `📦 *Itens:*%0A${items}`;

    return body;
  };

  const sendWhatsapp = (order) => {
    try {
      const text = formatWhatsappMessage(order);
      const url = `https://wa.me/${MOTOBOY_NUMBER}?text=${text}`;
      window.open(url, '_blank');
    } catch (e) {
      console.error('Erro ao abrir WhatsApp:', e);
    }
  };

  // compute dashboard stats from local orders array
  const computeStats = (ordersArr) => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const ordersList = ordersArr || [];
      const todayOrders = ordersList.filter(o => o.createdAt && new Date(o.createdAt) >= new Date(startOfToday));
      const totalToday = todayOrders.reduce((s, o) => s + (Number(o.total || 0) || 0), 0);
      const countToday = todayOrders.length;
      const ticketAverage = countToday ? totalToday / countToday : 0;
      const statusMap = {};
      ordersList.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
      const statusSeries = Object.keys(statusMap).map(k => ({ status: k, count: statusMap[k] }));
      const days = [];
      for (let i=6;i>=0;i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = d.toISOString().slice(0,10);
        days.push({ key, total: 0, date: key });
      }
      ordersList.forEach(o => {
        if (!o.createdAt) return;
        const dateKey = new Date(o.createdAt).toISOString().slice(0,10);
        const day = days.find(dd => dd.key === dateKey);
        if (day) day.total += Number(o.total || 0) || 0;
      });
      const salesSeries = days.map(d => ({ date: d.date, total: d.total }));
      setStats({ totalToday, countToday, ticketAverage, statusSeries, salesSeries });
    } catch (e) {
      console.error('Erro computing stats', e);
    }
  };

  // initial load & realtime subscription
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrders([]);
        setStats({});
      } else {
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr);
        computeStats(arr);
      }
    } catch (err) {
      console.error('Erro fetchOrders:', err);
      setOrders([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth) return;
    let mounted = true;
    setLoading(true);

    // initial fetch
    fetchOrders();

    // realtime
    const channel = supabase.channel('public:' + TABLE)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        payload => {
          (async () => {
            try {
              if (payload.eventType === 'INSERT' || payload.event === 'INSERT') {
                const pedido = payload.record || payload.new || null;
                if (pedido) {
                  if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                      new Notification('Novo pedido recebido!', {
                        body: `Pedido #${pedido.id} — ${pedido.total ? `R$ ${Number(pedido.total).toFixed(2)}` : ''}`,
                        tag: pedido.id
                      });
                    } catch (e) {}
                  }
                  if (soundEnabled) playSound();
                  if (mounted) {
                    setShowNewOrderBanner(true);
                    setTimeout(() => setShowNewOrderBanner(false), 5000);
                  }
                }
                // Auto send WhatsApp to motoboy if enabled
                try {
                  if (autoSendWhatsapp && pedido) sendWhatsapp(pedido);
                } catch(e) { console.error('Erro auto-send whatsapp', e); }
              }
              // refresh full list and stats
              if (mounted) await fetchOrders();
            } catch (e) {
              console.error('Erro no handler realtime:', e);
            }
          })();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try { channel.unsubscribe(); } catch (e) { try { supabase.removeChannel(channel); } catch(_) {} }
    };
  }, [isAuth, soundEnabled, autoSendWhatsapp]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem('doceeser_admin', '1');
      setIsAuth(true);
    } else {
      alert('Senha incorreta.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doceeser_admin');
    setIsAuth(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status. Veja o console.');
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        computeStats(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status. Veja o console.');
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  // --- TELA DE LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-amber-100">
          <div className="text-center mb-8">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Store size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Painel Administrativo</h2>
            <p className="text-sm text-gray-500 mt-1">Doce É Ser</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha de Acesso</label>
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all" 
              />
            </div>
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-200">
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
      
      {/* Navbar Superior */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-amber-600 p-2 rounded-lg text-white">
                <Store size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">Doce É Ser</h1>
                <span className="text-xs text-gray-500">Gestão de Pedidos</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
              {/* Botões de Filtro e View */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={()=>setView('orders')} 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'orders' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pedidos
                </button>
                <button 
                  onClick={()=>setView('dashboard')} 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Relatórios
                </button>
              </div>

              <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

              <button 
                onClick={() => setAutoSendWhatsapp(prev => !prev)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${autoSendWhatsapp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                title="Enviar mensagem automática para o motoboy ao receber pedido"
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">{autoSendWhatsapp ? 'Auto ON' : 'Auto OFF'}</span>
              </button>

              <button 
                onClick={() => setSoundEnabled(prev => !prev)} 
                className={`p-2 rounded-lg border transition-colors ${soundEnabled ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-200'}`}
                title="Sons de notificação"
              >
                {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              </button>

              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Notificação */}
      {showNewOrderBanner && (
        <div className="bg-amber-600 text-white px-4 py-3 text-center font-medium shadow-md animate-pulse sticky top-[73px] z-20">
          🔔 Novo pedido acabou de chegar! Atualizando lista...
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Vendas */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Vendas Hoje</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.totalToday ? `R$ ${Number(stats.totalToday).toFixed(2).replace('.',',')}` : 'R$ 0,00'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>

              {/* Card Pedidos */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Hoje</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.countToday || 0}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <ShoppingBag size={24} />
                </div>
              </div>

              {/* Card Ticket */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ticket Médio</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.ticketAverage ? `R$ ${Number(stats.ticketAverage).toFixed(2).replace('.',',')}` : 'R$ 0,00'}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Pedidos por Status</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statusSeries || []}>
                      <XAxis dataKey="status" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Vendas (Últimos 7 dias)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.salesSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => val.split('-')[2] + '/' + val.split('-')[1]} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                      <Line type="monotone" dataKey="total" stroke="#d97706" strokeWidth={3} dot={{r: 4, fill: '#d97706'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PEDIDOS */}
        {view === 'orders' && (
          <>
            {/* Filtros de Status */}
            <div className="flex flex-wrap items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-1">
                <Filter size={16} /> Filtrar:
              </span>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Todos
              </button>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === key ? STATUS_COLORS[key] + ' ring-2 ring-offset-1 ring-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                <Loader2 size={40} className="animate-spin mb-4 text-amber-500" />
                <p>Carregando pedidos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.length === 0 ? (
                  <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <Package size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                    <p className="text-gray-500 mt-1">Nenhum pedido com status "{filter === 'all' ? 'todos' : filter}" no momento.</p>
                  </div>
                ) : (
                  filtered.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
                      
                      {/* Cabeçalho do Card */}
                      <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-gray-500">#{String(order.id).slice(0, 8)}...</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {(STATUS_LABELS[order.status] || order.status).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-lg font-bold text-gray-900">
                            {order.total ? `R$ ${Number(order.total).toFixed(2).replace('.',',')}` : 'R$ --'}
                          </span>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div className="p-5 flex-1 flex flex-col gap-4">
                        
                        {/* Cliente */}
                        <div className="flex gap-3">
                          <div className="mt-1 text-gray-400"><Users size={18} /></div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{order.customer?.nome || 'Cliente sem nome'}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {order.customer?.telefone || 'Sem telefone'}
                            </p>
                          </div>
                        </div>

                        {/* Endereço */}
                        <div className="flex gap-3">
                          <div className="mt-1 text-gray-400"><MapPin size={18} /></div>
                          <div className="text-sm text-gray-600 leading-snug">
                            {order.customer?.rua ? (
                              <>
                                {order.customer.rua}, {order.customer.numero || 'S/N'}
                                <br />
                                <span className="text-xs text-gray-500">{order.customer.bairro || ''}</span>
                              </>
                            ) : <span className="text-gray-400 italic">Retirada ou sem endereço</span>}
                          </div>
                        </div>

                        {/* Itens */}
                        <div className="bg-amber-50/50 rounded-lg p-3 mt-1 flex-1">
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <ShoppingBag size={12} /> Itens do Pedido
                          </p>
                          <ul className="space-y-2">
                            {Array.isArray(order.items) ? order.items.map((it, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 border-b border-amber-100 last:border-0 pb-1 last:pb-0">
                                <span className="font-bold text-amber-600 whitespace-nowrap">{it.quantity || 1}x</span>
                                <div>
                                  <span className="font-medium">{it.name}</span>
                                  {it.toppings && it.toppings.length > 0 && (
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">
                                      + {it.toppings.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </li>
                            )) : <li className="text-sm text-gray-400 italic">Sem itens listados</li>}
                          </ul>
                        </div>
                      </div>

                      {/* Ações (Rodapé) */}
                      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                        {order.status !== 'entregue' && (
                          <div className="flex gap-2">
                            {order.status === 'novo' && (
                              <button 
                                onClick={() => updateStatus(order.id, 'preparando')}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Store size={16} /> Aceitar / Preparar
                              </button>
                            )}
                            {order.status === 'preparando' && (
                              <button 
                                onClick={() => updateStatus(order.id, 'pronto')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Check size={16} /> Marcar Pronto
                              </button>
                            )}
                            {order.status === 'pronto' && (
                              <button 
                                onClick={() => updateStatus(order.id, 'entregue')}
                                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Check size={16} /> Finalizar
                              </button>
                            )}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => sendWhatsapp(order)}
                          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Bike size={16} /> Chamar Motoboy / WhatsApp
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
