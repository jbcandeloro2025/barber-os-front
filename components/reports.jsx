
// Reports — Analytics Component
const Reports = () => {
  const [period, setPeriod] = React.useState("mes");
  const [dashData, setDashData] = React.useState(null);
  const [perfData, setPerfData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, perf] = await Promise.all([
        apiFetch("/reports/dashboard"),
        apiFetch("/reports/performance"),
      ]);
      setDashData(dash);
      setPerfData(perf.performance || []);
    } catch (e) {
      setError(e.message || "Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadData(); }, []);

  const topServices = dashData?.topServices || [];
  const totalTopCount = topServices.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "24px 28px", overflowY:"auto", height:"100%", paddingBottom:100 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Relatórios & Analytics</h1>
          <p style={{ color:"var(--muted)", fontSize:13 }}>Análise detalhada de performance e faturamento</p>
        </div>
        <Btn variant="secondary" icon="refresh-cw" size="sm" onClick={loadData}>Atualizar</Btn>
      </div>

      {error && (
        <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <Icon name="alert-circle" size={16} color="#EF4444"/>
          <span style={{ fontSize:13, color:"#EF4444" }}>{error}</span>
          <Btn variant="ghost" size="sm" onClick={loadData} style={{ marginLeft:"auto" }}>Tentar novamente</Btn>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--muted)", fontSize:14 }}>Carregando...</div>
      ) : (
        <>
          {/* Métricas do Dashboard */}
          <div className="grid-responsive" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16, marginBottom:24 }}>
            {[
              { label:"Receita do Mês", value: fmtCurrency(dashData?.monthlyRevenue || 0), color:"#C5A47E", icon:"dollar-sign" },
              { label:"Agendamentos Hoje", value: String(dashData?.todayAppointments || 0), color:"#3B82F6", icon:"calendar" },
              { label:"Novos Clientes", value: String(dashData?.newClients || 0), color:"#10B981", icon:"user-plus" },
              { label:"Serviço Mais Popular", value: dashData?.topServices?.[0]?.title || "—", color:"#F59E0B", icon:"scissors" },
            ].map((s, i) => (
              <Card key={i} style={{ padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ background:`${s.color}15`, padding:8, borderRadius:8 }}>
                    <Icon name={s.icon} size={18} color={s.color}/>
                  </div>
                </div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize: i===3?15:24, fontWeight:800, letterSpacing:"-0.02em" }}>{s.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid-responsive" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20, marginBottom:24 }}>
            {/* Performance por Profissional */}
            <Card style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:16, borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontWeight:700, fontSize:14 }}>Performance por Profissional</div>
              </div>
              {perfData.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px 16px", color:"var(--muted)", fontSize:13 }}>Sem dados de performance ainda</div>
              ) : (
                <div className="table-container">
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:400 }}>
                    <thead>
                      <tr style={{ background:"var(--surface2)" }}>
                        {["Profissional","Serviços","Faturamento"].map(h => (
                          <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:10, color:"var(--muted)", textTransform:"uppercase", fontWeight:700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {perfData.map((p, i) => (
                        <tr key={i} style={{ borderTop:"1px solid var(--border)" }}>
                          <td style={{ padding:"12px 16px" }}>
                            <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
                          </td>
                          <td style={{ padding:"12px 16px", fontSize:13 }}>{p.count}</td>
                          <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:"#C5A47E" }}>{fmtCurrency(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Top Serviços */}
            <Card style={{ padding:20 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:20 }}>Serviços mais realizados</div>
              {topServices.length === 0 ? (
                <div style={{ textAlign:"center", padding:"24px 0", color:"var(--muted)", fontSize:13 }}>Sem dados ainda</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {topServices.map((s, i) => {
                    const perc = Math.round(s.count / totalTopCount * 100);
                    const colors = ["#C5A47E","#3B82F6","#10B981","#8B5CF6","#6B7280"];
                    return (
                      <div key={i}>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                          <span style={{ fontWeight:600 }}>{s.title}</span>
                          <span style={{ color:"var(--muted)" }}>{s.count} vezes ({perc}%)</span>
                        </div>
                        <div style={{ width:"100%", height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
                          <div style={{ width:`${perc}%`, height:"100%", background:colors[i%colors.length], borderRadius:4 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { Reports });
