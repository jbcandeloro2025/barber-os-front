import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
window.React = React;
window.ReactDOM = ReactDOM;
import '../booking.css';

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─── API ───────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || "https://saas-saas.xvpbl8.easypanel.host";

const getShopSlug = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("shop")) return params.get("shop");
  const parts = window.location.hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'barberos' && parts[0] !== 'www') return parts[0];
  const pathParts = window.location.pathname.split('/');
  if (pathParts[1] === "admin" || !pathParts[1]) return "";
  return pathParts[1];
};
const SHOP_SLUG = getShopSlug();

// Resolve slug → UUID na primeira carga
let SHOP_ID = null;

async function resolveShop() {
  if (SHOP_ID) return SHOP_ID;
  const res = await fetch(`${API_BASE}/booking/resolve/${SHOP_SLUG}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Shop não encontrado');
  SHOP_ID = data.shop.id;
  return SHOP_ID;
}

async function bookingFetch(path, options = {}) {
  const shopId = await resolveShop();
  const res = await fetch(`${API_BASE}/booking/${shopId}${path}`, {
    ...options,
    credentials: 'include',
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erro ${res.status}`);
  return data;
}

/* ─── CONFIGURATION (defaults — overridden by API on load) ──── */
let CONFIG = {
  nome: "Barbearia",
  slogan: "",
  banner: "barber_shop_header_mockup_1777570601706.png",
  logo: null,
  primaryColor: "#F97316",
  bgType: "gradient",
  bgDirection: "to top",
  bgColor: "#0F1115",
  bgGradient: "#30100a",
  instagram: "",
  facebook: "",
  tiktok: "",
  whatsapp: "",
  footerBanner: "barber_shop_footer_mockup.png"
};

const ALL_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"];

const STATUS_MAP = { CONFIRMED:"Confirmado", PENDING:"Pendente", COMPLETED:"Finalizado", CANCELED:"Cancelado" };


