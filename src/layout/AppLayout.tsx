import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { EventAlert } from '../components/ui/EventAlert';
import { getCurrentUserName } from '../services/api';

const nav = [
  ['/dashboard', 'dashboard', 'Dashboard'],
  ['/zonas', 'location_on', 'Zonas Operativas'],
  ['/suministros', 'electrical_services', 'Suministros'],
  ['/medidores', 'speed', 'Medidores'],
  ['/lecturas', 'grid_view', 'Lecturas'],
  ['/importar', 'file_upload', 'Importar Dataset'],
  ['/reportes', 'bar_chart', 'Reportes'],
  ['/incidencias', 'report_problem', 'Incidencias'],
  ['/usuarios', 'group', 'Usuarios'],
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className={`app-shell ${sidebarOpen ? 'is-sidebar-open' : ''}`}>
      <button className="app-sidebarBackdrop" type="button" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />
      <aside className="app-sidebar">
        <div className="app-brand">
          <div className="app-brandMark"><span className="material-symbols-outlined icon-fill">bolt</span></div>
          <div>
            <p>SISCON-ENOSA</p>
            <span>Gestión de Consumo</span>
          </div>
        </div>
        <nav className="app-nav">
          {nav.map(([to, icon, label]) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `app-navLink ${isActive ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <footer className="app-sidebarFooter">
          <div className="app-sidebarUser">
            <span>AD</span>
            <div>
              <strong>{getCurrentUserName()}</strong>
              <small>Administrador</small>
            </div>
          </div>
          <div className="app-sidebarFooterActions">
            <button type="button" aria-label="Notificaciones">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button type="button" aria-label="Configuración">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </footer>
      </aside>
      <main className="app-main">
        <header className="app-topbar">
          <button className="app-menuButton" type="button" aria-label="Abrir menú" onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="app-search"><span className="material-symbols-outlined">search</span><span>Buscar en SISCON...</span></div>
        </header>
        <div className="app-content">
          <EventAlert />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
