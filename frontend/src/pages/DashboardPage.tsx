import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/logo.svg';

interface Tenant {
  name: string;
  logo?: string;
}

interface Claim {
  id: string;
  identificationNumber: string;
  status: 'OPEN' | 'IN_REVIEW' | 'CLOSED';
  data: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tenant, setTenant] = useState<Tenant>({ name: '', logo: '' });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const tenantResponse = await axios.get(
        `http://localhost:3000/api/v1/tenants/${user?.tenantId}`
      );
      const claimsResponse = await axios.get(
        'http://localhost:3000/api/v1/claims'
      );
      setTenant(tenantResponse.data);
      setClaims(claimsResponse.data);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                {tenant?.name && tenant?.logo ? (
                  <img
                    src={`data:image/png;base64,${tenant.logo}`}
                    alt={tenant.name}
                    className="h-9 w-9 object-cover mr-2"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={Logo}
                    alt="LIME Logo"
                    className="h-9 w-9 object-cover mr-2"
                  />
                )}
                <h1 className="text-xl font-semibold text-gray-900">
                  <span className={`text-gray-400`}>
                    {tenant?.name || 'LIME'} • Claims
                  </span>{' '}
                  | Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-bold">{user?.name}</span>
              </span>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 uppercase cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Claims</h2>
            <Link
              to="/claim"
              className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
            >
              New Claim
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No claims yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first claim.
              </p>
              <Link
                to="/claim"
                className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
              >
                Create Claim
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-300 overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {claims.map(claim => (
                  <li key={claim.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="text-left space-y-1">
                            <p className="text-sm font-mono font-medium text-teal-600">
                              {claim.identificationNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(claim.createdAt).toLocaleDateString()}{' '}
                              {new Date(claim.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right space-y-2">
                            <div
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                claim.status
                              )}`}
                            >
                              {claim.status.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-500">
                              Updated at{' '}
                              {new Date(claim.updatedAt).toLocaleDateString()}{' '}
                              {new Date(claim.updatedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
