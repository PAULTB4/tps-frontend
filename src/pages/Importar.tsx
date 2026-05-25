import { FormEvent, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { api } from '../services/api';

export function Importar() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage('');
    const payload = new FormData();
    payload.append('file', file);
    try {
      const { data } = await api.post('/importar', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setMessage('CSV procesado correctamente.');
    } catch {
      setMessage('No se pudo procesar el CSV.');
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setFile(null);
    setResult(null);
    setMessage('');
  }

  return (
    <div className="importar-page">
      <div className="importar-header">
        <div>
          <h2>Importar dataset CSV</h2>
          <p>Carga masiva de registros desde archivo CSV.</p>
        </div>
      </div>

      <div className="importar-uploadCard">
        <form onSubmit={onSubmit}>
          <div className="importar-fileField">
            <Input
              label="Archivo CSV"
              type="file"
              accept=".csv"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="importar-fileName">
                Archivo seleccionado: <strong>{file.name}</strong>
              </p>
            )}
          </div>

          <div className="importar-actions">
            <Button disabled={loading} className="importar-submitButton">
              {loading ? 'Procesando...' : 'Subir CSV'}
            </Button>
            {result && (
              <Button type="button" variant="secondary" onClick={clearResults} className="importar-clearButton">
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </div>

      {message && (
        <Toast type={message.startsWith('No') ? 'error' : 'success'} message={message} />
      )}

      {result && (
        <div className="importar-results">
          <Card
            title="Total registros"
            value={result.totalRegistros ?? 0}
          />
          <Card
            title="Registros válidos"
            value={result.registrosValidos ?? 0}
          />
          <Card
            title="Registros con error"
            value={result.registrosError ?? 0}
            accent
          />
        </div>
      )}
    </div>
  );
}
