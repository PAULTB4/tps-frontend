import type React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: string;
};

export function Input({ label, error, icon, className = '', ...props }: Props) {
  return (
    <div className="w-full">
      <label className="block text-[12px] font-semibold tracking-wider text-stitch-on-surface uppercase mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-stitch-outline-variant text-lg">{icon}</span>
          </div>
        )}
        <input
          className={`block w-full ${
            icon ? 'pl-9' : 'px-3'
          } pr-3 py-[10px] bg-stitch-surface-container-lowest border border-stitch-outline-variant rounded-lg text-sm text-stitch-on-surface placeholder-stitch-outline-variant focus:ring-2 focus:ring-stitch-primary focus:outline-none transition-shadow ${
            props.readOnly ? 'bg-stitch-surface-container-high text-stitch-outline cursor-default border-transparent' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-stitch-error">{error}</span>}
    </div>
  );
}
