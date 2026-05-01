import React from 'react';
import ReactDOM from 'react-dom/client';
import '../admin.css';

// Login Screen
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      if (data.user?.shop?.id) setShopId(data.user.shop.id);
      onLogin();
    } catch (e) {
      setError(e.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#C5A47E,#8B6342)", borderRadius:14,
            display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
            <Icon name="scissors" size={24} color="#0F1115"/>
          </div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>BarberOS</h1>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Acesse o painel de administração</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>E-mail</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com" icon="mail" required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Senha</label>
            <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" icon="lock" required/>
          </div>
          {error && (
            <div style={{ background:"#EF444415", border:"1px solid #EF444440", borderRadius:8, padding:"10px 12px", fontSize:13, color:"#EF4444" }}>
              {error}
            </div>
          )}
          <Btn variant="primary" type="submit" disabled={loading} style={{ justifyContent:"center", padding:"11px 0", fontSize:14, marginTop:4 }}>
            {loading ? "Entrando..." : "Entrar"}
          </Btn>
        </form>
      </div>
    </div>
  );
};

// Admin App — Main Shell
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#C5A47E",
  "darkBg": "#0F1115",
  "sidebarCollapsed": false
}/*EDITMODE-END*/;


const AdminApp = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(!!getToken());
  const [view, setView] = React.useState("dashboard");
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [newBookingOpen, setNewBookingOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "agenda", label: "Agenda", icon: "calendar" },
    { id: "crm", label: "Clientes", icon: "users" },
    { id: "inventory", label: "Estoque", icon: "package" },
    { id: "reports", label: "Relatórios", icon: "bar-chart-2" },
    { id: "finance", label: "Financeiro", icon: "dollar-sign" },
    { id: "settings", label: "Configurações", icon: "settings" },
  ];

  const [theme, setTheme] = React.useState("dark");

  const THEMES = {
    dark: {
      bg: tweaks.darkBg || "#0F1115",
      surface: "#1A1D24",
      surface2: "#20242D",
      border: "#2A2F3A",
      text: "#FFFFFF",
      muted: "#A1A7B3",
      muted2: "#6B7280",
      cardShadow: "none",
      inputBg: "#20242D",
    },
    light: {
      bg: "#F0F2F5",
      surface: "#FFFFFF",
      surface2: "#F5F7FA",
      border: "#DDE1E8",
      text: "#111827",
      muted: "#4B5563",
      muted2: "#9CA3AF",
      cardShadow: "0 1px 3px rgba(0,0,0,0.08)",
      inputBg: "#F9FAFB",
    },
  };

  const T = THEMES[theme];

  const applyTheme = (next) => {
    const t = THEMES[next];
    const vars = {
      "--bg": t.bg,
      "--surface": t.surface,
      "--surface2": t.surface2,
      "--border": t.border,
      "--text": t.text,
      "--muted": t.muted,
      "--muted2": t.muted2,
      "--card-shadow": t.cardShadow,
      "--input-bg": t.inputBg,
      "--scrollbar": next === "dark" ? "#2A2F3A" : "#D1D5DB",
    };
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.documentElement.setAttribute('data-theme', next);

    // Inject scoped overrides
    let styleEl = document.getElementById('__theme-overrides');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = '__theme-overrides'; document.head.appendChild(styleEl); }
    if (next === "light") {
      styleEl.textContent = `
        :root { color-scheme: light; }
        body { background: var(--bg) !important; color: var(--text) !important; }
        ::-webkit-scrollbar-thumb { background: var(--scrollbar) !important; }

        /* Inputs */
        input, select, textarea {
          background: var(--input-bg) !important;
          color: var(--text) !important;
          border-color: var(--border) !important;
        }
        input::placeholder, textarea::placeholder { color: var(--muted2) !important; }

        /* Nav */
        .nav-item:hover { background: rgba(0,0,0,0.05) !important; }
        .nav-item.active { background: rgba(197,164,126,0.18) !important; }

        /* Tables */
        table thead tr { background: var(--surface2) !important; }
        table th { color: var(--muted) !important; }
        table td { color: var(--text) !important; }
        table tbody tr:hover { background: rgba(0,0,0,0.025) !important; }

        /* Cards & surfaces */
        [style*="background: var(--surface)"],
        [style*="background:var(--surface)"] {
          box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
        }

        /* Metric cards overlay gradient */
        [style*="radial-gradient(circle at top right"] {
          opacity: 0.6;
        }

        /* Muted text forced */
        [style*="color: var(--muted)"],
        [style*="color:var(--muted)"] { color: var(--muted) !important; }

        /* Chart backgrounds */
        canvas { filter: none; }

        /* Topbar & sidebar */
        aside, header { border-color: var(--border) !important; }

        /* Badges get slightly more opacity in light */
        span[style*="border-radius:20px"],
        span[style*="border-radius: 20px"] { opacity: 0.95; }

        /* Modal backdrop */
        [style*="background:rgba(0,0,0,0.7)"],
        [style*="background: rgba(0,0,0,0.7)"] {
          background: rgba(0,0,0,0.45) !important;
        }

        /* Drawer / notification */
        [style*="background:rgba(26,29,36"],
        [style*="background: rgba(26,29,36"] {
          background: #fff !important;
        }
      `;
    } else {
      styleEl.textContent = `
        :root { color-scheme: dark; }
        .nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .nav-item.active { background: rgba(197,164,126,0.12) !important; }
      `;
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary', tweaks.accentColor);
    if (theme === "dark") {
      document.documentElement.style.setProperty('--bg', tweaks.darkBg);
    }
    // Apply initial theme overrides on mount
    applyTheme(theme);
  }, [tweaks.accentColor, tweaks.darkBg]);

  const handleNav = (id) => {
    if (id === "pdv") { setCheckoutOpen(true); return; }
    setView(id);
  };

  // Derived theme colors — used directly in JSX so React re-renders on theme change
  const isLight = theme === "light";
  const bg     = isLight ? "#F0F2F5"  : (tweaks.darkBg || "#0F1115");
  const surf   = isLight ? "#FFFFFF"  : "#1A1D24";
  const surf2  = isLight ? "#F5F7FA"  : "#20242D";
  const border = isLight ? "#DDE1E8"  : "#2A2F3A";
  const txt    = isLight ? "#111827"  : "#FFFFFF";
  const muted  = isLight ? "#4B5563"  : "#A1A7B3";
  const muted2 = isLight ? "#9CA3AF"  : "#6B7280";
  const navHoverBg    = isLight ? "rgba(0,0,0,0.05)"           : "rgba(255,255,255,0.04)";
  const navActiveBg   = isLight ? "rgba(197,164,126,0.18)"     : "rgba(197,164,126,0.12)";
  const cardShadow    = isLight ? "0 1px 3px rgba(0,0,0,0.08)" : "none";

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)}/>;

  return (
    <div className="admin-page">
      <>
      <style>{`
        .nav-item:hover { background: ${navHoverBg} !important; }
        .nav-item.active { background: ${navActiveBg} !important; }
        .theme-toggle:hover { background: ${isLight ? "#E5E7EB" : surf2} !important; transform: scale(1.05); }
        /* propagate computed colors to all var() consumers */
        :root {
          --bg: ${bg};
          --surface: ${surf};
          --surface2: ${surf2};
          --border: ${border};
          --text: ${txt};
          --muted: ${muted};
          --muted2: ${muted2};
          --card-shadow: ${cardShadow};
          --input-bg: ${isLight ? "#F9FAFB" : surf2};
          --scrollbar: ${isLight ? "#D1D5DB" : "#2A2F3A"};
        }
      `}</style>

    <div style={{ display:"flex", height:"100vh", background:bg, overflow:"hidden", position:"relative", color:txt }}>
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''} ${tweaks.sidebarCollapsed ? 'collapsed' : ''}`}
        style={{ borderRight:`1px solid ${border}`, display:"flex", flexDirection:"column",
          flexShrink:0, transition:"width 0.2s cubic-bezier(0.4,0,0.2,1)", background:surf, height:"100%" }}>

          {/* Logo */}
          <div style={{ padding:tweaks.sidebarCollapsed?"20px 0":"20px 20px", borderBottom:`1px solid ${border}`,
            display:"flex", alignItems:"center", gap:10, justifyContent:tweaks.sidebarCollapsed?"center":"flex-start" }}>
            <div style={{ width:34, height:34, background:"linear-gradient(135deg,#C5A47E,#8B6342)", borderRadius:9,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon name="scissors" size={17} color="#0F1115"/>
            </div>
            {!tweaks.sidebarCollapsed && (
              <div>
                <div style={{ fontWeight:800, fontSize:14, letterSpacing:"-0.02em", color:txt }}>BarberOS</div>
                <div style={{ fontSize:10, color:muted, fontWeight:500 }}>Studio Rafael</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
            {navItems.map(item => {
              const isActive = view===item.id && item.id!=="pdv";
              return (
                <button key={item.id} onClick={() => { handleNav(item.id); setMobileMenuOpen(false); }}
                  className={`nav-item ${isActive?"active":""}`}
                  style={{ width:"100%", padding:tweaks.sidebarCollapsed?"10px 0":"10px 14px",
                    border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                    display:"flex", alignItems:"center", gap:12,
                    justifyContent:tweaks.sidebarCollapsed?"center":"flex-start",
                    background: isActive ? navActiveBg : "transparent",
                    color: isActive ? "#C5A47E" : muted,
                    borderLeft: isActive ? "2px solid #C5A47E" : "2px solid transparent",
                    transition:"all 0.14s" }}>
                  <Icon name={item.icon} size={16} color={isActive?"#C5A47E":muted2}/>
                  {!tweaks.sidebarCollapsed && <span style={{ fontSize:13, fontWeight:500 }}>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div style={{ padding:"12px 8px", borderTop:`1px solid ${border}`, display:"flex", flexDirection:"column", gap:6 }}>
            <button onClick={() => setTweak("sidebarCollapsed", !tweaks.sidebarCollapsed)}
              style={{ width:"100%", padding:tweaks.sidebarCollapsed?"10px 0":"10px 14px",
                border:"none", borderRadius:8, cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:12, justifyContent:tweaks.sidebarCollapsed?"center":"flex-start",
                background:"transparent", color:muted, transition:"all 0.14s" }}
              className="nav-item">
              <Icon name={tweaks.sidebarCollapsed?"chevron-right":"chevron-left"} size={16} color={muted2}/>
              {!tweaks.sidebarCollapsed && <span style={{ fontSize:12, color:muted }}>Recolher menu</span>}
            </button>

            <div style={{ padding:tweaks.sidebarCollapsed?"8px 0":"8px 12px",
              display:"flex", alignItems:"center", gap:10, justifyContent:tweaks.sidebarCollapsed?"center":"flex-start" }}>
              <Avatar initials="RS" size={30} color="#C5A47E"/>
              {!tweaks.sidebarCollapsed && (
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:txt }}>Rafael Souza</div>
                  <div style={{ fontSize:10, color:muted }}>Admin</div>
                </div>
              )}
              {!tweaks.sidebarCollapsed && (
                <button onClick={() => { clearToken(); setAuthed(false); }}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center" }}
                  title="Sair">
                  <Icon name="log-out" size={14} color={muted2}/>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }} className="main-content">
          {/* Header */}
          <div style={{ height:64, borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center",
            justifyContent:"space-between", padding:"0 24px", flexShrink:0, background:surf }}>
            
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div className="mobile-header" style={{ display:"none", cursor:"pointer" }} onClick={() => setMobileMenuOpen(true)}>
                <Icon name="menu" size={24} color={muted}/>
              </div>
              <h2 style={{ fontSize:15, fontWeight:700, color:txt }}>
                {navItems.find(i=>i.id===view)?.label}
              </h2>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="hide-mobile" style={{ background:surf2, border:`1px solid ${border}`, borderRadius:8, padding:"6px 12px",
                fontSize:11, color:muted, fontWeight:600 }}>
                {new Date().toLocaleDateString('pt-BR', {weekday:'short', day:'numeric', month:'short'})}
              </div>

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="theme-toggle"
                style={{ background:surf2, border:`1px solid ${border}`, borderRadius:8, padding:"7px",
                  cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}
                title={isLight ? "Modo Escuro" : "Modo Claro"}>
                <Icon name={isLight ? "moon" : "sun"} size={15} color="#C5A47E"/>
              </button>

              {/* Notificações */}
              <div style={{ position:"relative" }}>
                <div onClick={() => setNotificationsOpen(true)}
                  style={{ background:surf2, border:`1px solid ${border}`, borderRadius:8, padding:"7px", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name="bell" size={15} color="#C5A47E"/>
                  <div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, background:"#EF4444", borderRadius:"50%", border:`2px solid ${surf}` }}/>
                </div>
              </div>

              {/* PDV */}
              <button onClick={() => setCheckoutOpen(true)}
                style={{ background:"#C5A47E", border:"none", borderRadius:8, padding:"7px 12px",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:5, color:"#0F1115", fontWeight:700, fontSize:12, fontFamily:"inherit" }}>
                <Icon name="shopping-bag" size={14} color="#0F1115"/>
                <span className="hide-mobile">PDV</span>
              </button>
            </div>
          </div>

          {/* Page */}
          <div style={{ flex:1, overflow:"hidden" }}>
            {view==="dashboard" && <Dashboard onNewBooking={()=>setNewBookingOpen(true)} onGoToReports={() => setView("reports")}/>}
            {view==="agenda" && <Agenda/>}
            {view==="crm" && <CRM/>}
            {view==="inventory" && <Inventory/>}
            {view==="reports" && <Reports/>}
            {view==="finance" && <Finance/>}
            {view==="settings" && <Settings/>}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal open={checkoutOpen} onClose={()=>setCheckoutOpen(false)}/>

      {/* New Booking — redireciona para Agenda que tem o modal completo com API real */}
      <Modal open={newBookingOpen} onClose={()=>setNewBookingOpen(false)} title="Novo Agendamento" width={360}>
        <div style={{ textAlign:"center", padding:"8px 0 16px" }}>
          <Icon name="calendar" size={40} color="#C5A47E" style={{ marginBottom:16 }}/>
          <p style={{ color:"var(--muted)", fontSize:14, marginBottom:20 }}>
            Use a Agenda para criar agendamentos completos com integração em tempo real.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <Btn variant="secondary" onClick={()=>setNewBookingOpen(false)}>Cancelar</Btn>
            <Btn variant="primary" icon="calendar" onClick={()=>{ setNewBookingOpen(false); setView("agenda"); }}>Ir para Agenda</Btn>
          </div>
        </div>
      </Modal>

      {/* Tweaks Panel */}
      <TweaksPanel>
        <TweakSection title="Aparência">
          <TweakColor label="Cor de destaque" tweakKey="accentColor"/>
          <TweakColor label="Fundo principal" tweakKey="darkBg"/>
          <TweakToggle label="Menu recolhido" tweakKey="sidebarCollapsed"/>
        </TweakSection>
      </TweaksPanel>
      {/* Notifications Drawer */}
      {notificationsOpen && <NotificationsCenter onClose={() => setNotificationsOpen(false)} />}
      </>
    </div>
  );
};

export default AdminApp;
