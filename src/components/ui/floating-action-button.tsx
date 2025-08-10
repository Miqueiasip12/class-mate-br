import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({ 
  children, 
  className, 
  size = 'md',
  ...props 
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  return (
    <button
      className={cn(
        "fixed bottom-24 right-4 z-40",
        "bg-gradient-primary text-primary-foreground",
        "rounded-full shadow-button hover:shadow-elevated",
        "flex items-center justify-center",
        "transition-all duration-200 hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children || <Plus className="w-6 h-6" />}
    </button>
  );
}