
// UI Primitives — shared across all admin components

const Icon = ({ name, size = 16, color = "currentColor", strokeWidth = 2 }) => {
  const icons = {
    home: <><rect x="3" y="9" width="18" height="13" rx="2"/><polyline points="3 9 12 3 21 9"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    "shopping-bag": <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    "trending-up": <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    "trending-down": <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
    scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    "chevron-right": <polyline points="9 18 15 12 9 6"/>,
    "chevron-left": <polyline points="15 18 9 12 15 6"/>,
    "chevron-down": <polyline points="6 9 12 15 18 9"/>,
    "chevron-up": <polyline points="18 15 12 9 6 15"/>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    "dollar-sign": <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    "bar-chart-2": <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    "alert-circle": <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    "message-circle": <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    "credit-card": <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    "log-out": <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    "more-vertical": <><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>,
    "whatsapp": <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.115 1.522 5.845L0 24l6.335-1.502A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>,
    info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    "layout-grid": <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    "user-plus": <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
    percent: <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
    "package": <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    tiktok: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: { bg: "rgba(165,130,96,0.15)", color: "#C5A47E", border: "rgba(197,164,126,0.3)" },
    success: { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "rgba(16,185,129,0.3)" },
    error: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", border: "rgba(239,68,68,0.3)" },
    warning: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
    info: { bg: "rgba(59,130,246,0.12)", color: "#3B82F6", border: "rgba(59,130,246,0.3)" },
    muted: { bg: "rgba(42,47,58,0.6)", color: "#A1A7B3", border: "rgba(42,47,58,0.8)" },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:"0.03em",
      background: v.bg, color: v.color, border:`1px solid ${v.border}` }}>
      {children}
    </span>
  );
};

const statusVariant = (s) => ({
  "Confirmado": "success", "Pendente": "warning", "Cancelado": "error",
  "Finalizado": "info", "No-show": "muted"
}[s] || "default");

const Avatar = ({ initials, color = "#C5A47E", size = 36 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}22`, border:`2px solid ${color}44`,
    display:"flex", alignItems:"center", justifyContent:"center", color, fontWeight:700, fontSize:size*0.33, flexShrink:0 }}>
    {initials}
  </div>
);

const Card = ({ children, style = {}, glass = false, onClick }) => (
  <div onClick={onClick} style={{ background: glass ? "rgba(26,29,36,0.6)" : "var(--surface)",
    border: "1px solid var(--border)", borderRadius:12, padding:20, backdropFilter: glass ? "blur(12px)" : "none", boxShadow: glass ? "none" : "var(--card-shadow, none)",
    cursor: onClick ? "pointer" : "default", transition:"border-color 0.2s", ...style }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor="#C5A47E44")}
    onMouseLeave={e => onClick && (e.currentTarget.style.borderColor="var(--border)")}>
    {children}
  </div>
);

const Btn = ({ children, variant="primary", size="md", onClick, disabled, style={}, icon }) => {
  const variants = {
    primary: { bg:"#C5A47E", color:"#0F1115", hover:"#D4B494" },
    secondary: { bg:"var(--surface2)", color:"var(--text)", hover:"#2A2F3A" },
    ghost: { bg:"transparent", color:"var(--muted)", hover:"rgba(255,255,255,0.05)" },
    success: { bg:"#10B981", color:"#fff", hover:"#0ea572" },
    danger: { bg:"rgba(239,68,68,0.15)", color:"#EF4444", hover:"rgba(239,68,68,0.25)" },
  };
  const sizes = { sm:"6px 12px", md:"9px 18px", lg:"12px 24px" };
  const fontSizes = { sm:12, md:13, lg:14 };
  const v = variants[variant];
  const [hovered, setHovered] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:sizes[size], borderRadius:8, border:"none",
        background: hovered ? v.hover : v.bg, color: v.color, fontSize:fontSizes[size], fontWeight:600, fontFamily:"inherit",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition:"all 0.15s", ...style }}>
      {icon && <Icon name={icon} size={14} color={v.color}/>}
      {children}
    </button>
  );
};

const Input = ({ placeholder, value, onChange, type="text", style={}, icon, ...rest }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    {icon && <span style={{ position:"absolute", left:10, color:"var(--muted2)", pointerEvents:"none" }}>
      <Icon name={icon} size={14}/>
    </span>}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width:"100%", padding: icon ? "9px 12px 9px 34px" : "9px 12px", background:"var(--input-bg, var(--surface2))",
        border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13,
        outline:"none", fontFamily:"inherit", transition:"border-color 0.2s", ...style }}
      onFocus={e => e.target.style.borderColor="#C5A47E"}
      onBlur={e => e.target.style.borderColor="var(--border)"}
      {...rest}
    />
  </div>
);

const Select = ({ value, onChange, children, style={}, ...rest }) => (
  <select value={value} onChange={onChange}
    style={{ padding:"9px 12px", background:"var(--input-bg, var(--surface2))", border:"1px solid var(--border)",
      borderRadius:8, color:"var(--text)", fontSize:13, outline:"none", fontFamily:"inherit", cursor:"pointer", ...style }}
    {...rest}>
    {children}
  </select>
);

const Modal = ({ open, onClose, title, children, width=540, closeOnBackdrop=true }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => closeOnBackdrop && e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16,
        width:"100%", maxWidth:width, maxHeight:"90vh", display:"flex", flexDirection:"column",
        backdropFilter:"blur(20px)", boxShadow:"0 25px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid var(--border)" }}>
          <span style={{ fontWeight:700, fontSize:16 }}>{title}</span>
          <Btn variant="ghost" size="sm" onClick={onClose} icon="x" style={{ padding:6 }}/>
        </div>
        <div style={{ overflowY:"auto", padding:20, flex:1 }}>{children}</div>
      </div>
    </div>
  );
};

const Divider = ({ style={} }) => <div style={{ height:1, background:"var(--border)", ...style }}/>;

const fmtCurrency = (v) => `R$ ${Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
const daysSince = (d) => Math.floor((new Date() - new Date(d + 'T12:00:00')) / 86400000);

Object.assign(window, { Icon, Badge, Avatar, Card, Btn, Input, Select, Modal, Divider,
  statusVariant, fmtCurrency, fmtDate, daysSince });
