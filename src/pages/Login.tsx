import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/ui/Toast';
import { login } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas o API no disponible.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-prototype-page">
      <section className="login-prototype-shell" aria-label="Inicio de sesión SISCON-ENOSA">
        <div className="login-prototype-card">
          <header className="login-prototype-header">
            <div className="login-prototype-mark" aria-hidden="true">
              <span className="material-symbols-outlined icon-fill">electrical_services</span>
            </div>
            <h1>SISCON-ENOSA</h1>
            <p>Sistema TPS de Control de Consumo Eléctrico</p>
          </header>

          <form onSubmit={onSubmit} className="login-prototype-form">
            <label className="login-prototype-field">
              <span>Correo Electrónico</span>
              <div className="login-prototype-inputWrap">
                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                <input
                  type="email"
                  placeholder="usuario@enosa.com.pe"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>

            <label className="login-prototype-field">
              <span>Contraseña</span>
              <div className="login-prototype-inputWrap">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>

            <div aria-live="polite">{error && <Toast type="error" message={error} />}</div>

            <button className="login-prototype-button" type="submit" disabled={loading}>
              <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              {!loading && <span className="material-symbols-outlined" aria-hidden="true">login</span>}
            </button>

            <div className="login-prototype-divider" />

            <div className="login-prototype-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <span>Acceso para administrador, operador y analista</span>
            </div>
          </form>
        </div>

        <p className="login-prototype-footer">© 2024 SISCON-ENOSA. Plataforma de Alta Disponibilidad.</p>
      </section>
    </main>
  );
}
