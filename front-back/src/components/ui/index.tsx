"use client";

import { ReactNode } from 'react';

export function Card({ children, className = "", style = {} }: { children: ReactNode, className?: string, style?: any }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }: any) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ProgressBar({ label, current, max, color = "var(--secondary)" }: { label: string, current: number, max: number, color?: string }) {
  const percentage = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-muted uppercase tracking-wider">{label}</span>
        <span className="font-display font-bold text-lg" style={{ color: percentage > 100 ? 'var(--danger)' : 'var(--primary)' }}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out" 
          style={{ 
            width: `${percentage}%`, 
            background: percentage > 100 ? 'var(--danger)' : color 
          }}
        ></div>
      </div>
    </div>
  );
}

export function Badge({ children, variant = "info" }: { children: ReactNode, variant?: "success" | "warning" | "danger" | "info" }) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}
