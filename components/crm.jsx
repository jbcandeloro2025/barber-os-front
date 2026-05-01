
// CRM — Clients Component
const ClientDrawer = ({ cliente, onClose }) => {
  const [tab, setTab] = React.useState("historico");
  const [hist, setHist] = React.useState([]);
  const [loadingHist, setLoadingHist] = React.useState(false);

  React.useEffect(() => {
    if (!cliente) return;
    setLoadingHist(true);
    apiFetch(`/clients/${cliente.id}/appointments`)
      .then(data => setHist((data.appointments || []).map(ap => normalizeAppointment(ap))))
      .catch(() => setHist([]))
      .finally(() => setLoadingHist(false));
  }, [cliente?.id]);

  if (!cliente) return null;

  const subscription = cliente.subscription;
  const pontos = hist.length % 10;
  const faltam = 10 - pontos;
  const ganhouPremio = pontos === 0 && hist.length > 0;
  const lastAppt = hist[0];
  const dias = lastAppt ? daysSince(lastAppt.data) : null;

  const tabs = [
    { id:"historico", label:"Histórico", icon:"calendar" },
    { id:"plano", label:"Assinatura", icon:"package" },
    { id:"fidelidade", label:"Fidelidade", icon:"award" },
    { id:"stats", label:"Estatísticas", icon:"bar-chart-2" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ width:"100%", maxWidth:400, background:"var(--surface)", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column",
        height:"100%", animation:"slideIn 0.22s ease-out", position:"relative" }}>
        <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>

        {/* Header */}
        <div style={{ padding:"20px 20px 0", borderBottom:"1px solid var(--border)", paddingBottom:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div style={{ display:"flex", gap:14, alignItems:"center" }}>
              <Avatar initials={cliente.avatar} size={52} color="#C5A47E"/>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{cliente.nome}</div>
                <div style={{ color:"var(--muted)", fontSize:12, marginTop:2 }}>{cliente.telefone}</div>
                <div style={{ marginTop:6, display:"flex", gap:6, flexWrap:"wrap" }}>
                  {hist.length >= 10 && <Badge variant="default">⭐ Frequente</Badge>}
                  {subscription && <Badge style={{ background:"#C5A47E", color:"#000" }}>💎 VIP</Badge>}
                  {dias !== null && dias > 30 && <Badge variant="warning">Sumido</Badge>}
                </div>
              </div>
            </div>
            <Btn variant="ghost" size="sm" onClick={onClose} style={{padding:6}}><Icon name="x" size={16}/></Btn>
          </div>
          <div style={{ display:"flex", gap:2, marginBottom:0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ flex:1, padding:"9px 0", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit",
                  fontSize:12, fontWeight:600, color: tab===t.id ? "#C5A47E" : "var(--muted)",
                  borderBottom: tab===t.id ? "2px solid #C5A47E" : "2px solid transparent",
                  transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <Icon name={t.icon} size={13}/>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:20 }}>
          {tab === "historico" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {loadingHist && <div style={{ textAlign:"center", padding:"32px 0", color:"var(--muted)", fontSize:13 }}>Carregando...</div>}
              {!loadingHist && hist.length === 0 && (
                <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:"32px 0" }}>Nenhum agendamento encontrado</div>
              )}
              {hist.map(a => (
                <Card key={a.id} style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{a.servico?.titulo || "—"}</div>
                      <div style={{ color:"var(--muted)", fontSize:11 }}>
                        {(a.profissional?.nome || "—").split(" ")[0]} · {fmtDate(a.data)} {a.hora}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                      <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                      <span style={{ fontSize:12, fontWeight:700, color:"#C5A47E" }}>{fmtCurrency(a.servico?.preco || 0)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === "fidelidade" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ textAlign:"center", padding:"10px 0" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--muted)", marginBottom:10 }}>Cartão Fidelidade</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
                  {Array.from({length:10}).map((_,i) => (
                    <div key={i} style={{ aspectRatio:"1", borderRadius:10, border:"2px dashed", display:"flex", alignItems:"center", justifyContent:"center",
                      borderColor: i < pontos ? "var(--primary)" : "var(--border)",
                      background: i < pontos ? "rgba(197,164,126,0.1)" : "transparent" }}>
                      {i < pontos ? <Icon name="check" size={18} color="var(--primary)"/> : <span style={{fontSize:12,color:"var(--muted2)"}}>{i+1}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ background:"var(--surface2)", borderRadius:12, padding:16, border:"1px solid var(--border)" }}>
                  {ganhouPremio ? (
                    <div style={{ color:"#10B981", fontWeight:700, fontSize:14 }}>
                      🎉 PRÊMIO DISPONÍVEL!<br/>
                      <span style={{fontSize:11,fontWeight:400,color:"var(--muted)"}}>O cliente completou 10 visitas.</span>
                      <Btn variant="success" size="sm" style={{marginTop:12,width:"100%",justifyContent:"center"}}>Resgatar Corte Grátis</Btn>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:14, fontWeight:700, marginBottom:8 }}>Faltam {faltam} visitas</div>
                      <div style={{ width:"100%", height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ width:`${(pontos/10)*100}%`, height:"100%", background:"var(--primary)", transition:"width 0.5s ease-out" }}/>
                      </div>
                      <div style={{ fontSize:11, color:"var(--muted)", marginTop:10 }}>Ao completar 10 visitas, o cliente ganha 1 corte grátis ou 50% de desconto.</div>
                    </>
                  )}
                </div>
              </div>
              <Divider/>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", marginBottom:12 }}>Regras do Programa</div>
                <ul style={{ paddingLeft:20, fontSize:12, color:"var(--muted)", display:"flex", flexDirection:"column", gap:8 }}>
                  <li>Cada serviço realizado acumula 1 ponto.</li>
                  <li>Pontos são válidos por 12 meses.</li>
                  <li>O prêmio pode ser resgatado em qualquer serviço de barba ou cabelo.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === "plano" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {!subscription ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <Icon name="package" size={32} color="var(--border)" style={{ marginBottom:12 }}/>
                  <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Nenhum plano ativo</div>
                  <p style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>Este cliente ainda não é assinante de nenhum pacote mensal.</p>
                  <Btn variant="primary" size="sm">Vender Plano</Btn>
                </div>
              ) : (
                <>
                  <Card style={{ padding:20, border:"1px solid var(--border)", background:"rgba(197,164,126,0.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"var(--muted2)", textTransform:"uppercase" }}>Status da Assinatura</div>
                      <Badge variant="success">ATIVO</Badge>
                    </div>
                    <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20 }}>
                      <div style={{ width:44, height:44, background:"#C5A47E", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon name="package" size={20} color="#000"/>
                      </div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700 }}>{subscription.plan?.name || "Plano VIP"}</div>
                        <div style={{ fontSize:12, color:"var(--muted)" }}>Vence: {fmtDate(subscription.end_date?.split("T")[0] || "")}</div>
                      </div>
                    </div>
                  </Card>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <Btn variant="secondary" size="sm" icon="edit">Editar</Btn>
                    <Btn variant="ghost" size="sm" style={{ color:"#EF4444" }}>Cancelar</Btn>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "stats" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Visitas Totais", value:`${hist.length}x`, icon:"calendar", color:"#3B82F6" },
                { label:"Último Agendamento", value: dias === null ? "Nunca" : dias === 0 ? "Hoje" : `${dias} dias atrás`, icon:"clock", color: (dias||0) > 30 ? "#EF4444" : "#F59E0B" },
                { label:"Pontos Fidelidade", value:`${pontos} pts`, icon:"award", color:"#C5A47E" },
              ].map((s,i) => (
                <div key={i} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px",
                  display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ background:`${s.color}18`, border:`1px solid ${s.color}30`, borderRadius:8, padding:9 }}>
                    <Icon name={s.icon} size={16} color={s.color}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginBottom:2 }}>{s.label}</div>
                    <div style={{ fontSize:17, fontWeight:700 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)", display:"flex", gap:8 }}>
          <Btn variant="secondary" icon="phone" style={{ flex:1, justifyContent:"center" }}>Ligar</Btn>
          <Btn variant="success" style={{ flex:1, justifyContent:"center", gap:6 }}>
            <Icon name="message-circle" size={14} color="#fff"/>WhatsApp
          </Btn>
          <Btn variant="primary" icon="calendar" style={{ flex:1, justifyContent:"center" }}>Agendar</Btn>
        </div>
      </div>
    </div>
  );
};

const NewClientModal = ({ open, onClose, onSaved }) => {
  const [form, setForm] = React.useState({ name:"", phone:"", email:"" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Nome e telefone são obrigatórios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/clients", {
        method: "POST",
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || undefined }),
      });
      onSaved && onSaved(normalizeClient(data.client));
      onClose();
    } catch (e) {
      setError(e.message || "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Novo Cliente" width={420}>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:6 }}>Nome *</label>
          <Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nome completo" icon="user"/>
        </div>
        <div>
          <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:6 }}>Telefone *</label>
          <Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="(11) 9 9999-9999" icon="phone"/>
        </div>
        <div>
          <label style={{ fontSize:12, color:"var(--muted)", display:"block", marginBottom:6 }}>E-mail</label>
          <Input value={form.email} onChange={e=>set("email",e.target.value)} placeholder="cliente@email.com" icon="mail"/>
        </div>
        {error && <div style={{ fontSize:12, color:"#EF4444" }}>{error}</div>}
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <Btn variant="secondary" style={{ flex:1, justifyContent:"center" }} onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" style={{ flex:1, justifyContent:"center" }} onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

