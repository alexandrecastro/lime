import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/logo.svg';

interface Tenant {
  id: string;
  name: string;
}

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tenantId: '',
    externalId: '',
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tenants for the sign up form
    const fetchTenants = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/api/v1/tenants'
        );
        setTenants(response.data);
        if (response.data.length > 0) {
          setFormData({ ...formData, tenantId: response.data[0].id });
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      }
    };

    if (!isLogin) {
      fetchTenants();
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loggedInUser;
      if (isLogin) {
        await login(formData.email, formData.password);
        // Get the user data from localStorage after login
        loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      } else {
        await register(
          formData.name,
          formData.email,
          formData.password,
          formData.tenantId,
          formData.externalId || undefined
        );
        await login(formData.email, formData.password);
        loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      }

      // Redirect based on user role
      if (
        loggedInUser.role === 'admin' ||
        loggedInUser.role === 'super_admin'
      ) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch {
      setError('Oops... authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 mb-4">
              <img src={Logo} alt="LIME Logo" className="h-full w-full" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-teal-500">
              LIME • Claims
            </h2>
            <div className="text-center font-thin italic">
              If life gives you limes, make margaritas.
            </div>
          </div>
          <h2 className="text-center font-extrabold uppercase text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            {!isLogin && (
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  placeholder="NAME"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="EMAIL"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={
                  isLogin ? 'PASSWORD' : 'PASSWORD • MINIMUM 6 CHARACTERS'
                }
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <input
                    id="externalId"
                    name="externalId"
                    type="text"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                    placeholder="EXTERNAL ID (OPTIONAL)"
                    value={formData.externalId}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <select
                    id="tenantId"
                    name="tenantId"
                    required
                    value={formData.tenantId}
                    onChange={handleSelectChange}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="uppercase group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign in' : 'Sign up'}
            </button>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  tenantId: '',
                  externalId: '',
                });
              }}
              className="font-medium text-teal-600 hover:text-teal-500 cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
