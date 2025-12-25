// src/Admin.jsx
import React, { useEffect, useState, useMemo } from 'react';

// IMPORTAÇÕES PADRÃO DO REACT (Certifique-se de ter instalado via npm/yarn)
// npm install @supabase/supabase-js lucide-react recharts
import { createClient } from '@supabase/supabase-js'; 
import { 
  Trash2, Clock, Check, Loader2, 
  ShoppingBag, DollarSign, Users, 
  MapPin, Phone, LogOut, 
  Bell, BellOff, Bike, Filter, Store, MessageCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid 
} from 'recharts';

// --- CONFIGURAÇÃO DO SUPABASE ---
// ⚠️ ATENÇÃO: Se você já tem o arquivo './supabaseClient', pode importá-lo.
// Caso contrário, preencha as chaves abaixo para conectar ao banco.
const SUPABASE_URL = 'https://sua-url-do-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima-aqui';

// Inicialização do cliente (pode ser substituído pela importação do seu arquivo local)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --------------------------------

const ADMIN_PASSWORD = '071224';
const TABLE = 'doceeser_pedidos';
const MOTOBOY_NUMBER = '5548991692018'; 

// --- ESTILOS CSS INJETADOS NO COMPONENTE ---
// Isso garante que o visual funcione 100% sem precisar de arquivos .css externos
const styles = `
  :root {
    --primary: #d97706; /* Amber 600 */
    --primary-hover: #b45309;
    --primary-light: #fffbeb;
    --bg-body: #f3f4f6;
    --bg-card: #ffffff;
    --text-main: #111827;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --radius: 12px;
    --success: #059669;
    --info: #2563eb;
    --gray: #4b5563;
  }

  * { box-sizing: border-box; }

  .admin-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-body);
    min-height: 100vh;
    color: var(--text-main);
    padding-bottom: 40px;
  }

  /* Header */
  .admin-header {
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-brand { display: flex; align-items: center; gap: 12px; }
  .logo-box { background: var(--primary); color: white; padding: 8px; border-radius: 8px; display: flex; }
  .brand-text h1 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-main); line-height: 1.1; }
  .brand-text span { font-size: 0.75rem; color: var(--text-muted); }

  .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* Buttons */
  .btn {
    border: 1px solid var(--border);
    background: white;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    color: var(--text-muted);
  }
  .btn:hover { background: #f9fafb; color: var(--text-main); border-color: #d1d5db; }
  
  .btn.active { background: var(--primary-light); color: var(--primary); border-color: var(--primary); }
  
  .btn-primary { background: var(--primary); color: white; border: none; }
  .btn-primary:hover { background: var(--primary-hover); }

  .btn-success { background: var(--success); color: white; border: none; }
  .btn-success:hover { background: #047857; }

  .btn-outline-primary { border-color: var(--primary); color: var(--primary); background: transparent; }
  .btn-outline-primary:hover { background: var(--primary-light); }

  .btn-icon { padding: 8px; }

  /* Login Screen */
  .login-wrapper {
    display: flex; align-items: center; justify-content: center; min-height: 100vh;
    background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
  }
  .login-box {
    background: white; padding: 2.5rem; border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 400px;
    text-align: center; border: 1px solid rgba(255,255,255,0.5);
  }
  .login-input {
    width: 100%; padding: 12px; margin-bottom: 1rem; border-radius: 8px;
    border: 1px solid var(--border); font-size: 1rem; outline: none;
  }
  .login-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(217,119,6,0.1); }
  .login-btn { width: 100%; padding: 12px; font-size: 1rem; justify-content: center; }

  /* Dashboard Grid */
  .main-content { max-width: 1280px; margin: 0 auto; padding: 2rem; }
  
  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  
  .stat-card {
    background: white; padding: 1.5rem; border-radius: var(--radius);
    box-shadow: var(--shadow); border: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .stat-info h3 { font-size: 1.5rem; margin: 0; font-weight: 700; color: var(--text-main); }
  .stat-info p { margin: 0 0 0.5rem 0; color: var(--text-muted); font-size: 0.875rem; }
  .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; }
  
  .chart-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 768px) { .chart-section { grid-template-columns: 1fr; } }
  .chart-card { background: white; padding: 1.5rem; border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); }

  /* Order Cards */
  .filters { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 1rem; }
  .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
  
  .order-card {
    background: white; border-radius: var(--radius);
    border: 1px solid var(--border); box-shadow: var(--shadow);
    overflow: hidden; display: flex; flex-direction: column;
    transition: transform 0.2s;
  }
  .order-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

  .order-header {
    background: #f9fafb; padding: 1rem; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .order-id { font-family: monospace; font-weight: 700; color: var(--gray); font-size: 0.9rem; }
  .status-badge {
    font-size: 0.75rem; padding: 2px 8px; border-radius: 99px; font-weight: 700; text-transform: uppercase; border: 1px solid transparent;
  }
  .status-novo { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
  .status-preparando { background: #fef3c7; color: #92400e; border-color: #fde68a; }
  .status-pronto { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }
  .status-entregue { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }

  .order-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
  .info-row { display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.9rem; }
  .info-icon { color: var(--text-muted); margin-top: 2px; }
  .customer-name { font-weight: 600; color: var(--text-main); margin-bottom: 2px; }
  .customer-detail { font-size: 0.8rem; color: var(--text-muted); }

  .items-box { background: #fffbeb; padding: 0.75rem; border-radius: 8px; border: 1px solid #fef3c7; margin-top: auto; }
  .items-title { font-size: 0.75rem; font-weight: 700; color: #b45309; text-transform: uppercase; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 4px; }
  .item-list { list-style: none; padding: 0; margin: 0; font-size: 0.85rem; }
  .item-row { display: flex; gap: 8px; margin-bottom: 4px; color: #4b5563; }
  .item-qty { font-weight: 700; color: #d97706; }

  .order-footer { padding: 1rem; background: #f9fafb; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.5rem; }
  .action-group { display: flex; gap: 0.5rem; }
  .action-btn { flex: 1; justify-content: center; font-size: 0.85rem; }

  .banner {
    background: var(--primary); color: white; padding: 10px; text-align: center;
    font-weight: 600; position: sticky; top: 73px; z-index: 40; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    animation: slideDown 0.3s ease-out;
  }
  @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }

  .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: var(--text-muted); }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default function Admin() {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('doceeser_admin'));
  const [passwordInput, setPasswordInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [view, setView] = useState('orders');
  const [autoSendWhatsapp, setAutoSendWhatsapp] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const playSound = () => {
    try {
      const audio = new Audio('/ding.mp3'); 
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Erro ao tocar som', e);
    }
  };

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

    return `🚚 *NOVO PEDIDO* - Doce É Ser%0A%0A` +
      `👤 *Cliente:* ${customer.nome || '-'}%0A` +
      `📱 *Telefone:* ${customer.telefone || '-'}%0A` +
      `📍 *Endereço:* ${fullAddress}%0A` +
      `🗺 *Mapa:* ${mapsLink}%0A%0A` +
      `📦 *Itens:*%0A${items}`;
  };

  const sendWhatsapp = (order) => {
    try {
      window.open(`https://wa.me/${MOTOBOY_NUMBER}?text=${formatWhatsappMessage(order)}`, '_blank');
    } catch (e) {
      console.error('Erro WhatsApp:', e);
    }
  };

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
      console.error('Stats error', e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from(TABLE).select('*').order('createdAt', { ascending: false });
      if (!error) {
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr);
        computeStats(arr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth) return;
    let mounted = true;
    fetchOrders();

    const channel = supabase.channel('public:' + TABLE)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, payload => {
        (async () => {
          if (payload.eventType === 'INSERT') {
            const pedido = payload.record || payload.new;
            if (soundEnabled) playSound();
            if (mounted) {
              setShowNewOrderBanner(true);
              setTimeout(() => setShowNewOrderBanner(false), 5000);
            }
            if (autoSendWhatsapp && pedido) sendWhatsapp(pedido);
          }
          if (mounted) await fetchOrders();
        })();
      })
      .subscribe();

    return () => {
      mounted = false;
      try { channel.unsubscribe(); } catch (_) {}
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

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from(TABLE).update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);
      computeStats(updated);
    } else {
      alert('Erro ao atualizar status.');
    }
  };

  const filtered = useMemo(() => filter === 'all' ? orders : orders.filter(o => o.status === filter), [orders, filter]);

  // LOGIN RENDER
  if (!isAuth) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-wrapper">
          <div className="login-box">
            <div style={{display:'flex', justifyContent:'center', marginBottom:'1rem'}}>
              <div style={{background:'#fef3c7', padding:'1rem', borderRadius:'50%', color:'#d97706'}}>
                <Store size={32} />
              </div>
            </div>
            <h2 style={{fontSize:'1.5rem', fontWeight:'bold', marginBottom:'0.5rem'}}>Painel Administrativo</h2>
            <p style={{color:'#6b7280', marginBottom:'2rem'}}>Doce É Ser</p>
            <form onSubmit={handleLogin}>
              <input 
                type="password" value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Senha de Acesso" className="login-input" 
              />
              <button className="btn btn-primary login-btn">Entrar no Painel</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // APP RENDER
  return (
    <>
      <style>{styles}</style>
      <div className="admin-container">
        
        {/* Navbar */}
        <header className="admin-header">
          <div className="header-brand">
            <div className="logo-box"><Store size={20} /></div>
            <div className="brand-text">
              <h1>Doce É Ser</h1>
              <span>Gestão de Pedidos</span>
            </div>
          </div>

          <div className="header-actions">
            <div style={{display:'flex', background:'#f3f4f6', padding:'4px', borderRadius:'8px'}}>
              <button onClick={()=>setView('orders')} className={`btn ${view==='orders'?'active':''}`} style={{border:'none', background: view==='orders'?'white':'transparent'}}>Pedidos</button>
              <button onClick={()=>setView('dashboard')} className={`btn ${view==='dashboard'?'active':''}`} style={{border:'none', background: view==='dashboard'?'white':'transparent'}}>Relatórios</button>
            </div>

            <button onClick={() => setAutoSendWhatsapp(prev => !prev)} className={`btn ${autoSendWhatsapp ? 'btn-success' : ''}`}>
              <MessageCircle size={16} /> {autoSendWhatsapp ? 'Auto ON' : 'Auto OFF'}
            </button>
            
            <button onClick={() => setSoundEnabled(prev => !prev)} className="btn btn-icon">
              {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>

            <button onClick={() => { localStorage.removeItem('doceeser_admin'); setIsAuth(false); }} className="btn btn-icon" style={{color:'#ef4444'}}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {showNewOrderBanner && (
          <div className="banner">
            🔔 Novo pedido chegou!
          </div>
        )}

        <main className="main-content">
          
          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <div className="dashboard-view">
              <div className="dashboard-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <p>Vendas Hoje</p>
                    <h3>{stats.totalToday ? `R$ ${Number(stats.totalToday).toFixed(2).replace('.',',')}` : 'R$ 0,00'}</h3>
                  </div>
                  <div className="stat-icon" style={{background:'#d1fae5', color:'#059669'}}><DollarSign /></div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <p>Pedidos Hoje</p>
                    <h3>{stats.countToday || 0}</h3>
                  </div>
                  <div className="stat-icon" style={{background:'#dbeafe', color:'#2563eb'}}><ShoppingBag /></div>
                </div>
                <div className="stat-card">
                  <div className="stat-info">
                    <p>Ticket Médio</p>
                    <h3>{stats.ticketAverage ? `R$ ${Number(stats.ticketAverage).toFixed(2).replace('.',',')}` : 'R$ 0,00'}</h3>
                  </div>
                  <div className="stat-icon" style={{background:'#fef3c7', color:'#d97706'}}><Users /></div>
                </div>
              </div>

              <div className="chart-section">
                <div className="chart-card">
                  <h4 style={{marginBottom:'1rem'}}>Pedidos por Status</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.statusSeries || []}>
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#d97706" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <h4 style={{marginBottom:'1rem'}}>Vendas (7 Dias)</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.salesSeries || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v)=>v.split('-')[2]+'/'+v.split('-')[1]} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#d97706" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PEDIDOS VIEW */}
          {view === 'orders' && (
            <>
              <div className="filters">
                <button onClick={()=>setFilter('all')} className={`btn ${filter==='all'?'active':''}`}>Todos</button>
                <button onClick={()=>setFilter('novo')} className={`btn ${filter==='novo'?'active':''}`}>Novos</button>
                <button onClick={()=>setFilter('preparando')} className={`btn ${filter==='preparando'?'active':''}`}>Preparando</button>
                <button onClick={()=>setFilter('pronto')} className={`btn ${filter==='pronto'?'active':''}`}>Prontos</button>
                <button onClick={()=>setFilter('entregue')} className={`btn ${filter==='entregue'?'active':''}`}>Entregues</button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Loader2 size={40} className="spin" style={{color:'var(--primary)'}} />
                  <p>Carregando...</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {filtered.length === 0 ? (
                    <div className="stat-card" style={{gridColumn:'1/-1', justifyContent:'center'}}>
                      <p>Nenhum pedido encontrado.</p>
                    </div>
                  ) : filtered.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
                            <span className="order-id">#{String(order.id).slice(0,8)}</span>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status}
                            </span>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem', color:'#9ca3af'}}>
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div style={{fontWeight:'700', fontSize:'1.1rem'}}>
                          {order.total ? `R$ ${Number(order.total).toFixed(2).replace('.',',')}` : ''}
                        </div>
                      </div>

                      <div className="order-body">
                        {/* Cliente */}
                        <div className="info-row">
                          <Users size={16} className="info-icon" />
                          <div>
                            <div className="customer-name">{order.customer?.nome || 'Cliente'}</div>
                            <div className="customer-detail">{order.customer?.telefone}</div>
                          </div>
                        </div>
                        {/* Endereço */}
                        <div className="info-row">
                          <MapPin size={16} className="info-icon" />
                          <div className="customer-detail">
                            {order.customer?.rua ? 
                              `${order.customer.rua}, ${order.customer.numero || 'S/N'} - ${order.customer.bairro || ''}` 
                              : 'Retirada / Sem endereço'}
                          </div>
                        </div>
                        {/* Itens */}
                        <div className="items-box">
                          <div className="items-title"><ShoppingBag size={12} /> Itens</div>
                          <ul className="item-list">
                            {Array.isArray(order.items) ? order.items.map((it, idx) => (
                              <li key={idx} className="item-row">
                                <span className="item-qty">{it.quantity}x</span>
                                <span>
                                  {it.name} 
                                  {it.toppings && <small style={{display:'block', color:'#b45309'}}>+ {it.toppings.join(', ')}</small>}
                                </span>
                              </li>
                            )) : <li>-</li>}
                          </ul>
                        </div>
                      </div>

                      <div className="order-footer">
                        {order.status !== 'entregue' && (
                          <div className="action-group">
                            {order.status === 'novo' && (
                              <button onClick={() => updateStatus(order.id, 'preparando')} className="btn btn-primary action-btn">
                                <Store size={14} /> Aceitar
                              </button>
                            )}
                            {order.status === 'preparando' && (
                              <button onClick={() => updateStatus(order.id, 'pronto')} className="btn btn-success action-btn">
                                <Check size={14} /> Pronto
                              </button>
                            )}
                            {order.status === 'pronto' && (
                              <button onClick={() => updateStatus(order.id, 'entregue')} className="btn action-btn">
                                <Check size={14} /> Finalizar
                              </button>
                            )}
                          </div>
                        )}
                        <button onClick={() => sendWhatsapp(order)} className="btn btn-outline-primary action-btn">
                          <Bike size={14} /> Chamar Motoboy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
