import React from 'react';
import { Link } from 'react-router-dom';

const Splash = () => {
  return (
    <div style={{
      background: "#0F1115",
      color: "#FFFFFF",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      margin: 0
    }}>
      <h1 style={{ marginBottom: "2rem", color: "#C5A47E" }}>BarberOS</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <Link to="/admin" style={{
          padding: "1rem 2rem",
          background: "#1A1D24",
          color: "#FFFFFF",
          textDecoration: "none",
          borderRadius: "8px",
          border: "1px solid #2A2F3A",
          transition: "all 0.3s"
        }}>Painel Admin</Link>
        <Link to="/minha-barbearia" style={{
          padding: "1rem 2rem",
          background: "#1A1D24",
          color: "#FFFFFF",
          textDecoration: "none",
          borderRadius: "8px",
          border: "1px solid #2A2F3A",
          transition: "all 0.3s"
        }}>Agendamento (Demo)</Link>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <Link to="/shops/register" style={{ color: "var(--muted)", fontSize: 14, textDecoration: "none" }}>
          É dono de barbearia? <span style={{ color: "var(--primary)", fontWeight: 600 }}>Começar Agora</span>
        </Link>
      </div>
    </div>
  );
};

export default Splash;
