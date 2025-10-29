import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthContext } from '../contexts/AuthContextType';
import { type User } from '../contexts/AuthContextType';

const mockUser: User = {
  id: 'user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  tenantId: 'tenant-id',
  externalId: 'external-id',
};

const mockAuthContextValue = {
  user: mockUser,
  token: 'mock-token',
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuthContextValue}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.loading).toBe(false);
    expect(result.current.login).toBeDefined();
    expect(result.current.register).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });

  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderHook(() => useAuth());
      // If we get here, the hook didn't throw, which is unexpected
      expect.fail('Expected useAuth to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'useAuth must be used within an AuthProvider'
      );
    }

    consoleSpy.mockRestore();
  });

  it('should allow calling login function', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={{ ...mockAuthContextValue, login: loginMock }}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.login('test@example.com', 'password123');

    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should allow calling register function', async () => {
    const registerMock = vi.fn().mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={{ ...mockAuthContextValue, register: registerMock }}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.register(
      'Test User',
      'test@example.com',
      'password123',
      'tenant-id',
      'external-id'
    );

    expect(registerMock).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'password123',
      'tenant-id',
      'external-id'
    );
  });

  it('should allow calling logout function', () => {
    const logoutMock = vi.fn();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={{ ...mockAuthContextValue, logout: logoutMock }}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    result.current.logout();

    expect(logoutMock).toHaveBeenCalled();
  });
});

