
// Checkout / PDV Modal
const QRCode = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
    <div style={{ background:"#fff", padding:16, borderRadius:12, display:"inline-block" }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {Array.from({length:20}).map((_,r)=>Array.from({length:20}).map((_,c)=>(
          Math.random()>0.5&&<rect key={`${r}-${c}`} x={c*7} y={r*7} width={7} height={7} fill="#000"/>
        )))}
        <rect x={0} y={0} width={35} height={35} rx={4} fill="#000"/>
        <rect x={4} y={4} width={27} height={27} rx={2} fill="#fff"/>
        <rect x={8} y={8} width={19} height={19} rx={1} fill="#000"/>
        <rect x={105} y={0} width={35} height={35} rx={4} fill="#000"/>
        <rect x={109} y={4} width={27} height={27} rx={2} fill="#fff"/>
        <rect x={113} y={8} width={19} height={19} rx={1} fill="#000"/>
        <rect x={0} y={105} width={35} height={35} rx={4} fill="#000"/>
        <rect x={4} y={109} width={27} height={27} rx={2} fill="#fff"/>
        <rect x={8} y={113} width={19} height={19} rx={1} fill="#000"/>
      </svg>
    </div>
    <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", textAlign:"center", width:"100%" }}>
      <div style={{ fontSize:10, color:"var(--muted)", marginBottom:4 }}>Código Pix (copia e cola)</div>
      <div style={{ fontSize:11, color:"#C5A47E", fontFamily:"monospace", letterSpacing:"0.03em", wordBreak:"break-all" }}>
        00020126360014br.gov.bcb.pix0114+5511987654321...
      </div>
      <Btn variant="secondary" size="sm" style={{ marginTop:8, width:"100%", justifyContent:"center" }}>Copiar Código</Btn>
    </div>
  </div>
);

// Mapa de método de pagamento front -> API enum
const PAY_METHOD_MAP = {
  pix: "PIX",
  cartao: "CARD",
  dinheiro: "CASH",
  plano: "SUBSCRIPTION_REDEEM",
};

