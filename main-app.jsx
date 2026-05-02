import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Splash from './components/splash';
import AdminApp from './components/admin-app';
import BookingApp from './components/booking-app';
import RegisterShop from './components/register-shop';

const getSubdomain = () => {
  const hostname = window.location.hostname; // ex: meubarber.jbcode.cloud
  const parts = hostname.split('.');
  // jbcode.cloud → 2 partes → raiz
  // barberos.jbcode.cloud → 3 partes → subdomain = barberos
  // meubarber.jbcode.cloud → 3 partes → subdomain = meubarber
  if (parts.length >= 3) return parts[0];
  return null;
};

const MainApp = () => {
  const subdomain = getSubdomain();

  // {slug}.jbcode.cloud → booking da barbearia
  if (subdomain && subdomain !== 'barberos' && subdomain !== 'www') {
    return <BookingApp slug={subdomain} />;
  }

  // barberos.jbcode.cloud → painel admin
  if (subdomain === 'barberos') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/shops/register" element={<RegisterShop />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // jbcode.cloud → landing page (em branco por enquanto, substituir pela landing)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/shops/register" element={<RegisterShop />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainApp;
