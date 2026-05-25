import type React from 'react';
import type { Option } from '../../types';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[]; error?: string };

export function Select({ label, options, error, className = '', ...props }: Props) {
  return (
    <label className="block w-full text-[12px] font-semibold tracking-wider text-stitch-on-surface uppercase">
      {label}
      <select
        className={`mt-1.5 block w-full px-3 py-[10px] bg-stitch-surface-container-lowest border border-stitch-outline-variant rounded-lg text-sm text-stitch-on-surface focus:ring-2 focus:ring-stitch-primary focus:outline-none transition-shadow normal-case font-normal ${className}`}
        {...props}
      >
        {!options.some((o) => o.value === '') && (
          <option value="">Seleccione...</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-stitch-error normal-case font-normal">{error}</span>}
    </label>
  );
}
