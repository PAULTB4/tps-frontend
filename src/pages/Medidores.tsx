import { EntityForm, EntityList } from './shared/EntityTools';
import { estadoOptions } from '../utils/format';

const fields = [{ name: 'numeroMedidor', label: 'Número de medidor', required: true }, { name: 'suministroId', label: 'Suministro ID', required: true }, { name: 'marca', label: 'Marca', required: true }, { name: 'modelo', label: 'Modelo', required: true }, { name: 'fechaInstalacion', label: 'Fecha instalación', type: 'date', required: true }, { name: 'estado', label: 'Estado', required: true, options: estadoOptions }];
export function Medidores() { return <EntityList title="Medidores" resource="medidores" createPath="/medidores/nuevo" columns={[{ header: 'Número', accessor: 'numeroMedidor' }, { header: 'Suministro', accessor: 'suministroId' }, { header: 'Marca', accessor: 'marca' }, { header: 'Modelo', accessor: 'modelo' }, { header: 'Instalación', accessor: 'fechaInstalacion' }, { header: 'Estado', accessor: 'estado' }]} />; }
export function MedidorForm() { return <EntityForm title="Nuevo medidor" resource="medidores" fields={fields} />; }