/* ─── HELPERS ──────────────────────────────────────────────── */
const R = v => `R$ ${Number(v).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/,',')}`;
const fmtDate = iso => {
  if(!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(-2)}`;
};

const maskPhone = raw => {
  const n = raw.replace(/\D/g,'').slice(0,11);
  if(n.length===0) return '';
  if(n.length<=2) return `(${n}`;
  if(n.length<=6) return `(${n.slice(0,2)})${n.slice(2)}`;
  if(n.length<=10) return `(${n.slice(0,2)})${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)})${n.slice(2,7)}-${n.slice(7)}`;
};


/* ─── ICONS ─────────────────────────────────────────────────── */
const Ic = ({n,s=18,c="currentColor",sw=2}) => {
  const p = {
    scissors:<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
    check:<polyline points="20 6 9 17 4 12"/>,
    "chevron-right":<polyline points="9 18 15 12 9 6"/>,
    "chevron-left":<polyline points="15 18 9 12 15 6"/>,
    clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    star:<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={c} stroke="none"/>,
    calendar:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    history:<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.2"/></>,
    phone:<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
    "arrow-right":<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    "map-pin":<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    whatsapp:<path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.16c-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z" fill={c} stroke="none"/>,
    "log-out":<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    instagram:<><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
    facebook:<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
    "chevron-up":<polyline points="18 15 12 9 6 15"/>,
    "chevron-down":<polyline points="6 9 12 15 18 9"/>
  };

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {p[n]||<circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

/* ─── PILL BUTTON ──────────────────────────────────────────── */
const Pill = ({active, children, onClick, disabled}) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:"8px 18px",borderRadius:12,border:"1.5px solid",whiteSpace:"nowrap",
      fontSize:14,fontWeight:600,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",
      flexShrink:0,transition:"all 0.2s",
      borderColor:active?"var(--primary)":"var(--border)",
      background:active?"var(--primaryBg)":"var(--surface)",
      color:active?"var(--primary)":"var(--muted)",opacity:disabled?.4:1}}>
    {children}
  </button>
);


/* ─── PRIMARY BUTTON ───────────────────────────────────────── */
const PrimaryBtn = ({children, onClick, disabled, loading, style={}}) => (
  <button onClick={onClick} disabled={disabled||loading}
    style={{width:"100%",height:54,borderRadius:12,border:"none",
      background:disabled||loading?"#262626":"var(--primary)",
      color:disabled||loading?"var(--muted2)":"#FFFFFF",
      fontSize:16,fontWeight:700,fontFamily:"inherit",cursor:disabled||loading?"not-allowed":"pointer",
      transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      boxShadow:disabled||loading?"none":"0 4px 20px rgba(249,115,22,0.2)",...style}}>
    {loading
      ? <><span style={{width:20,height:20,border:"3px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",
          borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}}/> Aguarde...</>
      : children}
  </button>
);


/* ─── SCREEN: LOGIN ─────────────────────────────────────────── */
const LoginScreen = ({onLogin}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const digits = phone.replace(/\D/g,'');
  const valid = digits.length === 11;

  const handle = async () => {
    if (!valid) { setErr('Digite um celular válido'); return; }
    if (!SHOP_ID) { setErr('Link de agendamento inválido. Use ?shop=ID'); return; }
    setErr(''); setLoading(true);
    try {
      const { client } = await bookingFetch('/identify', { method: 'POST', body: { phone: digits } });
      onLogin(digits, client);
    } catch (e) {
      setErr(e.message || 'Erro ao identificar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"40px 24px",background:"radial-gradient(circle at top, #30100a 0%, #0a0a0a 60%)"}}>

      <div style={{width:80,height:80,borderRadius:24,background:"var(--surface)",
        display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32,
        border:"1px solid var(--border)",boxShadow:"0 20px 40px rgba(0,0,0,0.4)"}}>
        <Ic n="scissors" s={36} c="var(--primary)" sw={2}/>
      </div>

      <div style={{width:"100%",textAlign:"center",marginBottom:32}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:8,letterSpacing:"-0.03em"}}>{CONFIG.nome}</h1>
        <p style={{fontSize:15,color:"var(--muted)",lineHeight:1.5}}>
          Informe seu celular para iniciar
        </p>
      </div>

      <div style={{width:"100%",maxWidth:340}}>
        <div style={{position:"relative",marginBottom:err?8:20}}>
          <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",
            display:"flex",alignItems:"center",gap:8,pointerEvents:"none"}}>
            <Ic n="phone" s={18} c="var(--primary)"/>
            <span style={{fontSize:15,color:"var(--muted)",fontWeight:500}}>+55</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={e=>{ setErr(''); setPhone(maskPhone(e.target.value)); }}
            onKeyDown={e=>e.key==='Enter'&&handle()}
            placeholder="Celular"
            style={{width:"100%",padding:"18px 16px 18px 76px",
              background:"#111",border:`1.5px solid ${err?"var(--error)":"var(--border)"}`,
              borderRadius:16,color:"var(--text)",fontSize:16,outline:"none",fontFamily:"inherit",
              transition:"all 0.2s"}}
            onFocus={e=>!err&&(e.target.style.borderColor="var(--primary)")}
            onBlur={e=>!err&&(e.target.style.borderColor="var(--border)")}
          />
        </div>
        {err && <p style={{fontSize:13,color:"var(--error)",marginBottom:20,textAlign:"center"}}>{err}</p>}

        <PrimaryBtn onClick={handle} loading={loading} disabled={!valid}>
          Confirmar
        </PrimaryBtn>
      </div>

      <div style={{marginTop:40,display:"flex",flexDirection:"column",gap:8,alignItems:"center"}}>
      </div>
    </div>
  );
};


/* ─── HEADER ───────────────────────────────────────────────── */
const Header = () => (
  <div style={{width:"100%",height:280,position:"relative",flexShrink:0,overflow:"hidden"}}>
    <img src={CONFIG.banner} 
      style={{width:"100%",height:"100%",objectFit:"cover"}} />

    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}} />
    
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:20}}>
      <div style={{width:100,height:100,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.2)",padding:4,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(10px)",marginBottom:16}}>
        <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #fff", overflow: "hidden"}}>
           {CONFIG.logo ? <img src={CONFIG.logo} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <Ic n="scissors" s={40} c="#fff"/>}
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",borderRadius:12,padding:"10px 20px",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)", maxWidth: "85%"}}>
        <p style={{fontSize:11,fontWeight:500,color:"#fff",marginBottom:8}}>{CONFIG.slogan}</p>
        <div style={{display:"flex",gap:16,justifyContent:"center"}}>
          {CONFIG.instagram && <Ic n="instagram" s={18} c="#fff"/>}
          {CONFIG.facebook && <Ic n="facebook" s={18} c="#fff"/>}
        </div>
      </div>
    </div>
  </div>
);

/* Step indicator */
const StepBar = ({step}) => {
  const labels = ["Serviço","Profissional","Data/Hora","Confirmar"];
  return null; // Removed in favor of Onetik style navigation
};


/* Step 1 — Serviços */
const S1 = ({cart, setCart, services}) => {
  const [cat, setCat] = useState("Todos");
  const cats = ["Todos", ...new Set(services.map(s => s.cat).filter(Boolean))];
  const list = cat==="Todos" ? services : services.filter(s=>s.cat===cat);
  const has = id => cart.some(s=>s.id===id);
  const toggle = s => setCart(p=>has(s.id)?p.filter(x=>x.id!==s.id):[...p,s]);

  const totalTempo = cart.reduce((s,i)=>s+i.tempo,0);
  const totalPreco = cart.reduce((s,i)=>s+i.preco,0);

  return (
    <div className="fade-up" style={{paddingBottom:40}}>
      <div style={{height:60,background:"var(--accent-gradient)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
        <h2 style={{fontSize:20,fontWeight:700}}>Selecione os Serviços</h2>
      </div>

      {/* Categories */}
      <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 20px 20px",scrollbarWidth:"none"}}>
        {cats.map(c => (
          <Pill key={c} active={cat===c} onClick={()=>setCat(c)}>{c}</Pill>
        ))}
      </div>

      <div style={{padding:"0 20px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {list.map(s=>{
            const sel=has(s.id);
            return (
              <button key={s.id} onClick={()=>toggle(s)}
                style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",textAlign:"left",
                  background:"var(--surface)",
                  border:`2px solid ${sel?"var(--primary)":"transparent"}`,
                  borderRadius:16,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",width:"100%",
                  boxShadow: sel ? "0 8px 24px rgba(249,115,22,0.15)" : "none"}}>
                
                <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${sel?"var(--primary)":"var(--border)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",background:sel?"var(--primary)":"transparent"}}>
                  {sel && <Ic n="check" s={14} c="#000" sw={3}/>}
                </div>

                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:700,color:sel?"var(--primary)":"#fff",marginBottom:4}}>
                    {s.titulo}
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.4}}>
                    Duração estimada: {s.tempo} min
                  </div>
                </div>

                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:sel?"var(--primary)":"#fff"}}>
                    {R(s.preco)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Summary if cart not empty */}
      {cart.length > 0 && (
        <div className="fade-up" style={{margin:"24px 20px 0",padding:16,background:"var(--primaryBg)",borderRadius:16,border:"1px solid var(--primary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"var(--primary)"}}>{cart.length} selecionado(s)</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>Tempo total: {totalTempo} min</div>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:"var(--primary)"}}>{R(totalPreco)}</div>
        </div>
      )}
    </div>
  );
};



/* Step 2 — Profissional */
const S2 = ({prof, setProf, profs}) => (
  <div className="fade-up" style={{paddingBottom:120}}>
    <div style={{height:60,background:"var(--accent-gradient)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
      <h2 style={{fontSize:20,fontWeight:700}}>Profissionais disponíveis</h2>
    </div>

    <div style={{padding:"0 20px"}}>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {profs.map(p=>{
          const sel=prof?.id===p.id;
          return (
            <button key={p.id} onClick={()=>setProf(p)}
              style={{display:"flex",alignItems:"center",gap:16,padding:"16px",
                background:"#111",
                border:`1px solid ${sel?"var(--primary)":"rgba(255,255,255,0.05)"}`,
                borderRadius:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                transition:"all 0.2s",width:"100%"}}>
              {/* Avatar Mockup */}
              <div style={{width:56,height:56,borderRadius:12,background:`${p.cor}20`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${p.cor}40`,flexShrink:0}}>
                <span style={{fontSize:20,fontWeight:700,color:p.cor}}>{p.initials}</span>
              </div>

              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:sel?"var(--primary)":"#fff",marginBottom:4}}>
                  {p.nome}
                </div>
                <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.4}}>
                  Barbeiro na JBC. Gabriela tentando dominar os graves. Como o fundador do clipper, barbeiro oficial desde 2023.
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Ic n="instagram" s={16} c="var(--muted2)"/>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);



