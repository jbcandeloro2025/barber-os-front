
// Dashboard Component
const Dashboard = ({ onNewBooking, onGoToReports }) => {
  const chartRef = React.useRef(null);
  const pieRef = React.useRef(null);
  const lineChart = React.useRef(null);
  const pieChart = React.useRef(null);

  const [metrics, setMetrics] = React.useState(null);
  const [topServices, setTopServices] = React.useState([]);
  const [todayList, setTodayList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const getThemeColors = () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      isLight,
      gridColor: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(42,47,58,0.6)',
      tickColor: isLight ? '#6B7280' : '#A1A7B3',
      borderColor: isLight ? '#FFFFFF' : '#1A1D24',
      legendColor: isLight ? '#4B5563' : '#A1A7B3',
      tooltipBg: isLight ? '#FFFFFF' : '#1A1D24',
      tooltipBorder: isLight ? '#DDE1E8' : '#2A2F3A',
      tooltipText: isLight ? '#111827' : '#FFFFFF',
    };
  };

  const buildCharts = (services) => {
    if (lineChart.current) lineChart.current.destroy();
    if (pieChart.current) pieChart.current.destroy();
    const C = getThemeColors();

    // Gráfico de linha: placeholder 7 dias (sem endpoint de receita diária ainda)
    const lctx = chartRef.current?.getContext('2d');
    if (lctx) {
      const grad = lctx.createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, C.isLight ? 'rgba(197,164,126,0.18)' : 'rgba(197,164,126,0.3)');
      grad.addColorStop(1, 'rgba(197,164,126,0)');
      const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      const hoje = new Date().getDay();
      const labels = Array.from({ length: 7 }, (_, i) => dias[(hoje - 6 + i + 7) % 7]);
      lineChart.current = new Chart(lctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'Receita (R$)', data: Array(7).fill(0),
            borderColor: '#C5A47E', backgroundColor: grad, fill: true,
            tension: 0.4, pointBackgroundColor: '#C5A47E', pointRadius: 4, pointHoverRadius: 6,
            borderWidth: 2 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: C.tooltipBg, borderColor: C.tooltipBorder, borderWidth: 1,
              titleColor: C.tooltipText, bodyColor: C.tooltipText,
              callbacks: { label: ctx => `R$ ${ctx.raw.toLocaleString('pt-BR')}` }
            }
          },
          scales: {
            x: { grid: { color: C.gridColor }, ticks: { color: C.tickColor, font: { size: 11 } }, border: { color: C.gridColor } },
            y: { grid: { color: C.gridColor }, ticks: { color: C.tickColor, font: { size: 11 }, callback: v => `R$ ${v}` }, border: { color: C.gridColor } }
          }
        }
      });
    }

    const pctx = pieRef.current?.getContext('2d');
    if (pctx && services && services.length > 0) {
      const total = services.reduce((s, x) => s + x.count, 0) || 1;
      pieChart.current = new Chart(pctx, {
        type: 'doughnut',
        data: {
          labels: services.map(s => s.title),
          datasets: [{ data: services.map(s => Math.round(s.count / total * 100)),
            backgroundColor: ['#C5A47E','#3B82F6','#8B5CF6','#10B981','#6B7280'],
            borderColor: C.borderColor, borderWidth: 3, hoverOffset: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: {
            legend: { position: 'bottom', labels: { color: C.legendColor, font: { size: 11 }, padding: 12, boxWidth: 10, borderRadius: 3 } },
            tooltip: {
              backgroundColor: C.tooltipBg, borderColor: C.tooltipBorder, borderWidth: 1,
              titleColor: C.tooltipText, bodyColor: C.tooltipText,
              callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` }
            }
          }
        }
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const [dashData, apptData] = await Promise.all([
        apiFetch('/reports/dashboard'),
        apiFetch(`/appointments?date=${todayStr}`),
      ]);

      if (!dashData) return; // 401 → reload em andamento

      setMetrics(dashData);
      setTopServices(dashData.topServices || []);

      const list = ((apptData || {}).appointments || [])
        .map(ap => normalizeAppointment(ap))
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .slice(0, 5);
      setTodayList(list);
    } catch (e) {
      setError(e.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    if (!loading) {
      buildCharts(topServices);
      const observer = new MutationObserver(() => buildCharts(topServices));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => {
        observer.disconnect();
        lineChart.current?.destroy();
        pieChart.current?.destroy();
      };
    }
  }, [loading, topServices]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const metricCards = metrics ? [
    { label: "Faturamento do Mês", value: `R$ ${Number(metrics.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: "dollar-sign", color: "#C5A47E" },
    { label: "Agendamentos Hoje", value: String(metrics.todayAppointments), icon: "calendar", color: "#3B82F6" },
    { label: "Novos Clientes", value: String(metrics.newClients), icon: "users", color: "#10B981" },
    { label: "Top Serviço", value: metrics.topServices?.[0]?.title ?? '—', icon: "scissors", color: "#8B5CF6" },
  ] : [];

  return (
    <div style={{ padding: "20px 16px 100px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ minWidth: 200 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" icon="bar-chart-2" size="sm" onClick={onGoToReports}>Relatório</Btn>
          <Btn variant="primary" icon="plus" size="sm" onClick={onNewBooking}>+ Agendar</Btn>
        </div>
      </div>

      {error && (
        <div style={{ background: "#EF444420", border: "1px solid #EF4444", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <Icon name="alert-circle" size={16} color="#EF4444"/>
          <span style={{ fontSize: 13, color: "#EF4444" }}>{error}</span>
          <Btn variant="ghost" size="sm" onClick={loadData} style={{ marginLeft: "auto" }}>Tentar novamente</Btn>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)", fontSize: 14 }}>Carregando...</div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {metricCards.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${m.color}18, transparent)`, borderRadius: "0 12px 0 60px" }}/>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "var(--muted)", fontSize: 11, fontWeight: 500 }}>{m.label}</span>
                  <div style={{ background: `${m.color}18`, border: `1px solid ${m.color}30`, borderRadius: 6, padding: 5 }}>
                    <Icon name={m.icon} size={14} color={m.color}/>
                  </div>
                </div>
                <div style={{ fontSize: m.label === "Top Serviço" ? 14 : 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid-responsive" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Receita — Últimos 7 dias</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Histórico diário</div>
                </div>
              </div>
              <div style={{ height: 190 }}><canvas ref={chartRef}/></div>
            </Card>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Serviços mais realizados</div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 12 }}>Todos os tempos</div>
              {topServices.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: 13 }}>Sem dados ainda</div>
              ) : (
                <div style={{ height: 200 }}><canvas ref={pieRef}/></div>
              )}
            </Card>
          </div>

          {/* Today's Appointments */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Agendamentos de Hoje</div>
              <Badge variant="info">{new Date().toLocaleDateString('pt-BR')}</Badge>
            </div>

            {todayList.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)", fontSize: 13 }}>
                Nenhum agendamento para hoje
              </Card>
            ) : isMobile ? (
              todayList.map(a => (
                <Card key={a.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <Avatar initials={(a.cliente?.nome || '?')[0]} size={36} color="#C5A47E" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{a.cliente?.nome || '—'}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.servico?.titulo || '—'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#C5A47E", fontFamily: "monospace" }}>{a.hora}</div>
                      <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <div className="table-container">
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                    <thead>
                      <tr>
                        {["Cliente","Serviço","Profissional","Horário","Status"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "var(--muted)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {todayList.map(a => (
                        <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar initials={(a.cliente?.nome || '?')[0]} size={30} color="#C5A47E"/>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{a.cliente?.nome || '—'}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>{a.servico?.titulo || '—'}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)" }}>{(a.profissional?.nome || '—').split(" ")[0]}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#C5A47E" }}>{a.hora}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}><Badge variant={statusVariant(a.status)}>{a.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { Dashboard });
