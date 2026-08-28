import React from 'react';
import { Outlet } from 'react-router-dom';
import { StaffSidebar } from './StaffSidebar';

interface StaffLayoutProps {
  children?: React.ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-[#0d1117] text-slate-100 overflow-hidden">
      {/* Left Navigation Sidebar */}
      <StaffSidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {children || <Outlet />}
      </div>
    </div>
  );
};
