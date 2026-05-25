import type React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
};

export function Button({ className = '', variant = 'primary', icon, children, ...props }: Props) {
  const variants = {
    primary: 'bg-enosa-500 text-white hover:bg-enosa-700 shadow-sm',
    secondary: 'bg-white text-enosa-500 border border-stitch-outline-variant hover:bg-stitch-surface-container-low',
    danger: 'bg-stitch-error text-white hover:bg-stitch-error/90',
  };
  return (
    <button 
      className={`flex justify-center items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:opacity-50 ${variants[variant]} ${className}`} 
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
    </button>
  );
}