const CRM = () => {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("todos");
  const [selected, setSelected] = React.useState(null);
  const [clientes, setClientes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/clients");
      setClientes((data.clients || []).map(normalizeClient));
    } catch (e) {
      setError(e.message || "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadClients(); }, []);

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.nome.toLowerCase().includes(q) || c.telefone.includes(search);
    if (!matchSearch) return false;
    if (filter === "sumidos") return false; // sem último agendamento confiável na listagem
    if (filter === "top") return false;     // sem total_gasto na listagem
    return true;
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const filterBtns = [
    { id:"todos", label:"Todos" },
    { id:"sumidos", label:"Sumidos +30d" },
    { id:"top", label:"Maiores Gastadores" },
  ];

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--muted)", fontSize:14 }}>
      Carregando clientes...
    </div>
  );

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "24px 28px", overflowY:"auto", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Clientes</h1>
          <p style={{ color:"var(--muted)", fontSize:13 }}>{clientes.length} clientes cadastrados</p>
        </div>
        <Btn variant="primary" icon="user-plus" size={isMobile?"sm":"md"} onClick={()=>setShowNew(true)}>Novo Cliente</Btn>
      </div>

      {error && (
        <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <Icon name="alert-circle" size={16} color="#EF4444"/>
          <span style={{ fontSize:13, color:"#EF4444" }}>{error}</span>
          <Btn variant="ghost" size="sm" onClick={loadClients} style={{ marginLeft:"auto" }}>Tentar novamente</Btn>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 240px", minWidth:200 }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome ou telefone..." icon="search"/>
        </div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, width:isMobile?"100%":"auto" }}>
          {filterBtns.map(f => (
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{ padding:"8px 14px", borderRadius:20, border:"1px solid", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                whiteSpace:"nowrap",
                borderColor: filter===f.id?"#C5A47E":"var(--border)",
                background: filter===f.id?"rgba(197,164,126,0.15)":"transparent",
                color: filter===f.id?"#C5A47E":"var(--muted)" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table or Cards */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:80 }}>
          {filtered.map(c => (
            <Card key={c.id} onClick={() => setSelected(c)} style={{ padding:"14px 16px", cursor:"pointer" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <Avatar initials={c.avatar} size={40} color="#C5A47E"/>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{c.nome}</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>{c.telefone}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:4 }}>
                  {c.subscription && <Badge style={{ background:"#C5A47E", color:"#000" }}>💎 VIP</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          <div className="table-container">
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
              <thead>
                <tr style={{ background:"var(--surface2)" }}>
                  {["Cliente","Telefone","E-mail","Assinatura","Ações"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, color:"var(--muted)", fontWeight:600,
                      letterSpacing:"0.05em", textTransform:"uppercase", borderBottom:"1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i) => (
                  <tr key={c.id} onClick={()=>setSelected(c)}
                    style={{ borderTop:i>0?"1px solid var(--border)":"none", cursor:"pointer", transition:"background 0.12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Avatar initials={c.avatar} size={34} color="#C5A47E"/>
                        <div style={{ fontSize:13, fontWeight:600 }}>{c.nome}</div>
                        {c.subscription && <Badge style={{ background:"#C5A47E", color:"#000" }}>💎 VIP</Badge>}
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px", fontSize:13, color:"var(--muted)" }}>{c.telefone}</td>
                    <td style={{ padding:"13px 16px", fontSize:13, color:"var(--muted)" }}>{c.email || "—"}</td>
                    <td style={{ padding:"13px 16px" }}>
                      {c.subscription ? <Badge variant="success">Ativo</Badge> : <Badge variant="default">Sem plano</Badge>}
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", gap:4 }} onClick={e=>e.stopPropagation()}>
                        <Btn variant="ghost" size="sm" style={{padding:"5px 8px"}}><Icon name="edit" size={13} color="var(--muted)"/></Btn>
                        <Btn variant="ghost" size="sm" style={{padding:"5px 8px"}}><Icon name="message-circle" size={13} color="#25D366"/></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign:"center", padding:"40px 0", color:"var(--muted)" }}>
          <Icon name="users" size={32} color="var(--border)"/>
          <div style={{ marginTop:8, fontSize:14 }}>Nenhum cliente encontrado</div>
        </div>
      )}

      {selected && <ClientDrawer cliente={selected} onClose={()=>setSelected(null)}/>}
      <NewClientModal open={showNew} onClose={()=>setShowNew(false)} onSaved={c=>{ setClientes(prev=>[c,...prev]); }}/>
    </div>
  );
};

Object.assign(window, { CRM });
