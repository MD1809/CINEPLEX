import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121317] text-slate-100 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
