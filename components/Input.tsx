import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-grit-dark font-bold mb-1 text-sm uppercase tracking-wider">{label}</label>}
      <input 
        className={`w-full bg-grit-white border-2 border-grit-dark p-3 focus:outline-none focus:ring-2 focus:ring-grit-primary transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-grit-dark font-bold mb-1 text-sm uppercase tracking-wider">{label}</label>}
      <textarea 
        className={`w-full bg-grit-white border-2 border-grit-dark p-3 focus:outline-none focus:ring-2 focus:ring-grit-primary transition-all ${className}`}
        {...props}
      />
    </div>
  );
};