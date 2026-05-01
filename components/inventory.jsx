
// Inventory Component — Product & Stock Management
const Inventory = () => {
  const [items, setItems] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState(null);
  const [adjusting, setAdjusting] = React.useState({});

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/inventory");
      setItems(data.products || []);
    } catch (e) {
      setError(e.message || "Erro ao carregar estoque");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadProducts(); }, []);

  const filteredItems = items.filter(item =>
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        name:      fd.get("name"),
        price:     Number(fd.get("price")),
        stock:     Number(fd.get("stock")),
        min_stock: Number(fd.get("min_stock")),
        description: fd.get("description") || undefined,
      };

      if (editingItem) {
        const data = await apiFetch(`/inventory/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        setItems(prev => prev.map(i => i.id === editingItem.id ? data.product : i));
      } else {
        const data = await apiFetch("/inventory", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setItems(prev => [data.product, ...prev]);
      }

      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setSaveError(err.message || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const adjustStock = async (id, action) => {
    setAdjusting(prev => ({ ...prev, [id]: true }));
    try {
      const data = await apiFetch(`/inventory/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: 1, action }),
      });
      setItems(prev => prev.map(i => i.id === id ? data.product : i));
    } catch (e) {
      // se insuficiente, ignore silenciosamente
    } finally {
      setAdjusting(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div style={{ padding:"24px 20px", height:"100%", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>Estoque</h1>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Produtos e níveis de estoque</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" icon="refresh-cw" onClick={loadProducts}>Atualizar</Btn>
          <Btn variant="primary" icon="plus" onClick={() => { setEditingItem(null); setModalOpen(true); }}>Novo</Btn>
        </div>
      </div>

      {error && (
        <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
          <Icon name="alert-circle" size={16} color="#EF4444"/>
          <span style={{ fontSize:13, color:"#EF4444" }}>{error}</span>
          <Btn variant="ghost" size="sm" onClick={loadProducts} style={{ marginLeft:"auto" }}>Tentar novamente</Btn>
        </div>
      )}

      {/* Search */}
      <Card style={{ marginBottom:24, padding:"12px 16px" }}>
        <Input placeholder="Buscar produto..." icon="search" value={search} onChange={e => setSearch(e.target.value)}/>
      </Card>

      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"var(--muted)", fontSize:14 }}>Carregando...</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filteredItems.map(item => {
            const isLow = item.stock <= item.min_stock;
            const busy = adjusting[item.id];
            return (
              <Card key={item.id} style={{ padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                  <div style={{ background:"rgba(197,164,126,0.1)", borderRadius:10, padding:12, flexShrink:0, position:"relative" }}>
                    <Icon name="package" size={20} color="#C5A47E"/>
                    {isLow && (
                      <div style={{ position:"absolute", top:-4, right:-4, width:10, height:10, background:"#EF4444", borderRadius:"50%", border:"2px solid var(--surface)" }}/>
                    )}
                  </div>

                  <div style={{ flex:"1 1 200px" }}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{item.name}</div>
                    <div style={{ color:"var(--muted)", fontSize:12 }}>
                      {fmtCurrency(Number(item.price))}
                      {item.description ? ` · ${item.description}` : ""}
                    </div>
                    {isLow && (
                      <div style={{ fontSize:11, color:"#EF4444", marginTop:2, fontWeight:600 }}>⚠ Estoque baixo (mín: {item.min_stock})</div>
                    )}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                    <div style={{ textAlign:"center", padding:"0 10px" }}>
                      <div style={{ fontSize:11, color:"var(--muted2)", marginBottom:4, textTransform:"uppercase" }}>Estoque</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                        <button onClick={() => adjustStock(item.id, "subtract")} disabled={busy || item.stock === 0}
                          style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:4, width:28, height:28, color:"#fff", cursor:"pointer", opacity: busy||item.stock===0?0.5:1 }}>-</button>
                        <span style={{ fontSize:15, fontWeight:800, color: isLow?"#EF4444":"var(--text)", minWidth:20, textAlign:"center" }}>{item.stock}</span>
                        <button onClick={() => adjustStock(item.id, "add")} disabled={busy}
                          style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:4, width:28, height:28, color:"#fff", cursor:"pointer", opacity:busy?0.5:1 }}>+</button>
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:6 }}>
                      <Btn variant="ghost" size="sm" icon="edit" onClick={() => { setEditingItem(item); setModalOpen(true); }}/>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {filteredItems.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted2)" }}>
              <Icon name="package" size={40} color="var(--border)"/>
              <p style={{ marginTop:12 }}>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Novo/Editar */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); setSaveError(null); }}
        title={editingItem ? "Editar Produto" : "Cadastrar Novo Produto"} width={400}>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome do Produto</label>
            <Input name="name" defaultValue={editingItem?.name} required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Descrição</label>
            <Input name="description" defaultValue={editingItem?.description || ""} placeholder="Opcional"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Preço (R$)</label>
              <Input name="price" type="number" step="0.01" min="0" defaultValue={editingItem?.price || ""} required/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Qtd Inicial</label>
              <Input name="stock" type="number" min="0" defaultValue={editingItem?.stock ?? 0} required/>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Aviso Estoque Baixo</label>
            <Input name="min_stock" type="number" min="0" defaultValue={editingItem?.min_stock ?? 5} required/>
          </div>
          {saveError && <div style={{ fontSize:12, color:"#EF4444" }}>{saveError}</div>}
          <Divider style={{ margin:"8px 0" }}/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
            <Btn variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn variant="primary" type="submit" disabled={saving}>{saving?"Salvando...":"Salvar Produto"}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
};

Object.assign(window, { Inventory });
