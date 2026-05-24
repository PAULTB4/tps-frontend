import { Table } from '../components/ui/Table';
import { Toast } from '../components/ui/Toast';
import { crudService } from '../services/crud';
import { useAsync } from '../hooks/useAsync';

export function Incidencias() {
  const { data, loading, error } = useAsync<any[]>(() => crudService('incidencias').list(), []);
  return <div className="space-y-5"><div><p className="text-sm font-bold text-copper">Control de calidad</p><h2 className="serif text-4xl font-bold text-enosa-950">Incidencias</h2></div>{error && <Toast type="error" message={error} />}<Table loading={loading} data={data ?? []} columns={[{ header: 'Tipo', accessor: 'tipo' }, { header: 'Descripción', accessor: 'descripcion' }, { header: 'Nivel', accessor: 'nivel' }, { header: 'Estado', accessor: 'estado' }, { header: 'Fecha', accessor: 'fecha' }]} /></div>;
}
