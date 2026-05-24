import type React from 'react';
import type { Option } from '../../types';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[]; error?: string };

export function Select({ label, options, error, className = '', ...props }: Props) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <select className={`mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus:border-enosa-500 focus:ring-4 focus:ring-enosa-500/10 ${className}`} {...props}>
        <option value="">Seleccione...</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
