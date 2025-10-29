import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import axios from 'axios';
import { type User } from '../contexts/AuthContextType';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockAxios = axios as any;

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAxios.get.mockResolvedValue({ data: [] });
  });

  it('should render login form by default', () => {
    renderWithProviders();

    expect(screen.getByPlaceholderText('EMAIL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PASSWORD')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it('should switch to registration form when clicking sign up', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const signUpButton = screen.getByText('Sign up');
    await user.click(signUpButton);

    expect(screen.getByPlaceholderText('NAME')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('EXTERNAL ID (OPTIONAL)')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
  });

  it('should allow typing in email field', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const emailInput = screen.getByPlaceholderText('EMAIL');
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should allow typing in password field', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should fetch tenants when switching to registration', async () => {
    const mockTenants = [
      { id: 'tenant-1', name: 'Tenant 1' },
      { id: 'tenant-2', name: 'Tenant 2' },
    ];

    mockAxios.get.mockResolvedValue({ data: mockTenants });

    const user = userEvent.setup();
    renderWithProviders();

    const signUpButton = screen.getByText('Sign up');
    await user.click(signUpButton);

    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tenants'
      );
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockRejectedValue(new Error('Login failed'));

    renderWithProviders();

    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const submitButton = screen.getByText('Sign in');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Oops... authentication failed. Please try again.')
      ).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders();

    const emailInput = screen.getByPlaceholderText('EMAIL');
    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    const submitButton = screen.getByText('Sign in');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show required validation for email field', () => {
    renderWithProviders();

    const emailInput = screen.getByPlaceholderText('EMAIL');
    expect(emailInput).toBeRequired();
  });

  it('should show required validation for password field', () => {
    renderWithProviders();

    const passwordInput = screen.getByPlaceholderText('PASSWORD');
    expect(passwordInput).toBeRequired();
  });
});

