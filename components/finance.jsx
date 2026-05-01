
// Finance Component — Expenses & Cash Flow
const Finance = () => {
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/transactions");
      setTransactions(data.transactions || []);
    } catch (e) {
      setError(e.message || "Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadTransactions(); }, []);

  const expenses = transactions.filter(t => t.type === "EXPENSE");
  const income   = transactions.filter(t => t.type === "INCOME");
  const totalIncome   = income.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSaving(true);
    setSaveError(null);
    try {
      const data = await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount:         Number(formData.get("valor")),
          type:           "EXPENSE",
          payment_method: "CASH",
          description:    formData.get("descricao"),
        }),
      });
      setTransactions(prev => [data.transaction, ...prev]);
      setModalOpen(false);
      e.target.reset();
    } catch (err) {
      setSaveError(err.message || "Erro ao salvar despesa");
    } finally {
      setSaving(false);
    }
  };

  const PAY_LABEL = { PIX:"Pix", CARD:"Cartão", CASH:"Dinheiro", SUBSCRIPTION_REDEEM:"Plano" };

  return (
    <div style={{ padding:"24px 20px", height:"100%", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>Financeiro</h1>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Fluxo de caixa e despesas</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" icon="refresh-cw" onClick={loadTransactions}>Atualizar</Btn>
          <Btn variant="primary" icon="plus" onClick={() => setModalOpen(true)}>Nova Despesa</Btn>
        </div>
      </div>

      {error && (
        <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <Icon name="alert-circle" size={16} color="#EF4444"/>
          <span style={{ fontSize:13, color:"#EF4444" }}>{error}</span>
          <Btn variant="ghost" size="sm" onClick={loadTransactions} style={{ marginLeft:"auto" }}>Tentar novamente</Btn>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-responsive" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16, marginBottom:32 }}>
        <Card style={{ padding:20, borderLeft:"4px solid #10B981" }}>
          <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Receita Total</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#10B981" }}>{fmtCurrency(totalIncome)}</div>
        </Card>
        <Card style={{ padding:20, borderLeft:"4px solid #EF4444" }}>
          <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Despesas Totais</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#EF4444" }}>{fmtCurrency(totalExpenses)}</div>
        </Card>
        <Card style={{ padding:20, borderLeft:"4px solid var(--primary)", background:"rgba(197,164,126,0.05)" }}>
          <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Lucro Líquido</div>
          <div style={{ fontSize:22, fontWeight:800, color:"var(--primary)" }}>{fmtCurrency(netProfit)}</div>
        </Card>
      </div>

      {/* Transactions List */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontSize:15, fontWeight:700 }}>Movimentações</h3>
          {loading && <span style={{ fontSize:12, color:"var(--muted)" }}>Carregando...</span>}
        </div>
        {!loading && transactions.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:"var(--muted)", fontSize:13 }}>Nenhuma movimentação registrada</div>
        ) : (
          <div className="table-container">
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
              <thead>
                <tr style={{ background:"var(--surface2)" }}>
                  {["Descrição","Tipo","Forma de Pagamento","Data","Valor"].map(h => (
                    <th key={h} style={{ textAlign: h==="Valor"?"right":"left", padding:"12px 20px", fontSize:11, color:"var(--muted)", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id} style={{ borderTop:i>0?"1px solid var(--border)":"none" }}>
                    <td style={{ padding:"14px 20px", fontSize:13, fontWeight:600 }}>{t.description || "—"}</td>
                    <td style={{ padding:"14px 20px" }}>
                      <Badge variant={t.type==="INCOME"?"success":"error"}>{t.type==="INCOME"?"Receita":"Despesa"}</Badge>
                    </td>
                    <td style={{ padding:"14px 20px", fontSize:13, color:"var(--muted)" }}>{PAY_LABEL[t.payment_method] || t.payment_method}</td>
                    <td style={{ padding:"14px 20px", fontSize:13, color:"var(--muted)" }}>{fmtDate(t.created_at?.split("T")[0] || "")}</td>
                    <td style={{ padding:"14px 20px", fontSize:14, fontWeight:700, color:t.type==="INCOME"?"#10B981":"#EF4444", textAlign:"right" }}>
                      {t.type==="INCOME"?"+":"-"} {fmtCurrency(Number(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Nova Despesa */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Lançar Despesa" width={400}>
        <form onSubmit={handleAddExpense} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Descrição da Despesa</label>
            <Input name="descricao" placeholder="Ex: Conta de Água" required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Valor (R$)</label>
            <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required/>
          </div>
          {saveError && <div style={{ fontSize:12, color:"#EF4444" }}>{saveError}</div>}
          <Divider style={{ margin:"8px 0" }}/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Lançar Agora"}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
};

Object.assign(window, { Finance });
