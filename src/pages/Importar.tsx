import { FormEvent, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { api } from '../services/api';

export function Importar() {
  const [file, setFile] = useState<File | null>(null); const [result, setResult] = useState<any>(null); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  async function onSubmit(event: FormEvent) { event.preventDefault(); if (!file) return; setLoading(true); setMessage(''); const payload = new FormData(); payload.append('file', file); try { const { data } = await api.post('/importar', payload, { headers: { 'Content-Type': 'multipart/form-data' } }); setResult(data); setMessage('CSV procesado correctamente.'); } catch { setMessage('No se pudo procesar el CSV.'); } finally { setLoading(false); } }
  return <form onSubmit={onSubmit} className="space-y-5"><div><p className="text-sm font-bold text-copper">Carga masiva</p><h2 className="serif text-4xl font-bold text-enosa-950">Importar dataset CSV</h2></div><div className="rounded-3xl bg-white p-6 shadow-panel"><Input label="Archivo CSV" type="file" accept=".csv" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><Button className="mt-4" disabled={loading}>{loading ? 'Procesando...' : 'Subir CSV'}</Button></div>{message && <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />}{result && <div className="grid gap-4 md:grid-cols-3"><Card title="Total registros" value={result.totalRegistros ?? 0} /><Card title="Registros válidos" value={result.registrosValidos ?? 0} /><Card title="Registros con error" value={result.registrosError ?? 0} accent /></div>}</form>;
}
