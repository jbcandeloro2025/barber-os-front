
// Agenda Component — Weekly Grid View
const HOURS = Array.from({length:15}, (_,i) => `${(i+8).toString().padStart(2,'0')}:00`);

const AgendaCardMini = ({ ag, onClick }) => {
  const colors = { Confirmado:"#10B981", Pendente:"#F59E0B", Cancelado:"#EF4444", Finalizado:"#3B82F6", "No-show":"#6B7280" };
  const c = colors[ag.status] || "#C5A47E";
  return (
    <div onClick={() => onClick(ag)} style={{ background:`${c}18`, border:`1px solid ${c}40`,
      borderLeft:`3px solid ${c}`, borderRadius:6, padding:"5px 7px", cursor:"pointer",
      marginBottom:3, transition:"transform 0.1s, box-shadow 0.1s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.01)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.3)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none"}}>
      <div style={{fontSize:11,fontWeight:700,color:c,lineHeight:1.2}}>{ag.hora}</div>
      <div style={{fontSize:11,fontWeight:600,color:"var(--text)",lineHeight:1.3,marginTop:1}}>{ag.cliente.nome.split(" ")[0]}</div>
      <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.2}}>{ag.servico.titulo}</div>
    </div>
  );
};

const AgendaModal = ({ ag, onClose, onSave, clientes, servicos, profissionais, saving }) => {
  const [form, setForm] = React.useState({
    id:           ag?.id || null,
    client_id:    ag?.cliente?.id || "",
    service_id:   ag?.servico?.id || "",
    professional_id: ag?.profissional?.id || "",
    hora:         ag?.hora || "",
    data:         ag?.data || new Date().toISOString().split("T")[0],
    status:       ag?.status || "Pendente",
    obs:          ag?.obs || "",
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  if (!ag) return null;

  return (
    <Modal open={!!ag} onClose={onClose} title={ag.id ? "Editar Agendamento" : "Novo Agendamento"} width={480}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Cliente</label>
          <Select value={form.client_id} onChange={e=>set("client_id",e.target.value)} style={{width:"100%"}}>
            <option value="">Selecionar cliente...</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Serviço</label>
          <Select value={form.service_id} onChange={e=>set("service_id",e.target.value)} style={{width:"100%"}}>
            <option value="">Selecionar serviço...</option>
            {servicos.map(s=><option key={s.id} value={s.id}>{s.titulo} — {fmtCurrency(s.preco)}</option>)}
          </Select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Profissional</label>
            <Select value={form.professional_id} onChange={e=>set("professional_id",e.target.value)} style={{width:"100%"}}>
              <option value="">Selecionar profissional...</option>
              {profissionais.map(p=><option key={p.id} value={p.id}>{p.nome.split(" ")[0]}</option>)}
            </Select>
          </div>
          <div>
            <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Horário</label>
            <Input 
              value={form.hora} 
              onChange={e => {
                const val = e.target.value;
                const formatted = val.replace(/\D/g, "").slice(0, 4);
                if (formatted.length >= 3) {
                  set("hora", formatted.slice(0, 2) + ":" + formatted.slice(2));
                } else {
                  set("hora", formatted);
                }
              }} 
              placeholder="00:00"
              maxLength={5}
            />
          </div>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Data</label>
          <Input type="date" value={form.data} onChange={e=>set("data",e.target.value)}/>
        </div>
        {ag.id && (
          <div>
            <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Status</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["Pendente","Confirmado","Finalizado","Cancelado"].map(s=>(
                <button key={s} onClick={()=>set("status",s)}
                  style={{padding:"6px 12px",borderRadius:20,border:"1px solid",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                    borderColor:form.status===s?"#C5A47E":"var(--border)",
                    background:form.status===s?"rgba(197,164,126,0.15)":"transparent",
                    color:form.status===s?"#C5A47E":"var(--muted)"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={{fontSize:12,color:"var(--muted)",fontWeight:500,display:"block",marginBottom:6}}>Observações</label>
          <textarea value={form.obs} onChange={e=>set("obs",e.target.value)} placeholder="Preferências do cliente..."
            style={{width:"100%",padding:"9px 12px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,
              color:"var(--text)",fontSize:13,resize:"vertical",minHeight:70,outline:"none",fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor="#C5A47E"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        </div>
        <Divider style={{margin:"4px 0"}}/>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" icon="check" onClick={()=>onSave(form)} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

const DatePicker = ({ value, onChange, label }) => {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(new Date(value));
  const ref = React.useRef();

  React.useEffect(() => {
    const click = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  const days = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const last = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const arr = [];
    const firstDayIndex = first === 0 ? 6 : first - 1;
    for(let i = firstDayIndex - 1; i >= 0; i--) arr.push({ d: prevLast - i, m: month - 1, y: year, other: true });
    for(let i = 1; i <= last; i++) arr.push({ d: i, m: month, y: year });
    while(arr.length < 42) arr.push({ d: arr.length - last - firstDayIndex + 1, m: month + 1, y: year, other: true });
    return arr;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => {setOpen(!open); setViewDate(new Date(value));}}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = "var(--border)")}>
        <Icon name="calendar" size={14} color="var(--primary)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <Icon name="chevron-down" size={12} color="var(--muted2)" />
      </div>
      {open && (
        <div className="fade-up" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: 280, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: "capitalize" }}>{monthName}</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="chevron-left" size={14} color="var(--muted)" /></button>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><Icon name="chevron-right" size={14} color="var(--muted)" /></button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", gap: 2, marginBottom: 8 }}>
            {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)" }}>{d}</span>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {days.map((d, i) => {
              const active = value.getDate() === d.d && value.getMonth() === d.m && value.getFullYear() === d.y;
              return (
                <button key={i} onClick={() => { onChange(new Date(d.y, d.m, d.d)); setOpen(false); }}
                  style={{ aspectRatio: "1", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", transition: "all 0.1s",
                    background: active ? "var(--primary)" : "transparent",
                    color: active ? "#0F1115" : (d.other ? "var(--muted2)" : "var(--text)"),
                    fontWeight: active ? 700 : 400
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}>
                  {d.d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Agenda = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [view, setView] = React.useState(isMobile ? "dia" : "semana");
  const [baseDate, setBaseDate] = React.useState(new Date());
  const [filterProf, setFilterProf] = React.useState("todos");
  const [selectedAg, setSelectedAg] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Dados da API
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [profissionais, setProfissionais] = React.useState([]);
  const [clientes, setClientes] = React.useState([]);
  const [servicos, setServicos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Mapa de profissional_id -> cor (derivado do array)
  const profColorMap = React.useMemo(() => {
    const map = {};
    profissionais.forEach((p, i) => { map[p.id] = PROF_COLORS[i % PROF_COLORS.length]; });
    return map;
  }, [profissionais]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const week = getWeekDays(baseDate);
      const start = week[0].date + "T00:00:00.000Z";
      const end   = week[6].date + "T23:59:59.999Z";

      const [apRes, profRes, cliRes, svcRes] = await Promise.all([
        apiFetch(`/appointments?start=${start}&end=${end}`),
        apiFetch("/professionals"),
        apiFetch("/clients"),
        apiFetch("/services"),
      ]);

      const profs = (profRes.professionals || []).map((p, i) => normalizeProfessional(p, i));
      const colorMap = {};
      profs.forEach((p, i) => { colorMap[p.id] = PROF_COLORS[i % PROF_COLORS.length]; });

      setProfissionais(profs);
      setClientes((cliRes.clients || []).map(normalizeClient));
      setServicos((svcRes.services || []).map(normalizeService));
      setAgendamentos((apRes.appointments || []).map(ap => normalizeAppointment(ap, colorMap)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [baseDate]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const getWeekDays = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return Array.from({length:7}, (_,i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const labels = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
      return { label:labels[d.getDay()], date:iso, day:d.getDate(), month:d.getMonth(), year:d.getFullYear() };
    });
  };

  const fmtDateShort = (d) => {
    const dt = new Date(d + 'T12:00:00');
    return `${dt.getDate().toString().padStart(2,'0')}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getFullYear().toString().slice(-2)}`;
  };

  const days = getWeekDays(baseDate);
  const currentWeekLabel = `${fmtDateShort(days[0].date)} – ${fmtDateShort(days[6].date)}`;

  const profOptions = [{id:"todos",nome:"Todos"},...profissionais];
  const filtered = agendamentos.filter(a => filterProf === "todos" || a.profissional.id === filterProf);

  const getAgsForCell = (date, hour) =>
    filtered.filter(a => a.data === date && a.hora.startsWith(hour.split(":")[0]));

  const handleSave = async (form) => {
    if (!form.client_id || !form.service_id || !form.professional_id || !form.hora || !form.data) {
      alert("Preencha todos os campos: Cliente, Serviço, Profissional e Horário.");
      return;
    }
    setSaving(true);
    try {
      const scheduled_at = new Date(`${form.data}T${form.hora}:00`).toISOString();

      if (form.id) {
        // Atualizar status
        await apiFetch(`/appointments/${form.id}/status`, {
          method: "PATCH",
          body: { status: STATUS_PT_TO_API[form.status] || "CONFIRMED" },
        });
      } else {
        // Criar novo agendamento
        await apiFetch("/appointments", {
          method: "POST",
          body: {
            client_id:       form.client_id,
            service_id:      form.service_id,
            professional_id: form.professional_id || undefined,
            scheduled_at,
            notes: form.obs || undefined,
          },
        });
      }
      await loadData();
      setModalOpen(false);
      setSelectedAg(null);
    } catch (e) {
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const profsToShow = filterProf === "todos" ? profissionais : profissionais.filter(p => p.id === filterProf);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {/* Toolbar */}
      <div style={{padding: isMobile ? "12px 16px" : "16px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, flexShrink:0, flexWrap:"wrap"}}>
        {!isMobile && (
          <div style={{display:"flex",gap:2,background:"var(--surface2)",borderRadius:8,padding:3}}>
            {["dia","semana"].map(v=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:"6px 14px",borderRadius:6,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",
                  background:view===v?"var(--surface)":"transparent",color:view===v?"var(--text)":"var(--muted)",
                  boxShadow:view===v?"0 1px 3px rgba(0,0,0,0.3)":"none",transition:"all 0.15s",textTransform:"capitalize"}}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <Btn variant="ghost" size="sm" style={{padding:"6px 8px"}} onClick={() => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() - (view === "semana" ? 7 : 1));
            setBaseDate(d);
          }}>
            <Icon name="chevron-left" size={14}/>
          </Btn>
          <DatePicker value={baseDate} onChange={setBaseDate} label={fmtDate(baseDate.toISOString().split('T')[0])} />
          <Btn variant="ghost" size="sm" style={{padding:"6px 8px"}} onClick={() => {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + (view === "semana" ? 7 : 1));
            setBaseDate(d);
          }}>
            <Icon name="chevron-right" size={14}/>
          </Btn>
        </div>

        {!isMobile && <div style={{flex:1}}/>}

        <div style={{ display:"flex", gap:10, alignItems:"center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end", marginTop: isMobile ? 10 : 0 }}>
          <Select value={filterProf} onChange={e=>setFilterProf(e.target.value)} style={{ flex: isMobile ? 1 : "initial" }}>
            {profOptions.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}
          </Select>
          <Btn variant="primary" size="sm" onClick={()=>{setSelectedAg({});setModalOpen(true);}}>+ Agendar</Btn>
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div style={{padding:"10px 24px",background:"rgba(239,68,68,0.1)",borderBottom:"1px solid rgba(239,68,68,0.3)",fontSize:13,color:"#EF4444",display:"flex",alignItems:"center",gap:8}}>
          <Icon name="alert-circle" size={14}/> {error}
          <button onClick={loadData} style={{marginLeft:"auto",background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12,fontWeight:600}}>Tentar novamente</button>
        </div>
      )}

      {loading && (
        <div style={{padding:"40px",textAlign:"center",color:"var(--muted)"}}>
          Carregando agendamentos...
        </div>
      )}

      {/* Grid or List */}
      {!loading && (
        <div className="table-container" style={{flex:1,overflowY:"auto", padding: isMobile ? "0 16px 100px" : 0 }}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {filtered.filter(a => a.data === baseDate.toISOString().split('T')[0])
                .sort((a,b) => a.hora.localeCompare(b.hora))
                .map(ag => (
                  <Card key={ag.id} onClick={() => { setSelectedAg(ag); setModalOpen(true); }} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ padding: "6px 10px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>{ag.hora}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{ag.cliente.nome}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{ag.servico.titulo}</div>
                        </div>
                      </div>
                      <Badge variant={statusVariant(ag.status)}>{ag.status}</Badge>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ag.profissional.cor }} />
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{ag.profissional.nome}</span>
                      </div>
                      <Btn variant="ghost" size="sm" icon="edit" style={{ padding: 4 }} />
                    </div>
                  </Card>
                ))}
              {filtered.filter(a => a.data === baseDate.toISOString().split('T')[0]).length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted2)" }}>
                  <Icon name="calendar" size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <p>Nenhum agendamento para este dia.</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", background: "var(--bg)" }}>
              {/* Header Sticky */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ width: 50, padding: "12px 4px", fontSize: 10, color: "var(--muted2)", fontWeight: 700, textTransform: "uppercase", textAlign: "center", borderRight: "1px solid var(--border)", flexShrink: 0 }}>Hora</div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${view === "semana" ? 7 : 1}, 1fr)`, width: "100%" }}>
                  {(view === "semana" ? days : days.filter(d => d.date === baseDate.toISOString().split('T')[0])).map(d => (
                    <div key={d.date} style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", background: d.date === new Date().toISOString().split('T')[0] ? "rgba(197,164,126,0.08)" : "transparent", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: d.date === new Date().toISOString().split('T')[0] ? "#C5A47E" : "var(--text)" }}>{d.label}</div>
                        <div style={{ fontSize: 9, color: "var(--muted2)" }}>{fmtDateShort(d.date)}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: `repeat(${profsToShow.length || 1}, 1fr)`, background: "var(--surface2)" }}>
                        {profsToShow.map(p => (
                          <div key={p.id} title={p.nome} style={{ padding: "4px 2px", fontSize: 9, fontWeight: 600, color: "var(--muted)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.cor, flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable Body */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                  {HOURS.map(hr => (
                    <div key={hr} style={{ display: "flex", borderBottom: "1px solid rgba(42,47,58,0.4)", minHeight: 60 }}>
                      <div style={{ width: 50, padding: "12px 4px", fontSize: 10, fontWeight: 700, color: "var(--muted2)", textAlign: "center", borderRight: "1px solid var(--border)", background: "var(--bg)", flexShrink: 0 }}>{hr}</div>
                      <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${view === "semana" ? 7 : 1}, 1fr)` }}>
                        {(view === "semana" ? days : days.filter(d => d.date === baseDate.toISOString().split('T')[0])).map(d => (
                          <div key={d.date} style={{ borderRight: "1px solid var(--border)", display: "grid", gridTemplateColumns: `repeat(${profsToShow.length || 1}, 1fr)`, minWidth: 0 }}>
                            {profsToShow.map(p => {
                              const ags = getAgsForCell(d.date, hr).filter(a => a.profissional.id === p.id);
                              return (
                                <div key={p.id} style={{ padding: "2px", borderRight: "1px solid rgba(255,255,255,0.03)", minHeight: 60, position: "relative" }}
                                  onDoubleClick={() => { setSelectedAg({ data: d.date, hora: hr, profissional: p, profissional_id: p.id }); setModalOpen(true); }}>
                                  {ags.map(ag => <AgendaCardMini key={ag.id} ag={ag} onClick={a => { setSelectedAg(a); setModalOpen(true); }} />)}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <AgendaModal
          ag={selectedAg}
          onClose={()=>{setModalOpen(false);setSelectedAg(null);}}
          onSave={handleSave}
          clientes={clientes}
          servicos={servicos}
          profissionais={profissionais}
          saving={saving}
        />
      )}
    </div>
  );
};

Object.assign(window, { Agenda });