/* Step 3 — Data/Hora */
const S3 = ({data, setData, hora, setHora, prof}) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    if (!data || !prof?.id) return;
    bookingFetch(`/slots?professional_id=${prof.id}&date=${data}`)
      .then(r => setBlocked(r.blocked || []))
      .catch(() => setBlocked([]));
  }, [data, prof?.id]);

  
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const monthDays = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const firstDayIdx = monthDays[0].getDay();
  const blanks = Array(firstDayIdx).fill(null);

  return (
    <div className="fade-up" style={{paddingBottom:120}}>
      <div style={{height:60,background:"var(--accent-gradient)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
        <h2 style={{fontSize:20,fontWeight:700}}>Dias disponíveis</h2>
      </div>

      <div style={{padding:"0 20px"}}>
        {/* Calendar Card */}
        <div style={{background:"#111",borderRadius:16,padding:20,border:"1px solid rgba(255,255,255,0.05)",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <h3 style={{fontSize:14,fontWeight:700,textTransform:"capitalize"}}>{monthName}</h3>
            <div style={{display:"flex",gap:16}}>
              <button onClick={()=>setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()-1)))} style={{background:"none",border:"none",color:"var(--primary)",cursor:"pointer"}}>
                <Ic n="chevron-left" s={18} c="var(--primary)"/>
              </button>
              <button onClick={()=>setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()+1)))} style={{background:"none",border:"none",color:"var(--primary)",cursor:"pointer"}}>
                <Ic n="chevron-right" s={18} c="var(--primary)"/>
              </button>
            </div>
          </div>

          <div className="cal-header">
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d}>{d}</div>)}
          </div>
          <div className="cal-grid">
            {blanks.map((_,i)=><div key={`b-${i}`}/>)}
            {monthDays.map(d=>{
              const iso = d.toISOString().split('T')[0];
              const isToday = iso === new Date().toISOString().split('T')[0];

              const sel = data === iso;
              return (
                <div key={iso} onClick={()=>setData(iso)}
                  className={`cal-day ${sel?'active':''} ${isToday?'today':''}`}
                  style={{color: sel?'#fff': isToday?'var(--primary)':'#fff'}}>
                  {d.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {data && (
          <div className="fade-up">
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:16,textAlign:"center"}}>
              Horários disponíveis em {fmtDate(data)}
            </h3>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {ALL_SLOTS.slice(0, 8).map(s=>{
                const isBlocked=blocked.includes(s), sel=hora===s;
                return (
                  <button key={s} onClick={()=>!isBlocked&&setHora(s)} disabled={isBlocked}
                    style={{padding:"14px 0",borderRadius:8,border:"1px solid",fontSize:13,fontWeight:700,
                      cursor:isBlocked?"not-allowed":"pointer",fontFamily:"inherit",transition:"all 0.2s",
                      borderColor:sel?"var(--primary)":isBlocked?"#222":"rgba(255,255,255,0.1)",
                      background:sel?"var(--primary)":isBlocked?"#111":"#111",
                      color:sel?"#fff":isBlocked?"#444":"#fff",
                      opacity:isBlocked?.5:1}}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



const S4 = ({cart, prof, data, hora, nome, setNome, obs, setObs, userPhone, userData}) => {
  const subscription = userData?.subscription;
  const total = cart.reduce((s,i) => s + i.preco, 0);

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16, paddingBottom: 100}}>
      {/* Resumo */}
      <div style={{background:"var(--s2)",border:"1px solid rgba(197,164,126,0.25)",borderRadius:14,padding:16}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",
          letterSpacing:"0.06em",marginBottom:12}}>Resumo do Agendamento</div>
        {cart.map(s=>(
          <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:13,
            padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
            <div>
              <div style={{fontWeight:600}}>{s.titulo}</div>
              {subscription && <div style={{fontSize:10,color:"var(--success)",fontWeight:700}}>Plano ativo: {subscription.plan?.name} 💎</div>}
            </div>
            <span style={{fontWeight:600,color:"var(--primary)"}}>{R(s.preco)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0"}}>
          <span style={{color:"var(--muted)"}}>Profissional</span>
          <span style={{fontWeight:600}}>{prof?.nome||"—"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"8px 0"}}>
          <span style={{color:"var(--muted)"}}>Data e hora</span>
          <span style={{fontWeight:600}}>{data?`${fmtDate(data)} às ${hora||"—"}`:"—"}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,
          marginTop:10,paddingTop:10,borderTop:"1px solid var(--border)"}}>
          <span>Total a pagar</span><span style={{color:"var(--primary)"}}>{R(total)}</span>
        </div>
      </div>

      {/* Form */}
      <div>
        <label style={{fontSize:12,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:7}}>
          Seu nome completo
        </label>
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Como você se chama?"
          style={{width:"100%",padding:"13px 14px",background:"var(--s2)",border:"1px solid var(--border)",
            borderRadius:12,color:"var(--text)",fontSize:14,outline:"none",fontFamily:"inherit",
            transition:"border-color 0.2s"}}
          onFocus={e=>e.target.style.borderColor="var(--primary)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"}/>
      </div>
      <div>
        <label style={{fontSize:12,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:7}}>
          WhatsApp para lembrete
        </label>
        <div style={{padding:"13px 14px",background:"var(--s2)",border:"1px solid var(--border)",
          borderRadius:12,fontSize:14,color:"var(--text)",display:"flex",alignItems:"center",gap:8}}>
          <Ic n="phone" s={15} c="var(--muted2)"/>
          <span style={{fontWeight:500}}>{userPhone}</span>
          <span style={{fontSize:11,color:"var(--success)",marginLeft:"auto",fontWeight:600}}>✓ Verificado</span>
        </div>
      </div>
      <div>
        <label style={{fontSize:12,fontWeight:600,color:"var(--muted)",display:"block",marginBottom:7}}>
          Observações <span style={{fontWeight:400}}>(opcional)</span>
        </label>
        <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2}
          placeholder="Alguma preferência ou recado para o profissional?"
          style={{width:"100%",padding:"12px 14px",background:"var(--s2)",border:"1px solid var(--border)",
            borderRadius:12,color:"var(--text)",fontSize:13,resize:"none",outline:"none",fontFamily:"inherit",
            transition:"border-color 0.2s"}}
          onFocus={e=>e.target.style.borderColor="var(--primary)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"}/>
      </div>
    </div>
  );
};

/* ─── SUCCESS ────────────────────────────────────────────────── */
const Success = ({cart, prof, data, hora, nome, onReset}) => {
  const total=cart.reduce((s,i)=>s+i.preco,0);
  const COLORS=["#F97316","#FB923C","#EA580C","#10B981","#3B82F6"];
  const pieces=useMemo(()=>Array.from({length:32}).map((_,i)=>({
    x:Math.random()*100,delay:Math.random()*2,
    color:COLORS[i%COLORS.length],size:4+Math.random()*6,
    shape:Math.random()>0.5?"circle":"square",
  })),[]);


  return (
    <div className="fade-up" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
      {/* Confetti */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        {pieces.map((p,i)=>(
          <div key={i} style={{position:"absolute",left:`${p.x}%`,top:0,
            width:p.size,height:p.size,background:p.color,
            borderRadius:p.shape==="circle"?"50%":3,
            animation:`confetti 2.8s ${p.delay}s ease-in forwards`}}/>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"28px 20px 120px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(16,185,129,0.15)",
          border:"3px solid var(--success)",display:"flex",alignItems:"center",justifyContent:"center",
          marginBottom:20,animation:"pop 0.5s 0.2s ease-out both"}}>
          <Ic n="check" s={36} c="var(--success)"/>
        </div>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:6}}>Agendado! 🎉</h2>
        <p style={{color:"var(--muted)",fontSize:14,marginBottom:28,lineHeight:1.5}}>
          Você receberá um lembrete no WhatsApp<br/>1 hora antes do horário.
        </p>

        {/* Card resumo */}
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,
          padding:18,width:"100%",textAlign:"left",marginBottom:20}}>
          {[
            {label:"Serviços",val:cart.map(s=>s.titulo).join(", ")},
            {label:"Profissional",val:prof?.nome||"—"},
            {label:"Data e hora",val:`${fmtDate(data)} às ${hora}`},
            {label:"Cliente",val:nome||"—"},
          ].map(({label,val})=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
              padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:12,color:"var(--muted)",flexShrink:0,marginRight:12}}>{label}</span>
              <span style={{fontSize:13,fontWeight:600,textAlign:"right"}}>{val}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontSize:15,fontWeight:800}}>
            <span>Total</span><span style={{color:"var(--primary)"}}>{R(total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%"}}>
          <a href={`https://wa.me/5511987654321?text=Olá! Acabei de agendar ${cart.map(s=>s.titulo).join(" + ")} para ${fmtDate(data)} às ${hora} ✂️`}
            target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 0",
              borderRadius:14,background:"#25D366",color:"#fff",textDecoration:"none",
              fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
            <Ic n="whatsapp" s={18} c="#fff"/>Confirmar pelo WhatsApp
          </a>
          <button onClick={onReset}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"13px 0",
              borderRadius:14,background:"transparent",border:"1px solid var(--border)",
              color:"var(--muted)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13}}>
            <Ic n="plus" s={14} c="var(--muted)"/>Fazer outro agendamento
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── TAB: AGENDAR ──────────────────────────────────────────── */
const TabAgendar = ({userPhone, userData, services, profs}) => {
  const today = new Date().toISOString().split('T')[0];
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [prof, setProf] = useState(null);
  const [data, setData] = useState(today);
  const [hora, setHora] = useState('');
  const [nome, setNome] = useState(userData?.name || '');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);

  const total = cart.reduce((s,i) => s + i.preco, 0);
  const canNext = [cart.length>0, !!prof, !!(data&&hora), !!(nome.trim())][step];

  const handleNext = async () => {
    if (step < 3) { setStep(s=>s+1); return; }
    if (!userData?.id) { alert('Erro: cliente não identificado.'); return; }
    setLoading(true);
    try {
      const scheduled_at = new Date(`${data}T${hora}:00`).toISOString();
      // Cria um agendamento para cada serviço do carrinho
      for (const svc of cart) {
        await bookingFetch('/appointment', {
          method: 'POST',
          body: {
            client_id:       userData.id,
            client_name:     nome.trim(),
            service_id:      svc.id,
            professional_id: prof.id,
            scheduled_at,
            notes: obs || undefined,
          }
        });
      }
      setDone(true);
    } catch (e) {
      alert(`Erro ao agendar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setStep(0);setCart([]);setProf(null);setHora('');setNome('');setObs('');setDone(false); };

  if(done) return <Success cart={cart} prof={prof} data={data} hora={hora} nome={nome} onReset={handleReset}/>;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <StepBar step={step}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 120px"}}>
        {step===0&&<S1 cart={cart} setCart={setCart} services={services}/>}
        {step===1&&<S2 prof={prof} setProf={setProf} profs={profs}/>}
        {step===2&&<S3 data={data} setData={setData} hora={hora} setHora={setHora} prof={prof}/>}
        {step===3&&<S4 cart={cart} prof={prof} data={data} hora={hora}
          nome={nome} setNome={setNome} obs={obs} setObs={setObs} userPhone={userPhone} userData={userData}/>}
        
        {/* Footer Banner */}
        {CONFIG.footerBanner && (
          <div style={{marginTop:40,borderRadius:16,overflow:"hidden",border:"1px solid var(--border)"}}>
            <img src={CONFIG.footerBanner} style={{width:"100%",display:"block"}} />
          </div>
        )}
      </div>
      {/* Bottom bar */}
      <div style={{position:"fixed",bottom:0,left:0,
        width:"100%",padding:"16px 20px 24px",
        background:"rgba(15,17,21,0.95)",borderTop:"1px solid var(--border)",backdropFilter:"blur(12px)",
        zIndex:100}}>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <PrimaryBtn onClick={handleNext} disabled={!canNext} loading={loading} style={{borderRadius:30,height:52}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",gap:10}}>
              <span>
                {step===0 && cart.length > 0 ? `Continuar (${R(total)})` : 
                 step===3 ? "Confirmar Agendamento" : "Próximo"}
              </span>
              {step<3 && <Ic n="arrow-right" s={18} c="#fff"/>}
            </div>
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
};



/* ─── TAB: HISTÓRICO ────────────────────────────────────────── */
const statusColor = s => ({Finalizado:"var(--success)",Cancelado:"var(--error)",Confirmado:"var(--primary)",Pendente:"var(--warn)"}[s]||"var(--muted)");
const statusBg = s => ({Finalizado:"rgba(16,185,129,0.1)",Cancelado:"rgba(239,68,68,0.1)",Confirmado:"rgba(249,115,22,0.1)",Pendente:"rgba(245,158,11,0.1)"}[s]||"transparent");

const TabHistorico = ({userData}) => {
  const [filter, setFilter] = useState("todos");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData?.id) return;
    setLoading(true);
    bookingFetch(`/history/${userData.id}`)
      .then(r => {
        const mapped = (r.appointments || []).map(ap => {
          const dt = new Date(ap.scheduled_at);
          const pad = n => String(n).padStart(2,'0');
          return {
            id:      ap.id,
            servico: ap.service?.title || '',
            prof:    ap.professional?.name || '',
            data:    ap.scheduled_at.split('T')[0],
            hora:    `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
            preco:   Number(ap.service?.price || 0),
            status:  STATUS_MAP[ap.status] || ap.status,
          };
        });
        setHistory(mapped);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [userData?.id]);

  const list = filter==="todos" ? history : history.filter(h=>h.status===filter);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"20px 20px 0",textAlign:"center"}}>
        <h2 style={{fontSize:24,fontWeight:800,marginBottom:8}}>Meus Agendamentos</h2>
        <p style={{fontSize:14,color:"var(--muted)",marginBottom:24}}>Histórico de serviços realizados</p>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none",msOverflowStyle:"none",justifyContent:"center"}}>
          {[["todos","Todos"],["Finalizado","Concluídos"],["Confirmado","Confirmados"],["Cancelado","Cancelados"]].map(([id,l])=>(
            <Pill key={id} active={filter===id} onClick={()=>setFilter(id)}>{l}</Pill>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"12px 20px 120px"}}>
        {list.length===0&&(
          <div style={{textAlign:"center",padding:"60px 0",color:"var(--muted2)"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",border:"1.5px solid var(--border)"}}>
              <Ic n="calendar" s={24} c="var(--muted2)"/>
            </div>
            <p style={{fontSize:15,fontWeight:500}}>Nenhum agendamento encontrado</p>
          </div>
        )}
        {list.map(h=>(
          <div key={h.id} style={{background:"var(--surface)",border:"1.5px solid var(--border)",
            borderRadius:20,padding:"20px",marginBottom:16,transition:"transform 0.2s"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>{h.servico}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,color:"var(--muted)",fontSize:13}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#262626",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Ic n="user" s={10} c="var(--primary)"/>
                  </div>
                  {h.prof}
                </div>
              </div>
              <span style={{padding:"6px 12px",borderRadius:10,fontSize:12,fontWeight:700,
                background:statusBg(h.status),color:statusColor(h.status),flexShrink:0,
                border:`1px solid ${statusColor(h.status)}30`}}>
                {h.status}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1.5px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:5,color:"var(--muted)"}}>
                  <Ic n="calendar" s={14} c="var(--muted2)"/>
                  <span style={{fontSize:13}}>{fmtDate(h.data)}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,color:"var(--muted)"}}>
                  <Ic n="clock" s={14} c="var(--muted2)"/>
                  <span style={{fontSize:13}}>{h.hora}</span>
                </div>
              </div>
              <span style={{fontSize:18,fontWeight:800,color:"var(--primary)"}}>{R(h.preco)}</span>
            </div>
            {h.status==="Finalizado"&&(
              <button style={{marginTop:16,width:"100%",height:44,borderRadius:12,background:"#1a1a1a",border:"1px solid var(--border)",color:"var(--primary)",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Ic n="plus" s={14} c="var(--primary)"/> Agendar novamente
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── MAIN APP ──────────────────────────────────────────────── */
const App = () => {
  const [userPhone, setUserPhone] = useState(null);
  const [userData, setUserData] = useState(null);
  const [tab, setTab] = useState("agendar");
  const [services, setServices] = useState([]);
  const [profs, setProfs] = useState([]);

  useEffect(() => {
    if (!SHOP_ID) return;
    Promise.all([
      bookingFetch('/config').then(r => {
        if (r.shop) {
          const api = r.shop.config || {};
          CONFIG = {
            ...CONFIG,
            nome: r.shop.name || CONFIG.nome,
            logo: r.shop.logo_url || CONFIG.logo,
            slogan: api.slogan ?? CONFIG.slogan,
            primaryColor: api.primaryColor ?? CONFIG.primaryColor,
            bgType: api.bgType ?? CONFIG.bgType,
            bgDirection: api.bgDirection ?? CONFIG.bgDirection,
            bgColor: api.bgColor ?? CONFIG.bgColor,
            bgGradient: api.bgGradient ?? CONFIG.bgGradient,
            instagram: api.instagram ?? CONFIG.instagram,
            facebook: api.facebook ?? CONFIG.facebook,
            tiktok: api.tiktok ?? CONFIG.tiktok,
            whatsapp: api.whatsapp ?? CONFIG.whatsapp,
            banner: api.banner ?? CONFIG.banner,
            footerBanner: api.footerBanner ?? CONFIG.footerBanner,
          };
          document.title = `${CONFIG.nome} — Agendar`;
        }
      }).catch(() => {}),
      bookingFetch('/services').then(r => setServices((r.services||[]).map(s => ({
        id: s.id, titulo: s.title, preco: Number(s.price), tempo: s.duration, cat: "Serviço", desc: s.description || ''
      })))),
      bookingFetch('/professionals').then(r => setProfs((r.professionals||[]).map((p,i) => ({
        id: p.id, nome: p.name, sub: (p.specialties||[]).join(', '),
        initials: p.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(),
        cor: ["#F97316","#C5A47E","#3B82F6","#10B981"][i%4],
      })))),
    ]).catch(console.error);
  }, []);

  const handleLogin = (phone, client) => {
    setUserPhone(phone);
    setUserData(client || null);
  };
  const handleLogout = () => { setUserPhone(null); setUserData(null); setTab("agendar"); };

  useEffect(() => {
    // Apply dynamic theme
    const root = document.documentElement;
    root.style.setProperty('--primary', CONFIG.primaryColor);
    root.style.setProperty('--primaryBg', `${CONFIG.primaryColor}1A`);
    
    const bodyBg = CONFIG.bgType === 'solid' ? CONFIG.bgColor : `linear-gradient(${CONFIG.bgDirection}, ${CONFIG.bgGradient}, ${CONFIG.bgColor})`;
    root.style.setProperty('--bg', CONFIG.bgColor); // For the solid part or fallback
    document.getElementById('root').style.background = bodyBg;
  }, []);

  if(!userPhone) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",width:"100%",overflow:"hidden"}}>
      <LoginScreen onLogin={handleLogin}/>
    </div>
  );

  return (
    <div className="booking-page">
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
        {/* Top Nav Overlay */}
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 20px",display:"flex",gap:24,zIndex:50,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
           <div style={{display:"flex",alignItems:"center",gap:10,marginRight:"auto"}}>
              <div style={{width:28,height:28,borderRadius:8,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ic n="scissors" s={16} c="#000"/>
              </div>
           </div>
          <button onClick={()=>setTab("agendar")}
            style={{background:"transparent",border:"none",color:tab==="agendar"?"var(--primary)":"#fff",
              fontSize:14,fontWeight:700,cursor:"pointer",padding:"4px 0",position:"relative",transition:"all 0.2s"}}>
            Agendar
            {tab==="agendar" && <div style={{position:"absolute",bottom:-4,left:0,right:0,height:2,background:"var(--primary)",borderRadius:2}}/>}
          </button>
          <button onClick={()=>setTab("historico")}
            style={{background:"transparent",border:"none",color:tab==="historico"?"var(--primary)":"#fff",
              fontSize:14,fontWeight:700,cursor:"pointer",padding:"4px 0",position:"relative",transition:"all 0.2s"}}>
            Histórico
            {tab==="historico" && <div style={{position:"absolute",bottom:-4,left:0,right:0,height:2,background:"var(--primary)",borderRadius:2}}/>}
          </button>
        </div>
  
        {/* Content */}
        <div className="scroll-y" style={{flex:1}}>
          <Header />
          {tab==="agendar" && <TabAgendar userPhone={userPhone} userData={userData} services={services} profs={profs}/>}
          {tab==="historico" && <TabHistorico userData={userData}/>}
        </div>
  
        {/* Logout float */}
        <button onClick={handleLogout}
          style={{position:"fixed",top:12,right:12,width:32,height:32,borderRadius:"50%",
            background:"rgba(0,0,0,0.5)",border:"1px solid rgba(255,255,255,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:100}}>
          <Ic n="log-out" s={14} c="#fff"/>
        </button>
      </div>
    </div>
  );
};

export default App;