const CheckoutModal = ({ open, onClose, agendamento }) => {
  const [itens, setItens] = React.useState([]);
  const [servicos, setServicos] = React.useState([]);
  const [produtos, setProdutos] = React.useState([]);
  const [payMethod, setPayMethod] = React.useState("pix");
  const [parcelas, setParcelas] = React.useState(1);
  const [valorRecebido, setValorRecebido] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Carrega serviços e produtos ao abrir
  React.useEffect(() => {
    if (!open) return;
    setDone(false);
    setError(null);
    setPayMethod("pix");
    setValorRecebido("");

    const initialItens = agendamento ? [{
      id: agendamento.servico?.id || agendamento.service_id,
      titulo: agendamento.servico?.titulo || agendamento.servico?.title || "Serviço",
      preco: Number(agendamento.servico?.preco || agendamento.servico?.price || 0),
      tipo: "servico",
    }] : [];
    setItens(initialItens);

    // Plano ativo?
    const hasPlan = agendamento?.cliente?.subscription || agendamento?.cliente?.planoStatus === "ativo";
    if (hasPlan) setPayMethod("plano");

    setLoadingData(true);
    Promise.all([
      apiFetch("/services"),
      apiFetch("/inventory"),
    ]).then(([sData, iData]) => {
      setServicos((sData.services || []).map(normalizeService));
      setProdutos(iData.products || []);
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [open]);

  const hasActivePlan = !!(agendamento?.cliente?.subscription);
  const commissionRate = Number(agendamento?.profissional?.commission_rate ?? 0.40);

  const subtotal = itens.reduce((s, i) => {
    if (payMethod === "plano" && i.tipo === "servico") return s;
    return s + Number(i.preco || 0);
  }, 0);

  const comissao = itens
    .filter(i => i.tipo === "servico")
    .reduce((s, i) => s + Number(i.preco || 0), 0) * commissionRate;

  const troco = valorRecebido ? Math.max(0, Number(valorRecebido) - subtotal) : 0;

  const handleFinalizar = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = PAY_METHOD_MAP[payMethod] || "PIX";

      // Registra transação
      await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: subtotal,
          type: "INCOME",
          payment_method: method,
          description: itens.map(i => i.titulo || i.nome).join(", "),
          appointment_id: agendamento?.id || undefined,
        }),
      });

      // Desconta estoque dos produtos
      const produtoItens = itens.filter(i => i.tipo === "produto");
      await Promise.all(produtoItens.map(item =>
        apiFetch(`/inventory/${item.id}/stock`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: 1, action: "subtract" }),
        }).catch(() => {})
      ));

      // Atualiza status do agendamento para COMPLETED (se vier de um agendamento)
      if (agendamento?.id) {
        await apiFetch(`/appointments/${agendamento.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "COMPLETED" }),
        }).catch(() => {});
      }

      setDone(true);
    } catch (e) {
      setError(e.message || "Erro ao finalizar venda");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (done) return (
    <Modal open={true} onClose={onClose} title="Venda Finalizada!" width={420}>
      <div style={{ textAlign:"center", padding:"12px 0" }}>
        <div style={{ width:70, height:70, background:"rgba(16,185,129,0.15)", border:"2px solid #10B981",
          borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Icon name="check" size={32} color="#10B981"/>
        </div>
        <div style={{ fontSize:24, fontWeight:800, color:"#10B981", marginBottom:4 }}>{fmtCurrency(subtotal)}</div>
        <div style={{ color:"var(--muted)", fontSize:13, marginBottom:20 }}>Pagamento via {payMethod.toUpperCase()} confirmado</div>
        <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:16, marginBottom:20, textAlign:"left" }}>
          {itens.map((item,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}>
            <span>{item.titulo || item.nome}</span><span style={{color:"#C5A47E",fontWeight:600}}>{fmtCurrency(item.preco)}</span>
          </div>)}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="success" style={{ flex:1, justifyContent:"center" }}><Icon name="message-circle" size={14} color="#fff"/>WhatsApp</Btn>
          <Btn variant="secondary" style={{ flex:1, justifyContent:"center" }} onClick={onClose}>Fechar</Btn>
        </div>
      </div>
    </Modal>
  );

  return (
    <Modal open={open} onClose={onClose} title="Checkout — PDV" width={520}>
      {/* Itens do Checkout */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Resumo dos Itens</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto", marginBottom:12 }}>
          {itens.map((item,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px",
              background: item.tipo === "servico" ? "var(--surface2)" : "rgba(59,130,246,0.05)",
              border: item.tipo === "servico" ? "1px solid var(--border)" : "1px solid rgba(59,130,246,0.2)",
              borderRadius:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ background: item.tipo === "servico" ? "rgba(197,164,126,0.15)" : "rgba(59,130,246,0.15)", borderRadius:6, padding:6 }}>
                  <Icon name={item.tipo === "servico" ? "scissors" : "package"} size={14} color={item.tipo === "servico" ? "#C5A47E" : "#3B82F6"}/>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{item.titulo || item.nome}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>
                    {item.tipo === "servico" ? (payMethod === "plano" ? "Incluso no Plano 💎" : `${item.duracao || item.duration || "—"} min`) : "Produto"}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:14, fontWeight:700, color: item.tipo === "servico" ? "#C5A47E" : "#3B82F6",
                  textDecoration: (payMethod === "plano" && item.tipo === "servico") ? "line-through" : "none",
                  opacity: (payMethod === "plano" && item.tipo === "servico") ? 0.5 : 1 }}>
                   {fmtCurrency(item.preco)}
                </span>
                {(payMethod === "plano" && item.tipo === "servico") && <span style={{ fontSize:13, fontWeight:700, color:"#10B981" }}>R$ 0,00</span>}
                <Btn variant="ghost" size="sm" style={{padding:4}} onClick={()=>setItens(p=>p.filter((_,j)=>j!==i))}>
                  <Icon name="x" size={13} color="var(--muted)"/>
                </Btn>
              </div>
            </div>
          ))}
          {itens.length === 0 && <div style={{ textAlign:"center", padding:"20px 0", color:"var(--muted2)", fontSize:12 }}>Nenhum item adicionado</div>}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:10 }}>
          <Select disabled={loadingData}
            onChange={e=>{const s=servicos.find(x=>x.id===e.target.value);if(s)setItens(prev=>[...prev,{...s,tipo:"servico",preco:s.preco||s.price}]);e.target.value=""}}
            style={{ width:"100%" }} value="">
            <option value="">{loadingData ? "Carregando..." : "+ Adicionar serviço..."}</option>
            {servicos.map(s=><option key={s.id} value={s.id}>{s.titulo || s.title} — {fmtCurrency(s.preco || s.price)}</option>)}
          </Select>
          <Select disabled={loadingData}
            onChange={e=>{const p=produtos.find(x=>x.id===e.target.value);if(p)setItens(prev=>[...prev,{...p,tipo:"produto",titulo:p.name,preco:Number(p.price||0)}]);e.target.value=""}}
            style={{ width:"100%" }} value="">
            <option value="">{loadingData ? "Carregando..." : "+ Adicionar produto..."}</option>
            {produtos.map(p=><option key={p.id} value={p.id}>{p.name} — {fmtCurrency(p.price)}</option>)}
          </Select>
        </div>
      </div>

      {/* Resumo */}
      <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 14px", marginBottom:18 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--muted)", marginBottom:6 }}>
          <span>Subtotal</span><span>{fmtCurrency(subtotal)}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--muted)", marginBottom:6, paddingBottom:8, borderBottom:"1px solid var(--border)" }}>
          <span>Comissão do profissional ({Math.round(commissionRate * 100)}%)</span>
          <span style={{color:"#F59E0B"}}>{fmtCurrency(comissao)}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800 }}>
          <span>Total</span><span style={{ color:"#C5A47E" }}>{fmtCurrency(subtotal)}</span>
        </div>
      </div>

      {/* Payment */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Forma de Pagamento</div>
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {hasActivePlan && (
            <button onClick={()=>setPayMethod("plano")}
              style={{ flex:1.2, padding:"10px 0", borderRadius:8, border:"1px solid", cursor:"pointer", fontFamily:"inherit",
                fontSize:12, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                borderColor: payMethod==="plano"?"#C5A47E":"var(--border)",
                background: payMethod==="plano"?"rgba(197,164,126,0.12)":"transparent",
                color: payMethod==="plano"?"#C5A47E":"var(--muted)" }}>
              <Icon name="package" size={16} color={payMethod==="plano"?"#C5A47E":"var(--muted2)"}/>
              Plano VIP
            </button>
          )}
          {[["pix","Pix","credit-card"],["cartao","Cartão","credit-card"],["dinheiro","Dinheiro","dollar-sign"]].map(([id,label,icon])=>(
            <button key={id} onClick={()=>setPayMethod(id)}
              style={{ flex:1, padding:"10px 0", borderRadius:8, border:"1px solid", cursor:"pointer", fontFamily:"inherit",
                fontSize:12, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                borderColor: payMethod===id?"#C5A47E":"var(--border)",
                background: payMethod===id?"rgba(197,164,126,0.12)":"transparent",
                color: payMethod===id?"#C5A47E":"var(--muted)" }}>
              <Icon name={icon} size={16} color={payMethod===id?"#C5A47E":"var(--muted2)"}/>
              {label}
            </button>
          ))}
        </div>
        {payMethod==="plano" && (
          <div style={{ background:"rgba(16,185,129,0.05)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:12, display:"flex", alignItems:"center", gap:12 }}>
            <Icon name="check-circle" size={18} color="#10B981"/>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#10B981" }}>Uso de Assinatura Ativa</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>Os serviços serão cobertos pelo plano do cliente.</div>
            </div>
          </div>
        )}
        {payMethod==="pix" && <QRCode/>}
        {payMethod==="cartao" && (
          <div>
            <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>Parcelamento</div>
            <Select value={parcelas} onChange={e=>setParcelas(e.target.value)} style={{ width:"100%" }}>
              {[1,2,3,4,5,6].map(n=>(
                <option key={n} value={n}>{n}x de {fmtCurrency(subtotal/n)} {n===1?"(à vista)":"sem juros"}</option>
              ))}
            </Select>
          </div>
        )}
        {payMethod==="dinheiro" && (
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>Valor recebido</div>
              <Input value={valorRecebido} onChange={e=>setValorRecebido(e.target.value)} placeholder="0,00" icon="dollar-sign"/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>Troco</div>
              <div style={{ padding:"9px 12px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8,
                fontSize:14, fontWeight:700, color:troco>0?"#10B981":"var(--muted)" }}>
                {troco>0 ? fmtCurrency(troco) : "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:8, padding:"10px 12px", marginBottom:12, fontSize:13, color:"#EF4444" }}>
          {error}
        </div>
      )}

      <Divider style={{ margin:"0 0 14px" }}/>
      <Btn variant="success" style={{ width:"100%", justifyContent:"center", padding:"12px 0", fontSize:14 }}
        onClick={handleFinalizar} disabled={loading || itens.length === 0}>
        {loading ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", marginRight:8 }}/> Processando...</>
          : <><Icon name="check" size={16} color="#fff"/>Finalizar Venda — {fmtCurrency(subtotal)}</>}
      </Btn>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </Modal>
  );
};

Object.assign(window, { CheckoutModal });
