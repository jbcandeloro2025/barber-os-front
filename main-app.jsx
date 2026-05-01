import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Splash from './components/splash';
import AdminApp from './components/admin-app';
import BookingApp from './components/booking-app';
import RegisterShop from './components/register-shop';

const BookingWrapper = () => {
  const { slug } = useParams();
  return <BookingApp />;
};

const MainApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/shops/register" element={<RegisterShop />} />
        {/* Captura qualquer slug que não seja as rotas acima */}
        <Route path="/:slug" element={<BookingWrapper />} />
      </Routes>
    </BrowserRouter>
  );
};

export default MainApp;
