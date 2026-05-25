import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Toast } from '../../components/ui/Toast';
import { crudService } from '../../services/crud';
import { useAsync } from '../../hooks/useAsync';
import type { Option, TableColumn } from '../../types';

export type Field = { name: string; label: string; type?: string; required?: boolean; options?: Option[] };

export function EntityList({ title, resource, createPath, columns }: { title: string; resource: string; createPath: string; columns: TableColumn<any>[] }) {
  const [q, setQ] = useState('');
  const { data, loading, error } = useAsync<any[]>(() => crudService(resource).list(q ? { q } : undefined), [resource, q]);
  return <div className="space-y-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold text-copper">Gestión operativa</p><h2 className="serif text-4xl font-bold text-enosa-950">{title}</h2></div><Link to={createPath}><Button>Nuevo registro</Button></Link></div><div className="rounded-3xl bg-white p-4 shadow-panel"><Input label="Filtro rápido" placeholder="Buscar por código, nombre o estado" value={q} onChange={(e) => setQ(e.target.value)} /></div>{error && <Toast type="error" message={error} />}<Table loading={loading} data={data ?? []} columns={columns} /></div>;
}

export function EntityForm({ title, resource, fields, initial = {} }: { title: string; resource: string; fields: Field[]; initial?: Record<string, string> }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage('');
    try { await crudService(resource).create(form); setMessage('Registro guardado correctamente.'); setTimeout(() => navigate(`/${resource}`), 500); } catch { setMessage('No se pudo guardar. Revisá los datos o la API.'); } finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="zonas-formPage">
      <div className="zonas-formHeader">
        <div>
          <p>Nuevo registro territorial</p>
          <h2>{title}</h2>
          <span>Complete la ubicación y el código operativo de la zona.</span>
        </div>
      </div>

      <div className="zonas-formCard">
        {fields.map((field) => field.options ? (
          <Select
            key={field.name}
            label={field.label}
            required={field.required}
            options={field.options}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        ) : (
          <Input
            key={field.name}
            label={field.label}
            type={field.type ?? 'text'}
            required={field.required}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        ))}
      </div>

      {message && <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />}

      <div className="zonas-formActions">
        <Button disabled={loading} className="zonas-applyButton">{loading ? 'Guardando...' : 'Guardar zona'}</Button>
        <Button type="button" variant="secondary" className="zonas-clearButton" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
