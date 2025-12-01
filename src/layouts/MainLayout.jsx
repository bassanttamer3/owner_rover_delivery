import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const { isSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <Sidebar />
      <main
        className={cn(
          'pt-16 pb-8 px-8 transition-all duration-300',
          isSidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
