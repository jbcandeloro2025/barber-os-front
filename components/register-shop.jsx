import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterShop = () => {
  const [shopName, setShopName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch("/shops/register", {
        method: "POST",
        body: { shopName, ownerName, email, password },
      });
      
      // Salva dados básicos (o token é gerenciado via cookie HttpOnly agora)
      if (data.shop?.id) setShopId(data.shop.id);
      
      // Redireciona para o admin
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Falha ao registrar barbearia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#C5A47E,#8B6342)", borderRadius:14,
            display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
            <Icon name="scissors" size={24} color="#0F1115"/>
          </div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4, color: "var(--text)" }}>Comece agora</h1>
          <p style={{ color:"var(--muted)", fontSize:14 }}>Crie sua conta e profissionalize sua barbearia</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16, background: "var(--surface)", padding: 24, borderRadius: 16, border: "1px solid var(--border)" }}>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Nome da Barbearia</label>
            <Input value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="Ex: Studio Rafael" icon="home" required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Seu Nome Completo</label>
            <Input value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="Como quer ser chamado" icon="user" required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>E-mail</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com" icon="mail" required/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--muted)", fontWeight:600, display:"block", marginBottom:6 }}>Senha</label>
            <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Mínimo 6 caracteres" icon="lock" required/>
          </div>

          {error && (
            <div style={{ background:"#EF444415", border:"1px solid #EF444440", borderRadius:8, padding:"10px 12px", fontSize:13, color:"#EF4444" }}>
              {error}
            </div>
          )}

          <Btn variant="primary" type="submit" disabled={loading} style={{ justifyContent:"center", padding:"12px 0", fontSize:14, marginTop:8 }}>
            {loading ? "Criando sua conta..." : "Criar Barbearia"}
          </Btn>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Já tem uma conta? <Link to="/admin" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Entrar no painel</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterShop;
