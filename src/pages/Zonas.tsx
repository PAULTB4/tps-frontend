import { EntityForm, EntityList } from './shared/EntityTools';
import { estadoOptions } from '../utils/format';

const fields = [
  { name: 'departamento', label: 'Departamento', required: true }, { name: 'provincia', label: 'Provincia', required: true }, { name: 'distrito', label: 'Distrito', required: true }, { name: 'nombreZona', label: 'Nombre de zona', required: true }, { name: 'codigoZona', label: 'Código de zona', required: true }, { name: 'estado', label: 'Estado', required: true, options: estadoOptions },
];
export function Zonas() { return <EntityList title="Zonas operativas" resource="zonas" createPath="/zonas/nueva" columns={[{ header: 'Código', accessor: 'codigoZona' }, { header: 'Zona', accessor: 'nombreZona' }, { header: 'Departamento', accessor: 'departamento' }, { header: 'Provincia', accessor: 'provincia' }, { header: 'Distrito', accessor: 'distrito' }, { header: 'Estado', accessor: 'estado' }]} />; }
export function ZonaForm() { return <EntityForm title="Nueva zona operativa" resource="zonas" fields={fields} />; }
