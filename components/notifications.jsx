
// Notifications — Log of sent messages (Evolution API)
const NotificationsCenter = ({ onClose }) => {
  const [status, setStatus] = React.useState(null);
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  React.useEffect(() => {
    apiFetch("/whatsapp/status")
      .then(data => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoadingStatus(false));
  }, []);

  // Log de mensagens ainda não tem endpoint — exibe placeholder informativo
  const notifications = [
    { id: 1, cliente: "Carlos Mendes", msg: "Lembrete: Seu horário amanhã às 09:00 está confirmado! ✂️", status: "sent", data: "Hoje, 14:20", tipo: "Lembrete" },
    { id: 2, cliente: "Bruno Ferreira", msg: "Olá Bruno! Notamos que faz 30 dias que não nos visita. Que tal um desconto de 10%? 🏷️", status: "sent", data: "Ontem, 10:15", tipo: "Fidelidade" },
    { id: 3, cliente: "André Oliveira", msg: "Pagamento do Plano VIP recebido com sucesso. Obrigado! 💎", status: "delivered", data: "Ontem, 09:00", tipo: "Cobrança" },
    { id: 4, cliente: "Felipe Santos", msg: "Sua assinatura expirou. Clique aqui para renovar.", status: "failed", data: "28 Abr, 16:30", tipo: "Aviso" },
  ];

  const connected = status?.status === "CONNECTED";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ width:"100%", maxWidth:450, background:"var(--surface)", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column",
        height:"100%", animation:"slideIn 0.22s ease-out" }}>

        <div style={{ padding:"20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:800 }}>Central de Notificações</h2>
            <p style={{ fontSize:12, color:"var(--muted)" }}>Log de mensagens enviadas via WhatsApp</p>
          </div>
          <Btn variant="ghost" size="sm" onClick={onClose} icon="x"/>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {notifications.map(n => (
              <Card key={n.id} style={{ padding:14, background: n.status==="failed" ? "rgba(239,68,68,0.03)" : "var(--surface)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ background: n.status==="failed" ? "var(--error)20" : "var(--success)20", padding:6, borderRadius:6 }}>
                      <Icon name="message-circle" size={14} color={n.status==="failed" ? "var(--error)" : "var(--success)"}/>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700 }}>{n.cliente}</span>
                  </div>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>{n.data}</span>
                </div>
                <p style={{ fontSize:13, color:"var(--text)", lineHeight:1.5, marginBottom:10 }}>{n.msg}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <Badge variant={n.tipo==="Cobrança"?"info":"default"}>{n.tipo}</Badge>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <Icon name={n.status==="failed"?"alert-circle":"check"} size={12} color={n.status==="failed"?"var(--error)":"var(--success)"}/>
                    <span style={{ fontSize:11, fontWeight:600, color: n.status==="failed"?"var(--error)":"var(--success)" }}>
                      {n.status==="failed"?"Erro no envio":n.status==="delivered"?"Entregue":"Enviado"}
                    </span>
                  </div>
                </div>
                {n.status==="failed" && (
                  <Btn variant="secondary" size="sm" style={{ width:"100%", marginTop:12, justifyContent:"center" }}>Tentar Novamente</Btn>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div style={{ padding:16, borderTop:"1px solid var(--border)", background:"var(--surface2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12 }}>
            <span style={{ color:"var(--muted)" }}>
              Status da API:{" "}
              {loadingStatus ? (
                <span style={{ color:"var(--muted)" }}>verificando...</span>
              ) : connected ? (
                <span style={{ color:"#10B981", fontWeight:700 }}>Conectado</span>
              ) : (
                <span style={{ color:"#EF4444", fontWeight:700 }}>Desconectado</span>
              )}
            </span>
            <span style={{ color:"var(--muted)" }}>
              {status?.status || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { NotificationsCenter });
