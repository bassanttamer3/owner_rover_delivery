import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, X, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

const Header = () => {
  const navigate = useNavigate(); 
  const { isSidebarOpen, toggleSidebar, isDarkMode, toggleDarkMode } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between h-full px-6">
        {/* Floating Sidebar Toggle Button - Top Left */}
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-xl border-2 border-primary bg-background flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-primary" />
          ) : (
            <>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
              <div className="w-4 h-0.5 bg-primary rounded-full"></div>
            </>
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg shadow-md">
            <span className="text-primary-foreground font-bold text-lg">OR</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Owner Rover Delivery</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rovers, orders..."
              className="pl-10 bg-muted/50 border-border focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl border-2 border-primary bg-background flex items-center justify-center hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-primary" />
            ) : (
              <Moon className="w-5 h-5 text-primary" />
            )}
          </button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
              3
            </Badge>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')} 
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
