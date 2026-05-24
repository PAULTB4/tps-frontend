import type React from 'react';
import { Button } from './Button';

type Props = { open: boolean; title: string; onClose: () => void; children: React.ReactNode };

export function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-enosa-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black text-enosa-950">{title}</h2><Button variant="secondary" onClick={onClose}>Cerrar</Button></div>
        {children}
      </div>
    </div>
  );
}
