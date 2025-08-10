import { useState } from 'react';
import { CalendarDays, Users, Clock, BookOpen, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'chamada', label: 'Chamada', icon: CalendarDays },
  { id: 'turmas', label: 'Turmas', icon: Users },
  { id: 'cronograma', label: 'Cronograma', icon: Clock },
  { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
];

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Layout({ children, activeTab = 'chamada', onTabChange }: LayoutProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-nav-background border-b border-border px-4 py-3 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Menu className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Teacher Agent</h1>
          </div>
          <div className="w-8 h-8 bg-secondary rounded-full" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-nav-background border-t border-border px-4 py-2 shadow-elevated">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={cn(
                  "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-nav-active bg-primary/10"
                    : "text-nav-inactive hover:text-nav-active"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive ? "scale-110" : ""
                )} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}