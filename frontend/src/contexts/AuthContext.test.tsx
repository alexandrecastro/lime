import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { type User } from './AuthContextType';

vi.mock('axios');

const mockAxios = axios as any;

const TestComponent = () => {
  const { user, token, login, register, logout, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{user.role}</div>
        </div>
      ) : (
        <div data-testid="no-user">No user</div>
      )}
      {token && <div data-testid="token">Token exists</div>}
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button
        onClick={() =>
          register('Test User', 'test@example.com', 'password', 'tenant-id')
        }
      >
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAxios.post.mockResolvedValue({
      data: {
        access_token: 'mock-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          tenantId: 'tenant-id',
          externalId: null,
        },
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should provide null user initially when no stored auth', async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('no-user')).toBeInTheDocument();
  });

  it('should restore user from localStorage on mount', () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      tenantId: 'tenant-id',
      externalId: null,
    };

    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithProvider();

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'test@example.com'
    );
    expect(screen.getByTestId('token')).toBeInTheDocument();
  });

  it('should handle login successfully', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/login',
        {
          email: 'test@example.com',
          password: 'password',
        }
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('should handle registration successfully', async () => {
    const user = userEvent.setup();
    mockAxios.post
      .mockResolvedValueOnce({ data: {} }) // Register response
      .mockResolvedValueOnce({
        data: {
          access_token: 'mock-token',
          user: {
            id: 'user-id',
            email: 'new@example.com',
            name: 'New User',
            role: 'user',
            tenantId: 'tenant-id',
            externalId: null,
          },
        },
      }); // Login response

    renderWithProvider();

    const registerButton = screen.getByText('Register');
    await user.click(registerButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/register',
        {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password',
          tenantId: 'tenant-id',
        }
      );
    });
  });

  it('should handle logout', async () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      tenantId: 'tenant-id',
      externalId: null,
    };

    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const user = userEvent.setup();
    renderWithProvider();

    expect(screen.getByTestId('user-email')).toBeInTheDocument();

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    expect(screen.getByTestId('no-user')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should set axios authorization header on login', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toBe(
        'Bearer mock-token'
      );
    });
  });

  it('should remove axios authorization header on logout', async () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      tenantId: 'tenant-id',
      externalId: null,
    };

    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    axios.defaults.headers.common['Authorization'] = 'Bearer stored-token';

    const user = userEvent.setup();
    renderWithProvider();

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  it('should handle login failure', async () => {
    mockAxios.post.mockRejectedValue(new Error('Login failed'));

    const ErrorTestComponent = () => {
      const { user, login } = useAuth();

      const handleLogin = async () => {
        try {
          await login('test@example.com', 'password');
        } catch {
          // Expected error - ignore it
        }
      };

      return (
        <div>
          {user ? (
            <div>
              <div data-testid="user-email">{user.email}</div>
            </div>
          ) : (
            <div data-testid="no-user">No user</div>
          )}
          <button onClick={handleLogin}>Login</button>
        </div>
      );
    };

    const { container } = render(
      <AuthProvider>
        <ErrorTestComponent />
      </AuthProvider>
    );

    const user = userEvent.setup();
    const loginButton = screen.getByText('Login');
    
    // Click the button - error will be caught in handleLogin
    await user.click(loginButton);
    
    // Wait for state to update
    await waitFor(() => {
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    // Verify login was attempted
    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'test@example.com',
        password: 'password',
      }
    );
  });
});

