import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "font-bold border-2 border-grit-dark transition-all duration-200 flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-grit-primary text-grit-dark hover:bg-grit-secondary shadow-grit",
    secondary: "bg-grit-white text-grit-dark hover:bg-gray-100 shadow-grit",
    outline: "bg-transparent text-grit-dark border-grit-dark hover:bg-gray-200",
    danger: "bg-red-400 text-white border-red-900 hover:bg-red-500 shadow-grit"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};