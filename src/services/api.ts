import axios from 'axios';

export const TOKEN_KEY = 'siscon_enosa_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  const token = data.accessToken ?? data.token;
  if (!token) throw new Error('La API no devolvió un token JWT.');
  localStorage.setItem(TOKEN_KEY, token);
  const fullName = [data.user?.nombres, data.user?.apellidos].filter(Boolean).join(' ');
  localStorage.setItem('siscon_enosa_user', fullName || data.user?.nombre || email);
  return data;
}

export async function register(payload: unknown) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('siscon_enosa_user');
}

export function getCurrentUserName() {
  return localStorage.getItem('siscon_enosa_user') ?? 'Operador ENOSA';
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
