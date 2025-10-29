import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
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

const renderWithRouter = (
  component: React.ReactElement,
  authValue = mockAuthContextValue
) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, loading: true }
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, user: null }
    );

    // Should redirect to login - content should not be visible
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow regular users to access non-admin routes', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Regular Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Regular Content')).toBeInTheDocument();
  });

  it('should redirect regular users when admin prop is true', () => {
    renderWithRouter(
      <ProtectedRoute admin>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should allow admin users to access admin routes', () => {
    const adminUser: User = { ...mockUser, role: 'admin' };

    renderWithRouter(
      <ProtectedRoute admin>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, user: adminUser }
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should allow super_admin users to access admin routes', () => {
    const superAdminUser: User = { ...mockUser, role: 'super_admin' };

    renderWithRouter(
      <ProtectedRoute admin>
        <div>Admin Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, user: superAdminUser }
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect non-super_admin users when superAdmin prop is true', () => {
    renderWithRouter(
      <ProtectedRoute superAdmin>
        <div>Super Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Super Admin Content')).not.toBeInTheDocument();
  });

  it('should allow super_admin users to access superAdmin routes', () => {
    const superAdminUser: User = { ...mockUser, role: 'super_admin' };

    renderWithRouter(
      <ProtectedRoute superAdmin>
        <div>Super Admin Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, user: superAdminUser }
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
  });

  it('should redirect admin (not super_admin) users when superAdmin prop is true', () => {
    const adminUser: User = { ...mockUser, role: 'admin' };

    renderWithRouter(
      <ProtectedRoute superAdmin>
        <div>Super Admin Content</div>
      </ProtectedRoute>,
      { ...mockAuthContextValue, user: adminUser }
    );

    expect(screen.queryByText('Super Admin Content')).not.toBeInTheDocument();
  });
});

