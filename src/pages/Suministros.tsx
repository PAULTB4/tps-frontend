import { EntityForm, EntityList } from './shared/EntityTools';
import { estadoOptions } from '../utils/format';

const tipoCliente = [{ label: 'Residencial', value: 'RESIDENCIAL' }, { label: 'Comercial', value: 'COMERCIAL' }, { label: 'Industrial', value: 'INDUSTRIAL' }, { label: 'Estatal', value: 'ESTATAL' }];
const fields = [{ name: 'codigoSuministro', label: 'Código suministro', required: true }, { name: 'tipoCliente', label: 'Tipo cliente', required: true, options: tipoCliente }, { name: 'direccionReferencial', label: 'Dirección referencial', required: true }, { name: 'zonaId', label: 'Zona ID', required: true }, { name: 'estado', label: 'Estado', required: true, options: estadoOptions }];
export function Suministros() { return <EntityList title="Suministros" resource="suministros" createPath="/suministros/nuevo" columns={[{ header: 'Código', accessor: 'codigoSuministro' }, { header: 'Tipo cliente', accessor: 'tipoCliente' }, { header: 'Dirección', accessor: 'direccionReferencial' }, { header: 'Zona', accessor: 'zonaId' }, { header: 'Estado', accessor: 'estado' }]} />; }
export function SuministroForm() { return <EntityForm title="Nuevo suministro" resource="suministros" fields={fields} />; }
