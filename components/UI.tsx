

import React from 'react';
import * as Icons from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, glow = false, ...props }) => {
  return (
    <div 
      className={`bg-surface border border-white/10 rounded-lg p-6 transition-all duration-300 ${glow ? 'shadow-lg shadow-primary/10' : ''} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-3">
          {title && <h3 className="text-lg font-display font-bold text-text">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export const Button = ({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) => {
  const base = "font-sans font-semibold text-sm px-5 py-2.5 rounded-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-background hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-surface border border-white/20 text-text hover:bg-white/10 focus:ring-white/30",
    danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger",
    ghost: "bg-transparent text-textMuted hover:text-text hover:bg-white/5 focus:ring-white/30"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, className = '', containerClassName = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; containerClassName?: string }) => (
  <div className={`space-y-2 ${containerClassName}`}>
    {label && <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1">
      {label}
    </label>}
    <input 
      className={`w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-textMuted/50 ${className}`}
      {...props}
    />
  </div>
);

export const Textarea = ({ label, className = '', containerClassName = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; containerClassName?: string }) => (
  <div className={`space-y-2 ${containerClassName}`}>
    {label && <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1">
      {label}
    </label>}
    <textarea 
      className={`w-full bg-background border border-white/20 rounded-md px-4 py-3 text-text font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-textMuted/50 custom-scrollbar resize-y ${className}`}
      {...props}
    />
  </div>
);

export const SwitchToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/10">
    <span className="font-sans font-medium text-text text-sm">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 flex items-center rounded-full border-2 border-transparent transition-all ${checked ? 'bg-primary' : 'bg-surface'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mx-0.5 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

// FIX: Changed Badge to be a React.FC to correctly handle props like 'key' in lists.
export const Badge: React.FC<{ children?: React.ReactNode, color?: string }> = ({ children, color = 'primary' }) => {
  const style = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    surface: 'bg-surface text-textMuted border-white/10',
  }[color] || 'bg-surface text-textMuted border-white/10';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-sans font-bold border ${style} inline-block uppercase tracking-wider`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-surface border border-white/10 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface/50">
          <h3 className="font-display font-bold text-xl text-text">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-transparent border-2 border-transparent text-textMuted hover:text-text hover:bg-white/10 flex items-center justify-center transition-colors"><Icons.X size={20} /></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};