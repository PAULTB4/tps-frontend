import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { getToken } from './services/api';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Zonas, ZonaForm } from './pages/Zonas';
import { Suministros, SuministroForm } from './pages/Suministros';
import { Medidores, MedidorForm } from './pages/Medidores';
import { Lecturas, LecturaForm } from './pages/Lecturas';
import { Importar } from './pages/Importar';
import { Reportes } from './pages/Reportes';
import { Incidencias } from './pages/Incidencias';

function PrivateRoute() { return getToken() ? <AppLayout /> : <Navigate to="/login" replace />; }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/zonas" element={<Zonas />} /><Route path="/zonas/nueva" element={<ZonaForm />} />
        <Route path="/suministros" element={<Suministros />} /><Route path="/suministros/nuevo" element={<SuministroForm />} />
        <Route path="/medidores" element={<Medidores />} /><Route path="/medidores/nuevo" element={<MedidorForm />} />
        <Route path="/lecturas" element={<Lecturas />} /><Route path="/lecturas/nueva" element={<LecturaForm />} />
        <Route path="/importar" element={<Importar />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/incidencias" element={<Incidencias />} />
      </Route>
      <Route path="*" element={<Navigate to={getToken() ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
