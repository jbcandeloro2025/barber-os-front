
// Settings Component
const Settings = () => {
  const [tab, setTab] = React.useState("geral");
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [novoSrvOpen, setNovoSrvOpen] = React.useState(false);
  const [novoProfOpen, setNovoProfOpen] = React.useState(false);
  const [novoPlanOpen, setNovoPlanOpen] = React.useState(false);
  const [crudSaving, setCrudSaving] = React.useState(false);
  const [crudError, setCrudError] = React.useState(null);
  const [shopInfo, setShopInfo] = React.useState(null);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);
  const [wppStatus, setWppStatus] = React.useState({ loading: false, connected: false, message: "Consultando..." });
  const [form, setForm] = React.useState({
    nome:"",
    slug:"",
    whatsapp:"",
    endereco:"",
    descricao:"",
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  
  const slugify = (text) => {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Espaços por -
      .replace(/[^\w-]+/g, '')        // Remove caracteres especiais
      .replace(/--+/g, '-');          // Remove múltiplos -
  };

  const [servicos, setServicos] = React.useState([]);
  const [editSrv, setEditSrv] = React.useState(null);
  const [profList, setProfList] = React.useState([]);
  const [editProf, setEditProf] = React.useState(null);
  const [planos, setPlanos] = React.useState([]);
  const [editPlan, setEditPlan] = React.useState(null);
  const [usuarios, setUsuarios] = React.useState([]);
  const [editUser, setEditUser] = React.useState(null);
  const [novoUserOpen, setNovoUserOpen] = React.useState(false);

  // Carrega dados reais ao montar
  React.useEffect(() => {
    Promise.all([
      apiFetch("/services"),
      apiFetch("/professionals"),
      apiFetch("/plans"),
      apiFetch("/shops/me"),
      apiFetch("/users"),
      apiFetch("/auth/me"),
    ]).then(([sData, pData, plData, shopData, uData, meData]) => {
      if (meData?.user) {
        setPerfil(prev => ({ ...prev, nome: meData.user.name || "", email: meData.user.email || "", cargo: meData.user.role || "" }));
      }
      setServicos((sData.services || []).map(normalizeService));
      setProfList((pData.professionals || []).map((p, i) => normalizeProfessional(p, i)));
      setPlanos(plData.plans || []);
      setUsuarios(uData.users || []);
      if (shopData.shop) {
        const s = shopData.shop;
        setShopInfo(s);
        setForm({
          nome: s.name || "",
          slug: s.slug || "",
          whatsapp: s.config?.whatsapp || "",
          endereco: s.config?.endereco || "",
          descricao: s.config?.descricao || "",
        });
        if (s.config) {
          setBookingForm(prev => ({ ...prev, ...s.config }));
          if (s.config.integracoes) setIntegracoes(prev => ({ ...prev, ...s.config.integracoes }));
          if (s.config.integracoes?.whatsapp?.instance) handleCheckWppStatus();
          if (Array.isArray(s.config.operating_days)) setDiasAtivos(s.config.operating_days);
          if (Array.isArray(s.config.operating_hours)) {
            setHorasAbertura(s.config.operating_hours.map(h => h.open || "09:00"));
            setHorasFechamento(s.config.operating_hours.map(h => h.close || "20:00"));
          }
        }
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await apiFetch("/shops/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.nome,
          slug: form.slug,
          config: {
            whatsapp: form.whatsapp,
            endereco: form.endereco,
            descricao: form.descricao,
            operating_days: diasAtivos,
            operating_hours: diasSemana.map((_, i) => ({ open: horasAbertura[i], close: horasFechamento[i] })),
            ...bookingForm,
            integracoes,
          },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePerfil = async () => {
    setPerfilSaving(true); setPerfilMsg(null);
    try {
      const body = {};
      if (perfil.nome)  body.name  = perfil.nome;
      if (perfil.email) body.email = perfil.email;
      if (perfil.senha) body.password = perfil.senha;
      await apiFetch("/auth/me", { method: "PATCH", body: JSON.stringify(body) });
      setPerfilMsg({ type: "success", text: "Perfil salvo com sucesso!" });
      setPerfil(prev => ({ ...prev, senha: "" }));
      setTimeout(() => setPerfilMsg(null), 3000);
    } catch(e) {
      setPerfilMsg({ type: "error", text: e.message || "Erro ao salvar perfil" });
    } finally {
      setPerfilSaving(false);
    }
  };

  const handleStripeCheckout = async (priceId) => {
    setCheckoutLoading(true);
    try {
      const data = await apiFetch("/subscriptions/checkout", {
        method: "POST",
        body: { priceId }
      });
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (e) {
      alert(e.message || "Erro ao iniciar checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleStripePortal = async () => {
    setCheckoutLoading(true);
    try {
      const data = await apiFetch("/subscriptions/portal", { method: "POST" });
      if (data.portalUrl) window.location.href = data.portalUrl;
    } catch (e) {
      alert(e.message || "Erro ao abrir portal de faturamento");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckWppStatus = async () => {
    setWppStatus(prev => ({ ...prev, loading: true }));
    try {
      const data = await apiFetch("/whatsapp/status");
      setWppStatus({ loading: false, connected: data.connected, message: data.message });
    } catch (e) {
      setWppStatus({ loading: false, connected: false, message: "Erro na conexão" });
    }
  };

  const handleWppLogout = async () => {
    if (!confirm("Deseja realmente desconectar o WhatsApp?")) return;
    setWppStatus(prev => ({ ...prev, loading: true }));
    try {
      await apiFetch("/whatsapp/logout", { method: "POST" });
      handleCheckWppStatus();
    } catch (e) {
      alert("Erro ao desconectar");
      setWppStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const tabs = [
    {id:"geral",label:"Geral",icon:"settings"},
    {id:"horarios",label:"Horários",icon:"clock"},
    {id:"servicos",label:"Serviços",icon:"scissors"},
    {id:"profissionais",label:"Profissionais",icon:"users"},
    {id:"usuarios",label:"Usuários & Permissões",icon:"shield"},
    {id:"galeria",label:"Galeria",icon:"image"},
    {id:"integracoes",label:"Integrações",icon:"layers"},
    {id:"perfil",label:"Meu Perfil",icon:"user"},
    {id:"fidelidade",label:"Fidelidade",icon:"award"},
    {id:"planos",label:"Planos Mensais",icon:"package"},
    {id:"booking",label:"Página de Agendamento",icon:"layout-grid"},
    {id:"assinatura",label:"Assinatura BarberOS",icon:"credit-card"},
  ];

  const [fidelidade, setFidelidade] = React.useState({
    ativa: true,
    meta: 10,
    premio: "Corte Grátis",
    validade: 12
  });

  const setFid = (k,v) => setFidelidade(p=>({...p,[k]:v}));

  const [perfil, setPerfil] = React.useState({ nome: "", email: "", senha: "", cargo: "" });
  const [perfilSaving, setPerfilSaving] = React.useState(false);
  const [perfilMsg, setPerfilMsg] = React.useState(null);

  const setPerf = (k,v) => setPerfil(p=>({...p,[k]:v}));

  const [integracoes, setIntegracoes] = React.useState({
    evo_instancia: "barber_rafael",
    evo_token: "••••••••••••••••••••",
    evo_url: "https://api.evolution.io",
    stripe_key: "pk_test_••••••••••••••••",
    pix_key: "rafael@pix.com.br"
  });

  const setInt = (k,v) => setIntegracoes(p=>({...p,[k]:v}));

  const [bookingForm, setBookingForm] = React.useState({
    banner: "barber_shop_header_mockup_1777570601706.png",
    logo: "",
    instagram: "@studio.rafael",
    facebook: "studio.rafael",
    tiktok: "studio.rafael",
    whatsapp: "5511987654321",
    primaryColor: "#F97316",
    descricao: "Desde 2014. Barba, Cabelo e Cervejas Especiais.",
    bgType: "gradient",
    bgDirection: "to top",
    bgColor: "#0F1115",
    bgGradient: "#30100a",
    footerBanner: ""
  });

  const setBook = (k,v) => setBookingForm(p=>({...p,[k]:v}));

  const diasSemana = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  const [diasAtivos, setDiasAtivos] = React.useState([0,1,2,3,4,5]);
  const toggleDia = (i) => setDiasAtivos(p=>p.includes(i)?p.filter(d=>d!==i):[...p,i].sort());
  const [horasAbertura, setHorasAbertura] = React.useState(["09:00","09:00","09:00","09:00","09:00","09:00","09:00"]);
  const [horasFechamento, setHorasFechamento] = React.useState(["20:00","20:00","20:00","20:00","20:00","18:00","14:00"]);
  const setHora = (tipo, idx, val) => {
    if (tipo === "abertura") setHorasAbertura(p => p.map((h, i) => i === idx ? val : h));
    else setHorasFechamento(p => p.map((h, i) => i === idx ? val : h));
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden",position:"relative"}}>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:150,backdropFilter:"blur(4px)"}}/>
      )}

      {/* Mobile tab selector strip (shown when sidebar closed on mobile) */}
      {isMobile && !sidebarOpen && (
        <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,background:"var(--surface)",
          borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10,padding:"10px 16px"}}>
          <button onClick={()=>setSidebarOpen(true)}
            style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",
              cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:"var(--muted)",fontSize:12,fontFamily:"inherit"}}>
            <Icon name="menu" size={15} color="var(--muted)"/>
            Menu
          </button>
          <span style={{fontSize:13,fontWeight:700,color:"#C5A47E"}}>{tabs.find(t=>t.id===tab)?.label}</span>
        </div>
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? 240 : 200,
        borderRight:"1px solid var(--border)",
        padding:"20px 0",
        flexShrink:0,
        overflowY:"auto",
        ...(isMobile ? {
          position:"fixed",
          top:0,bottom:0,left:0,
          zIndex:160,
          background:"var(--surface)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          paddingTop:56,
        } : {})
      }}>
        <div style={{padding:"0 16px",marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Configurações</div>
        </div>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSidebarOpen(false);}}
            style={{width:"100%",padding:"10px 16px",border:"none",background:tab===t.id?"rgba(197,164,126,0.12)":"transparent",
              cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:10,
              color:tab===t.id?"#C5A47E":"var(--muted)",fontSize:13,fontWeight:tab===t.id?600:400,
              borderRight:tab===t.id?"2px solid #C5A47E":"2px solid transparent",transition:"all 0.15s",textAlign:"left"}}>
            <Icon name={t.icon} size={15} color={tab===t.id?"#C5A47E":"var(--muted2)"}/>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80, paddingTop: isMobile ? 50 : 0 }}>
        <div style={{ 
          maxWidth: ["servicos", "profissionais", "usuarios", "galeria", "planos", "booking", "assinatura"].includes(tab) ? "none" : 800, 
          margin: ["servicos", "profissionais", "usuarios", "galeria", "planos", "booking", "assinatura"].includes(tab) ? "0" : "0 auto",
          width: "100%" 
        }}>
          {tab === "geral" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Dados do Estabelecimento</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Configure as informações públicas da sua barbearia</p>

              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, padding: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <div style={{ width: 72, height: 72, borderRadius: 12, background: "rgba(197,164,126,0.15)", border: "2px dashed #C5A47E44",
                  display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                  <Icon name="scissors" size={24} color="#C5A47E" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Logo do estabelecimento</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>PNG ou SVG recomendado. Máx 2MB.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="secondary" size="sm" icon="upload">Upload Logo</Btn>
                    <Btn variant="ghost" size="sm">Remover</Btn>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { k: "nome", label: "Nome do Estabelecimento", placeholder: "Ex: Barbearia Studio Rafael" },
                  { k: "slug", label: "Slug de Agendamento", placeholder: "minha-barbearia", prefix: (import.meta.env.VITE_BOOKING_BASE_URL || "barberos.app").replace(/^https?:\/\//, "") + "/" },
                  { k: "whatsapp", label: "WhatsApp", placeholder: "(11) 99999-9999" },
                  { k: "endereco", label: "Endereço completo", placeholder: "Rua, número — Bairro, Cidade" },
                ].map(({ k, label, placeholder, prefix }) => (
                  <div key={k}>
                    <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 7 }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {prefix && <span style={{ padding: "9px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 12, color: "var(--muted2)" }}>{prefix}</span>}
                      <input 
                        value={form[k]} 
                        onChange={e => {
                          const val = e.target.value;
                          set(k, val);
                          if (k === "nome") set("slug", slugify(val));
                        }} 
                        placeholder={placeholder}
                        style={{ flex: 1, padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)",
                          borderRadius: prefix ? "0 8px 8px 0" : 8, color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                        onFocus={e => e.target.style.borderColor = "#C5A47E"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"} />
                    </div>
                    {k === "slug" && form.slug && (
                      <div style={{ marginTop: 8, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon name="external-link" size={12} color="#C5A47E" />
                        <span style={{ color: "var(--muted)" }}>Link para clientes: </span>
                        <a href={`${import.meta.env.VITE_BOOKING_BASE_URL || "https://barberos.app"}/${form.slug}`} target="_blank" rel="noreferrer" 
                          style={{ color: "#C5A47E", fontWeight: 700, textDecoration: "none", borderBottom: "1px solid transparent" }}
                          onMouseEnter={e => e.target.style.borderBottomColor = "#C5A47E" }
                          onMouseLeave={e => e.target.style.borderBottomColor = "transparent" }>
                          {(import.meta.env.VITE_BOOKING_BASE_URL || "barberos.app").replace(/^https?:\/\//, "")}/{form.slug}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 7 }}>Descrição</label>
                  <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3}
                    style={{ width: "100%", padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8,
                      color: "var(--text)", fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = "#C5A47E"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"} />
                </div>
              </div>
            </div>
          )}

          {tab === "horarios" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Horários de Funcionamento</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Defina os dias e horários de atendimento</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {diasSemana.map((dia, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
                    background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10 }}>
                    <input type="checkbox" checked={diasAtivos.includes(i)} onChange={() => toggleDia(i)}
                      style={{ accentColor: "#C5A47E", width: 16, height: 16, cursor: "pointer" }} />
                    <span style={{ width: 80, fontSize: 13, fontWeight: 600, color: diasAtivos.includes(i) ? "var(--text)" : "var(--muted)" }}>{dia}</span>
                    {diasAtivos.includes(i) ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Select style={{ minWidth: 90 }} value={horasAbertura[i]} onChange={e => setHora("abertura", i, e.target.value)}>
                          {["07:00","08:00","09:00","10:00","11:00"].map(h => <option key={h}>{h}</option>)}
                        </Select>
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>até</span>
                        <Select style={{ minWidth: 90 }} value={horasFechamento[i]} onChange={e => setHora("fechamento", i, e.target.value)}>
                          {["12:00","14:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"].map(h => <option key={h}>{h}</option>)}
                        </Select>
                      </div>
                    ) : <span style={{ fontSize: 12, color: "var(--muted)" }}>Fechado</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "servicos" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Catálogo de Serviços</h2>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>{servicos.length} serviços cadastrados</p>
                </div>
                <Btn variant="primary" icon="plus" onClick={() => { setCrudError(null); setEditSrv(null); setNovoSrvOpen(true); }}>Novo Serviço</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {servicos.map(s => (
                  <Card key={s.id} style={{ padding: 16, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ background: "rgba(197,164,126,0.12)", border: "1px solid rgba(197,164,126,0.2)", borderRadius: 8, padding: 8 }}>
                        <Icon name="scissors" size={16} color="#C5A47E" />
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="ghost" size="sm" style={{ padding: 4 }} onClick={() => { setCrudError(null); setEditSrv(s); setNovoSrvOpen(true); }}><Icon name="edit" size={13} color="var(--muted)" /></Btn>
                        <Btn variant="ghost" size="sm" style={{ padding: 4 }} onClick={async () => { if(!confirm(`Excluir "${s.titulo}"?`)) return; try { await apiFetch(`/services/${s.id}`, { method:"DELETE" }); setServicos(p => p.filter(x => x.id !== s.id)); } catch(e) { alert(e.message); } }}><Icon name="trash" size={13} color="#EF4444" /></Btn>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.titulo}</div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{s.categoria} · {s.tempo} min</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 11, color: "var(--muted2)", fontWeight: 500 }}>Preço</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#C5A47E" }}>{fmtCurrency(s.preco)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "profissionais" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Profissionais</h2>
                <Btn variant="primary" icon="user-plus" onClick={() => { setCrudError(null); setEditProf(null); setNovoProfOpen(true); }}>Novo Profissional</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {profList.map(p => (
                  <Card key={p.id} style={{ padding: 18 }}>
                    <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                      <Avatar initials={p.avatar} size={48} color={p.cor} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.nome}</div>
                        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{p.bio}</div>
                      </div>
                      <div style={{ display:"flex", gap:4, alignSelf:"flex-start" }}>
                        <Btn variant="ghost" size="sm" style={{ padding: 5 }} onClick={() => { setCrudError(null); setEditProf(p); setNovoProfOpen(true); }}><Icon name="edit" size={13} color="var(--muted)" /></Btn>
                        <Btn variant="ghost" size="sm" style={{ padding: 5 }} onClick={async () => { if(!confirm(`Excluir "${p.nome}"?`)) return; try { await apiFetch(`/professionals/${p.id}`, { method:"DELETE" }); setProfList(prev => prev.filter(x => x.id !== p.id)); } catch(e) { alert(e.message); } }}><Icon name="trash" size={13} color="#EF4444" /></Btn>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                      {p.especialidades.map(e => <Badge key={e} variant="muted">{e}</Badge>)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px",
                      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Comissão</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#C5A47E" }}>{p.comissao}%</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "usuarios" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Equipe & Permissões</h2>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>Gerencie quem tem acesso ao painel e seus níveis de permissão</p>
                </div>
                <Btn variant="primary" icon="user-plus" onClick={() => { setCrudError(null); setEditUser(null); setNovoUserOpen(true); }}>Novo Usuário</Btn>
              </div>

              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div className="table-container"><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr style={{ background: "var(--surface2)" }}>
                      {["Usuário", "E-mail", "Nível de Acesso", "Criado em", "Ações"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => {
                      const initials = u.name.split(" ").map(w => w[0]).join("").substring(0,2).toUpperCase();
                      const roleVariant = u.role === 'ADMIN' ? "info" : u.role === 'ATENDENTE' ? "warning" : "default";
                      return (
                        <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar initials={initials} size={32} color="var(--primary)" />
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--muted)" }}>{u.email}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <Badge variant={roleVariant}>{u.role}</Badge>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--muted)" }}>{fmtDate(u.created_at?.split("T")[0] || "")}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display:"flex", gap:6 }}>
                              <Btn variant="ghost" size="sm" icon="edit" onClick={() => { setCrudError(null); setEditUser(u); setNovoUserOpen(true); }}/>
                              <Btn variant="ghost" size="sm" icon="trash" onClick={async () => { if(!confirm(`Excluir "${u.name}"?`)) return; try { await apiFetch(`/users/${u.id}`, { method:"DELETE" }); setUsuarios(p => p.filter(x => x.id !== u.id)); } catch(e) { alert(e.message); } }} style={{ color:"#EF4444" }}/>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {usuarios.length === 0 && (
                      <tr><td colSpan={5} style={{ padding:"32px 16px", textAlign:"center", color:"var(--muted)", fontSize:13 }}>Nenhum usuário cadastrado</td></tr>
                    )}
                  </tbody>
                </table></div>
              </Card>

              <div style={{ marginTop: 24, padding: 20, background: "rgba(197,164,126,0.05)", border: "1px solid rgba(197,164,126,0.1)", borderRadius: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="shield" size={16} color="var(--primary)" /> Entendendo os Níveis
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Admin</div>
                    <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>Acesso total ao sistema, financeiro, estoque e configurações SaaS.</p>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Atendente</div>
                    <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>Gerencia agenda de todos, faz checkouts e cadastra clientes.</p>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Profissional</div>
                    <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>Visualiza apenas sua própria agenda e realiza seus atendimentos.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "galeria" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Galeria do Estabelecimento</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Fotos que aparecem na página de agendamento</p>
              <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: "32px 24px", textAlign: "center", marginBottom: 20, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#C5A47E44"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                <Icon name="upload" size={32} color="var(--muted2)" />
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Arraste fotos aqui</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>JPG, PNG até 5MB por foto</div>
                <Btn variant="secondary" icon="upload">Selecionar Fotos</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "1", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.querySelector('.del').style.opacity = "1" }}
                    onMouseLeave={e => { e.currentTarget.querySelector('.del').style.opacity = "0" }}>
                    <Icon name="image" size={28} color="var(--border)" />
                    <div className="del" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}>
                      <Icon name="trash" size={18} color="#EF4444" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "integracoes" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Integrações de System</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Conecte ferramentas externas para automatizar seu negócio</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ width: 48, height: 48, background: "rgba(37,211,102,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="whatsapp" size={24} color="#25D366" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>WhatsApp (Evolution API)</h3>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>Envio automático de lembretes e confirmações</p>
                      </div>
                    </div>
                    <Badge 
                      variant={wppStatus.connected ? "success" : "danger"} 
                      style={{ minWidth: 80, textAlign: "center" }}
                    >
                      {wppStatus.loading ? "Verificando..." : wppStatus.message || "Desconectado"}
                    </Badge>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Instância</label>
                      <Input value={integracoes.whatsapp?.instance || ""} onChange={e => setIntegracoes({ ...integracoes, whatsapp: { ...integracoes.whatsapp, instance: e.target.value } })} placeholder="Nome da instância" />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>API Token</label>
                      <Input value={integracoes.whatsapp?.token || ""} onChange={e => setIntegracoes({ ...integracoes, whatsapp: { ...integracoes.whatsapp, token: e.target.value } })} type="password" placeholder="Token de acesso" />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn 
                      variant="secondary" 
                      size="sm" 
                      icon={wppStatus.loading ? "refresh" : "zap"} 
                      onClick={handleCheckWppStatus}
                      disabled={wppStatus.loading || !integracoes.whatsapp?.instance}
                    >
                      {wppStatus.loading ? "Testando..." : "Testar Conexão"}
                    </Btn>
                    {wppStatus.connected && (
                      <Btn 
                        variant="ghost" 
                        size="sm" 
                        style={{ color: "#EF4444" }} 
                        onClick={handleWppLogout}
                        disabled={wppStatus.loading}
                      >
                        Desconectar
                      </Btn>
                    )}
                  </div>
                </Card>

                <Card style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ width: 48, height: 48, background: "rgba(197,164,126,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="credit-card" size={24} color="#C5A47E" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Métodos de Pagamento</h3>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>Configure como você deseja receber dos clientes</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Chave Pix</label>
                      <Input value={integracoes.pix_key} onChange={e => setInt("pix_key", e.target.value)} placeholder="Chave Pix" icon="dollar-sign" />
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 600 }}>Cartão de Crédito (Stripe)</label>
                        <button style={{ fontSize: 11, color: "#C5A47E", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Como configurar?</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Input value={integracoes.stripe_key} onChange={e => setInt("stripe_key", e.target.value)} placeholder="pk_test_..." />
                        <Btn variant="secondary" size="sm" style={{ width: "fit-content" }}>Vincular conta Stripe</Btn>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "perfil" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Meu Perfil</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Gerencie suas informações pessoais e credenciais de acesso</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 20, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 12 }}>
                  <Avatar initials={perfil.nome ? perfil.nome.split(" ").map(w=>w[0]).join("").substring(0,2).toUpperCase() : "?"} size={80} color="#C5A47E" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{perfil.nome || "—"}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{perfil.cargo}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{perfil.email}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nome Completo</label>
                    <Input value={perfil.nome} onChange={e => setPerfil(p=>({...p,nome:e.target.value}))} icon="user" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>E-mail</label>
                    <Input value={perfil.email} onChange={e => setPerfil(p=>({...p,email:e.target.value}))} type="email" icon="message-circle" />
                  </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="settings" size={16} color="var(--primary)" />
                    Alterar Senha
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nova Senha (deixe em branco para não alterar)</label>
                      <Input value={perfil.senha} onChange={e => setPerfil(p=>({...p,senha:e.target.value}))} type="password" placeholder="Mínimo 6 caracteres" icon="lock" />
                    </div>
                  </div>
                </div>

                {perfilMsg && (
                  <div style={{ fontSize:13, color: perfilMsg.type==="success"?"#10B981":"#EF4444", fontWeight:600 }}>
                    {perfilMsg.type==="success"?"✓":"✗"} {perfilMsg.text}
                  </div>
                )}

                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <Btn variant="primary" icon="check" onClick={handleSavePerfil} disabled={perfilSaving}>
                    {perfilSaving ? "Salvando..." : "Salvar Perfil"}
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "planos" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Planos Mensais (Assinaturas)</h2>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>Gerencie pacotes de serviços recorrentes e assinaturas de clientes</p>
                </div>
                <Btn variant="primary" icon="plus" onClick={() => { setCrudError(null); setEditPlan(null); setNovoPlanOpen(true); }}>Novo Plano</Btn>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                {planos.length === 0 && (
                  <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:"32px 0", gridColumn:"1/-1" }}>Nenhum plano cadastrado ainda</div>
                )}
                {planos.map(p => (
                  <Card key={p.id} style={{ padding: 24, border: "1px solid var(--border)", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ background: "rgba(197,164,126,0.12)", border: "1px solid rgba(197,164,126,0.2)", borderRadius: 12, padding: 12 }}>
                        <Icon name="package" size={20} color="#C5A47E" />
                      </div>
                      <Badge variant="muted">{p.duration_id || "mensal"}</Badge>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>

                    <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, border: "1px solid var(--border)" }}>
                       <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.05em" }}>Benefícios</div>
                       <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                         {(p.benefits || []).map((b, i) => (
                           <Badge key={i} variant="secondary" style={{ fontSize: 10, padding: "4px 8px" }}>{b}</Badge>
                         ))}
                       </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                       <div>
                         <span style={{ fontSize: 11, color: "var(--muted2)", display: "block", marginBottom: 4 }}>Valor</span>
                         <span style={{ fontSize: 24, fontWeight: 800, color: "#C5A47E" }}>{fmtCurrency(Number(p.price))}</span>
                       </div>
                       <div style={{ display: "flex", gap: 6 }}>
                         <Btn variant="ghost" size="sm" style={{ padding: 8, borderRadius: 8 }} onClick={() => { setCrudError(null); setEditPlan(p); setNovoPlanOpen(true); }}><Icon name="edit" size={14} color="var(--muted)" /></Btn>
                         <Btn variant="ghost" size="sm" style={{ padding: 8, borderRadius: 8 }} onClick={async () => { if(!confirm(`Excluir "${p.name}"?`)) return; try { await apiFetch(`/plans/${p.id}`, { method:"DELETE" }); setPlanos(prev => prev.filter(x => x.id !== p.id)); } catch(e) { alert(e.message); } }}><Icon name="trash" size={14} color="#EF4444" /></Btn>
                       </div>
                    </div>
                  </Card>
                ))}
                
                {/* Empty State / Add New Hint */}
                <div style={{ border: "2px dashed var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 12, cursor: "pointer", minHeight: 280 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#C5A47E"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="plus" size={20} color="var(--muted2)" />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Criar novo plano</div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Adicione mais opções de pacotes</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "booking" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Customização da Página de Agendamento</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Personalize a aparência da sua página pública onde os clientes marcam horários</p>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: isMobile ? 24 : 40 }}>
                {/* Editor */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Banner */}
                  <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Banner da Página</label>
                    <div style={{ width: "100%", height: 120, background: "var(--surface)", borderRadius: 8, overflow: "hidden", position: "relative", marginBottom: 12 }}>
                      <img src={bookingForm.banner} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Btn variant="secondary" size="sm" icon="upload">Alterar Banner</Btn>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--muted2)" }}>Recomendado: 1200x400px. JPG ou PNG.</p>
                  </div>

                  {/* Logo e Tema */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Logo Público</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="scissors" size={20} color="var(--primary)" />
                        </div>
                        <Btn variant="secondary" size="sm">Upload</Btn>
                      </div>
                    </div>
                    <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cor do Tema</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="color" value={bookingForm.primaryColor} onChange={e => setBook("primaryColor", e.target.value)}
                          style={{ width: 36, height: 36, border: "none", borderRadius: 8, background: "none", cursor: "pointer" }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{bookingForm.primaryColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição e Redes */}
                  <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Conteúdo e Redes Sociais</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 7 }}>Slogan / Frase de destaque</label>
                        <textarea value={bookingForm.descricao} onChange={e => setBook("descricao", e.target.value)} rows={2}
                          placeholder="Ex: Barba, Cabelo e Cervejas Especiais"
                          style={{ width: "100%", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                            color: "var(--text)", fontSize: 13, resize: "none", outline: "none", fontFamily: "inherit" }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                        <Input icon="instagram" placeholder="Insta" value={bookingForm.instagram} onChange={e => setBook("instagram", e.target.value)} />
                        <Input icon="facebook" placeholder="FB" value={bookingForm.facebook} onChange={e => setBook("facebook", e.target.value)} />
                        <Input icon="tiktok" placeholder="TikTok" value={bookingForm.tiktok} onChange={e => setBook("tiktok", e.target.value)} />
                      </div>
                      <Input icon="whatsapp" placeholder="WhatsApp (55...)" value={bookingForm.whatsapp} onChange={e => setBook("whatsapp", e.target.value)} />
                    </div>
                  </div>

                  {/* Fundo da Página */}
                  <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Fundo da Página</label>
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      {["solid", "gradient"].map(t => (
                        <button key={t} onClick={() => setBook("bgType", t)}
                          style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: 600,
                            background: bookingForm.bgType === t ? "var(--primaryBg)" : "var(--surface)",
                            borderColor: bookingForm.bgType === t ? "var(--primary)" : "var(--border)",
                            color: bookingForm.bgType === t ? "var(--primary)" : "var(--muted)" }}>
                          {t === "solid" ? "Cor Sólida" : "Degradê"}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "var(--muted2)", display: "block", marginBottom: 6 }}>{bookingForm.bgType === "solid" ? "Cor do Fundo" : "Cor 1"}</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input type="color" value={bookingForm.bgColor} onChange={e => setBook("bgColor", e.target.value)}
                            style={{ width: 32, height: 32, border: "none", borderRadius: 6, background: "none", cursor: "pointer" }} />
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{bookingForm.bgColor.toUpperCase()}</span>
                        </div>
                      </div>
                      {bookingForm.bgType === "gradient" && (
                        <>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: "var(--muted2)", display: "block", marginBottom: 6 }}>Cor 2</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input type="color" value={bookingForm.bgGradient} onChange={e => setBook("bgGradient", e.target.value)}
                                style={{ width: 32, height: 32, border: "none", borderRadius: 6, background: "none", cursor: "pointer" }} />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{bookingForm.bgGradient.toUpperCase()}</span>
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 11, color: "var(--muted2)", display: "block", marginBottom: 6 }}>Orientação</label>
                            <Select value={bookingForm.bgDirection} onChange={e => setBook("bgDirection", e.target.value)} style={{ width: "100%", height: 32, padding: "0 8px", fontSize: 11 }}>
                              <option value="to top">Vertical (Invertido)</option>
                              <option value="to bottom">Vertical (Padrão)</option>
                              <option value="to right">Horizontal</option>
                              <option value="45deg">Diagonal</option>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Banner de Rodapé */}
                  <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px solid var(--border)" }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Banner de Rodapé (Footer)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ width: 100, height: 50, background: "var(--surface)", borderRadius: 6, border: "1px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {bookingForm.footerBanner ? <img src={bookingForm.footerBanner} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="image" size={16} color="var(--muted2)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>Imagem que aparece no final da página (ex: logo dos parceiros ou foto da equipe).</p>
                        <Btn variant="secondary" size="sm" icon="upload">Upload Footer</Btn>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Mobile */}
                <div style={{ position: "sticky", top: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Pré-visualização Mobile</label>
                  <div style={{ width: 280, height: 560, borderRadius: 32, border: "8px solid #222", overflow: "hidden", position: "relative", margin: "0 auto", boxShadow: "0 20px 50px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column",
                    background: bookingForm.bgType === "solid" ? bookingForm.bgColor : `linear-gradient(${bookingForm.bgDirection}, ${bookingForm.bgGradient}, ${bookingForm.bgColor})` }}>
                    
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      {/* Mock Header */}
                      <div style={{ height: 120, position: "relative" }}>
                        <img src={bookingForm.banner} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                        <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)" }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#111", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="scissors" size={18} color="#fff" />
                          </div>
                        </div>
                      </div>
                      {/* Mock Content */}
                      <div style={{ paddingTop: 30, padding: 20, textAlign: "center" }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Studio Rafael</div>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 4, lineHeight: 1.4 }}>{bookingForm.descricao}</p>
                        
                        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                           {bookingForm.instagram && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="instagram" size={10} color="#fff" /></div>}
                           {bookingForm.facebook && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="facebook" size={10} color="#fff" /></div>}
                           {bookingForm.tiktok && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="tiktok" size={10} color="#fff" /></div>}
                        </div>
                        
                        <div style={{ marginTop: 20, padding: 10, background: `${bookingForm.primaryColor}15`, border: `1px solid ${bookingForm.primaryColor}`, borderRadius: 10, textAlign: "left" }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: bookingForm.primaryColor }}>Corte Masculino</div>
                          <div style={{ fontSize: 10, fontWeight: 800, marginTop: 2, color: "#fff" }}>R$ 45,00</div>
                        </div>
                      </div>
                    </div>

                    {/* Mock Footer Banner */}
                    {bookingForm.footerBanner && (
                      <div style={{ height: 60, width: "100%", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={bookingForm.footerBanner} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    
                    <div style={{ marginTop: 80, height: 44, width: "100%", background: bookingForm.primaryColor, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000", boxShadow: `0 8px 20px ${bookingForm.primaryColor}33` }}>
                      Agendar Horário
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "fidelidade" && (
            <div style={{ padding: isMobile ? "68px 16px 24px" : "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Configuração do Programa de Fidelidade</h2>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Defina as regras para premiar seus clientes frequentes</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Status */}
                <Card style={{ padding: 20, background: fidelidade.ativa ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)", border: fidelidade.ativa ? "1px solid rgba(16,185,129,0.1)" : "1px solid rgba(239,68,68,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, background: fidelidade.ativa ? "#10B981" : "#EF4444", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="award" size={20} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Status do Programa</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{fidelidade.ativa ? "Ativo e visível para os clientes" : "Desativado temporariamente"}</div>
                      </div>
                    </div>
                    <button onClick={() => setFid("ativa", !fidelidade.ativa)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: fidelidade.ativa ? "#EF4444" : "#10B981", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {fidelidade.ativa ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </Card>

                {/* Rules */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Meta de Pontos</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Input type="number" value={fidelidade.meta} onChange={e => setFid("meta", e.target.value)} style={{ flex: 1 }} />
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>visitas</span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6 }}>Quantos agendamentos concluídos para ganhar o prêmio.</p>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Validade dos Pontos</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Input type="number" value={fidelidade.validade} onChange={e => setFid("validade", e.target.value)} style={{ flex: 1 }} />
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>meses</span>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6 }}>Tempo para os pontos expirarem após a última visita.</p>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Descrição do Prêmio</label>
                  <Input value={fidelidade.premio} onChange={e => setFid("premio", e.target.value)} placeholder="Ex: Corte de Cabelo Grátis" icon="award" />
                  <p style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6 }}>Este texto aparecerá no cartão fidelidade do cliente no CRM.</p>
                </div>

                <Divider />

                {/* Preview */}
                <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 12, border: "1px dashed var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>Pré-visualização do Cartão</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
                    {Array.from({ length: fidelidade.meta }).map((_, i) => (
                      <div key={i} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid var(--border)", background: i < 3 ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {i < 3 && <Icon name="check" size={12} color="#000" />}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
                    Ao completar {fidelidade.meta} visitas, ganhe {fidelidade.premio}!
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "assinatura" && (() => {
            const nextBilling = new Date();
            nextBilling.setMonth(nextBilling.getMonth() + 1);
            
            const status = shopInfo?.subscription_status || "TRIALING";
            const isTrial = status === "TRIALING";
            const isActive = status === "ACTIVE";

            return (
              <div style={{ padding: "28px 32px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Minha Assinatura BarberOS</h2>
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Gerencie seu plano de uso da plataforma e faturamento</p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 24, alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Card style={{ padding: 24, background: "linear-gradient(135deg, var(--surface2), var(--surface))", border: isTrial ? "1px solid var(--primary)66" : "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <Badge variant={isActive ? "success" : isTrial ? "warning" : "danger"}>
                              {isActive ? "Plano Ativo" : isTrial ? "Período de Teste" : "Assinatura Suspensa"}
                            </Badge>
                            {isActive && <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700 }}>● Pagamento em dia</span>}
                          </div>
                          <h3 style={{ fontSize: 24, fontWeight: 800 }}>BarberOS Pro</h3>
                          <p style={{ color: "var(--muted)", fontSize: 14 }}>Ciclo de faturamento mensal</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>R$ 149,90</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{isActive ? `Próxima fatura: ${nextBilling.toLocaleDateString('pt-BR')}` : "Plano mensal padrão"}</div>
                        </div>
                      </div>

                      {(!isActive || isTrial) && (
                        <div style={{ marginBottom: 24, padding: 16, background: "rgba(197,164,126,0.1)", borderRadius: 10, border: "1px solid rgba(197,164,126,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{isTrial ? "Seu período de teste está ativo!" : "Sua assinatura não está ativa."}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>Profissionalize sua gestão com o plano Pro completo.</div>
                          </div>
                          <Btn variant="primary" size="sm" icon="zap" onClick={() => handleStripeCheckout("price_pro_mensal")} disabled={checkoutLoading}>
                            {checkoutLoading ? "Carregando..." : "Assinar Agora"}
                          </Btn>
                        </div>
                      )}

                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Espaço em Disco</div>
                          <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 6 }}>
                            <div style={{ width: "12%", height: "100%", background: "var(--primary)", borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>0.2 GB / 10 GB</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Profissionais</div>
                          <div style={{ width: "100%", height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 6 }}>
                            <div style={{ width: `${(profList.length / 10) * 100}%`, height: "100%", background: "var(--success)", borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{profList.length} / 10 ativos</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Agendamentos</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", marginTop: 12 }}>ILIMITADOS</div>
                        </div>
                      </div>
                    </Card>

                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Histórico de Pagamentos</h3>
                    <Card style={{ padding: 0, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "var(--surface2)" }}>
                             <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Data</th>
                             <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Valor</th>
                             <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Status</th>
                             <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>Recibo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {isActive ? (
                            <tr style={{ borderTop: "1px solid var(--border)" }}>
                              <td style={{ padding: "12px 16px", fontSize: 13 }}>Hoje</td>
                              <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>R$ 149,90</td>
                              <td style={{ padding: "12px 16px" }}><Badge variant="success">Pago</Badge></td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}><Btn variant="ghost" size="sm" icon="download" /></td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--muted2)", fontSize: 13 }}>Nenhum pagamento registrado</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </Card>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Card style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Método de Pagamento</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16 }}>
                        <Icon name="credit-card" size={20} color={isActive ? "var(--primary)" : "var(--muted2)"} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{isActive ? "•••• •••• •••• 4242" : "Nenhum cartão"}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{isActive ? "Cartão de Crédito (Visa)" : "Cadastre para assinar"}</div>
                        </div>
                      </div>
                      <Btn variant="secondary" size="sm" style={{ width: "100%" }} onClick={handleStripePortal} disabled={checkoutLoading || !shopInfo?.stripe_customer_id}>
                        {checkoutLoading ? "Carregando..." : isActive ? "Gerenciar Pagamento" : "Adicionar Cartão"}
                      </Btn>
                    </Card>

                    <Card style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Suporte Prioritário</h4>
                      <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>Como assinante Pro, você tem acesso ao suporte via WhatsApp 24/7.</p>
                      <Btn variant="secondary" size="sm" icon="whatsapp" style={{ width: "100%" }}>Falar com Suporte</Btn>
                    </Card>

                    <Card style={{ padding: 20, background: "rgba(239,68,68,0.02)" }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "#EF4444" }}>Zona de Perigo</h4>
                      <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>Ao cancelar, sua barbearia ficará offline após o período pago.</p>
                      <button style={{ width: "100%", padding: "8px", background: "none", border: "1px solid #EF444444", borderRadius: 8, color: "#EF4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Cancelar Assinatura</button>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal: Novo Serviço */}
      <Modal open={novoSrvOpen} onClose={() => { setNovoSrvOpen(false); setEditSrv(null); }} title={editSrv ? "Editar Serviço" : "Novo Serviço"} width={400} closeOnBackdrop={false}>
        <form onSubmit={async e => {
          e.preventDefault();
          const fd = new FormData(e.target);
          setCrudSaving(true); setCrudError(null);
          try {
            const body = {
              title: fd.get("title"),
              price: Number(fd.get("price")),
              duration: Number(fd.get("duration")),
              description: fd.get("description") || undefined,
            };
            if (editSrv) {
              const data = await apiFetch(`/services/${editSrv.id}`, { method: "PUT", body: JSON.stringify(body) });
              setServicos(p => p.map(x => x.id === editSrv.id ? normalizeService(data.service) : x));
            } else {
              const data = await apiFetch("/services", { method: "POST", body: JSON.stringify(body) });
              setServicos(p => [...p, normalizeService(data.service)]);
            }
            setNovoSrvOpen(false); setEditSrv(null);
          } catch(err) { setCrudError(err.message); }
          finally { setCrudSaving(false); }
        }} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome do Serviço</label>
            <Input name="title" required placeholder="Ex: Corte Masculino" defaultValue={editSrv?.titulo || ""}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Preço (R$)</label>
              <Input name="price" type="number" step="0.01" min="0" required placeholder="0,00" defaultValue={editSrv?.preco || ""}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Duração (min)</label>
              <Input name="duration" type="number" min="1" required placeholder="30" defaultValue={editSrv?.tempo || ""}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Descrição</label>
            <Input name="description" placeholder="Opcional" defaultValue={editSrv?.desc || ""}/>
          </div>
          {crudError && <div style={{ fontSize:12, color:"#EF4444" }}>{crudError}</div>}
          <Divider/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => { setNovoSrvOpen(false); setEditSrv(null); }}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={crudSaving}>{crudSaving?"Salvando...":(editSrv?"Salvar Alterações":"Criar Serviço")}</Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Novo/Editar Profissional */}
      <Modal open={novoProfOpen} onClose={() => { setNovoProfOpen(false); setEditProf(null); }} title={editProf ? "Editar Profissional" : "Novo Profissional"} width={400} closeOnBackdrop={false}>
        <form onSubmit={async e => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const specialties = (fd.get("specialties") || "").split(",").map(s => s.trim()).filter(Boolean);
          setCrudSaving(true); setCrudError(null);
          try {
            const body = { name: fd.get("name"), commission_rate: Number(fd.get("commission_rate")), specialties };
            if (editProf) {
              const data = await apiFetch(`/professionals/${editProf.id}`, { method: "PUT", body: JSON.stringify(body) });
              setProfList(p => p.map((x, i) => x.id === editProf.id ? normalizeProfessional(data.professional, i) : x));
            } else {
              const data = await apiFetch("/professionals", { method: "POST", body: JSON.stringify(body) });
              setProfList(p => [...p, normalizeProfessional(data.professional, p.length)]);
            }
            setNovoProfOpen(false); setEditProf(null);
          } catch(err) { setCrudError(err.message); }
          finally { setCrudSaving(false); }
        }} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome</label>
            <Input name="name" required placeholder="Ex: Rafael Souza" defaultValue={editProf?.nome || ""}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Especialidades (separadas por vírgula)</label>
            <Input name="specialties" placeholder="Corte, Barba, Sobrancelha" defaultValue={editProf?.especialidades?.join(", ") || ""}/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Comissão (%)</label>
            <Input name="commission_rate" type="number" min="0" max="100" required placeholder="40" defaultValue={editProf?.comissao ?? ""}/>
          </div>
          {crudError && <div style={{ fontSize:12, color:"#EF4444" }}>{crudError}</div>}
          <Divider/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => { setNovoProfOpen(false); setEditProf(null); }}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={crudSaving}>{crudSaving?"Salvando...":(editProf?"Salvar Alterações":"Cadastrar")}</Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Novo/Editar Plano */}
      <Modal open={novoPlanOpen} onClose={() => { setNovoPlanOpen(false); setEditPlan(null); }} title={editPlan ? "Editar Plano" : "Novo Plano Mensal"} width={400} closeOnBackdrop={false}>
        <form onSubmit={async e => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const benefits = (fd.get("benefits") || "").split(",").map(s => s.trim()).filter(Boolean);
          setCrudSaving(true); setCrudError(null);
          try {
            const body = { name: fd.get("name"), price: Number(fd.get("price")), duration_id: fd.get("duration_id"), benefits };
            if (editPlan) {
              const data = await apiFetch(`/plans/${editPlan.id}`, { method: "PUT", body: JSON.stringify(body) });
              setPlanos(p => p.map(x => x.id === editPlan.id ? data.plan : x));
            } else {
              const data = await apiFetch("/plans", { method: "POST", body: JSON.stringify(body) });
              setPlanos(p => [...p, data.plan]);
            }
            setNovoPlanOpen(false); setEditPlan(null);
          } catch(err) { setCrudError(err.message); }
          finally { setCrudSaving(false); }
        }} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome do Plano</label>
            <Input name="name" required placeholder="Ex: Plano VIP" defaultValue={editPlan?.name || ""}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Valor (R$)</label>
              <Input name="price" type="number" step="0.01" min="0" required placeholder="0,00" defaultValue={editPlan?.price || ""}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Ciclo</label>
              <Select name="duration_id" defaultValue={editPlan?.duration_id || "mensal"}>
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </Select>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Benefícios (separados por vírgula)</label>
            <Input name="benefits" placeholder="Ex: 4 Cortes, 2 Barbas" defaultValue={(editPlan?.benefits || []).join(", ")}/>
          </div>
          {crudError && <div style={{ fontSize:12, color:"#EF4444" }}>{crudError}</div>}
          <Divider/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => { setNovoPlanOpen(false); setEditPlan(null); }}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={crudSaving}>{crudSaving?"Salvando...":(editPlan?"Salvar Alterações":"Criar Plano")}</Btn>
          </div>
        </form>
      </Modal>

      {/* Modal: Novo/Editar Usuário */}
      <Modal open={novoUserOpen} onClose={() => { setNovoUserOpen(false); setEditUser(null); }} title={editUser ? "Editar Usuário" : "Novo Usuário"} width={400} closeOnBackdrop={false}>
        <form onSubmit={async e => {
          e.preventDefault();
          const fd = new FormData(e.target);
          setCrudSaving(true); setCrudError(null);
          try {
            if (editUser) {
              const body = { name: fd.get("name"), role: fd.get("role") };
              const data = await apiFetch(`/users/${editUser.id}`, { method: "PUT", body: JSON.stringify(body) });
              setUsuarios(p => p.map(x => x.id === editUser.id ? data.user : x));
            } else {
              const body = { name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), role: fd.get("role") };
              const data = await apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
              setUsuarios(p => [...p, data.user]);
            }
            setNovoUserOpen(false); setEditUser(null);
          } catch(err) { setCrudError(err.message); }
          finally { setCrudSaving(false); }
        }} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome</label>
            <Input name="name" required placeholder="Nome completo" defaultValue={editUser?.name || ""}/>
          </div>
          {!editUser && (
            <>
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>E-mail</label>
                <Input name="email" type="email" required placeholder="email@exemplo.com"/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Senha inicial</label>
                <Input name="password" type="password" required placeholder="Mínimo 6 caracteres"/>
              </div>
            </>
          )}
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nível de Acesso</label>
            <Select name="role" defaultValue={editUser?.role || "ATENDENTE"}>
              <option value="ADMIN">Admin</option>
              <option value="ATENDENTE">Atendente</option>
              <option value="PROFISSIONAL">Profissional</option>
            </Select>
          </div>
          {crudError && <div style={{ fontSize:12, color:"#EF4444" }}>{crudError}</div>}
          <Divider/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => { setNovoUserOpen(false); setEditUser(null); }}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={crudSaving}>{crudSaving?"Salvando...":(editUser?"Salvar Alterações":"Criar Usuário")}</Btn>
          </div>
        </form>
      </Modal>

      {/* Save Footer */}
      <div style={{position:"absolute",bottom:0,left:200,right:0,padding:"14px 32px",
        background:"rgba(15,17,21,0.95)",borderTop:"1px solid var(--border)",backdropFilter:"blur(8px)",
        display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:20}}>
        <span style={{fontSize:12,color:"var(--muted)"}}>
          {saveError ? <span style={{color:"#EF4444"}}>✗ {saveError}</span>
            : saved ? <span style={{color:"#10B981"}}>✓ Alterações salvas!</span>
            : "Alterações não salvas"}
        </span>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost">Descartar</Btn>
          <Btn variant="primary" icon="check" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Settings });
