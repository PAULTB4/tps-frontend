import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockAxiosInstance = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  interceptors: { request: { use: vi.fn() }, response: { use: vi.fn((_, reject) => reject) } },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

import { login, logout, getToken, getCurrentUserName, TOKEN_KEY } from './api';

describe('API integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('login should POST /auth/login and store token + user name', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        accessToken: 'jwt-abc',
        user: { nombres: 'Juan', apellidos: 'Pérez' },
      },
    });

    await login('juan@test.com', 'secret');

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
      email: 'juan@test.com',
      password: 'secret',
    });
    expect(getToken()).toBe('jwt-abc');
    expect(getCurrentUserName()).toBe('Juan Pérez');
  });

  it('login should use nombre fallback when nombres/apellidos missing', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { token: 'jwt-xyz', user: { nombre: 'Admin' } },
    });

    await login('admin@test.com', 'pass');

    expect(getToken()).toBe('jwt-xyz');
    expect(getCurrentUserName()).toBe('Admin');
  });

  it('login should throw when token missing in response', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({ data: { user: {} } });

    await expect(login('x@y.com', 'p')).rejects.toThrow('La API no devolvió un token JWT.');
  });

  it('logout should clear localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'token');
    localStorage.setItem('siscon_enosa_user', 'User');

    logout();

    expect(getToken()).toBeNull();
    expect(getCurrentUserName()).toBe('Operador ENOSA');
  });

  it('getCurrentUserName should return default when no user stored', () => {
    expect(getCurrentUserName()).toBe('Operador ENOSA');
  });
});
