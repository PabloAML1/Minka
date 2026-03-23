import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  return (
    <div className="app-container">
      <header className="header backdrop-blur-md">
        <div className="container flex items-center justify-between py-2">
          <Link href="/dashboard" className="logo">
            <span className="font-display font-black text-2xl tracking-tighter flex items-center gap-2 text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              MINKA
            </span>
          </Link>
          <nav className="nav-links flex gap-6">
            <Link href="/dashboard" className="font-semibold text-sm uppercase tracking-widest text-muted hover:text-primary transition-colors">
              Portafolio
            </Link>
          </nav>
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
