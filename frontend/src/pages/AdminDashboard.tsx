import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Logo from '../assets/logo.svg';

interface Tenant {
  name: string;
  logo?: string;
}

interface FieldConfig {
  id: string;
  type: 'STRING' | 'NUMBER' | 'AMOUNT' | 'DATE' | 'BOOLEAN' | 'FILE' | 'LIST';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface StepConfig {
  id: string;
  title: string;
  description?: string;
  fields: FieldConfig[];
}

interface AppConfig {
  version: string;
  color: string;
  claimForm: {
    steps: StepConfig[];
  };
}

const SyntaxHighlightedJSON: React.FC<{ json: unknown }> = ({ json }) => {
  const jsonString = JSON.stringify(json, null, 2);

  const highlightedJson = jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(?:[^"\\]|\\.)*"):\s*/g,
      '<span style="color: #4ec9b0;">$1</span>: '
    )
    .replace(
      /:\s*("(?:[^"\\]|\\.)*")/g,
      ': <span style="color: #ce9178;">$1</span>'
    )
    .replace(
      /\b(true|false|null)\b/g,
      '<span style="color: #569cd6;">$1</span>'
    )
    .replace(/\b\d+\b/g, '<span style="color: #b5cea8;">$&</span>');

  return (
    <pre
      className="text-sm text-left font-mono"
      style={{ color: '#9cdcfe', margin: 0 }}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
    </pre>
  );
};

interface Claim {
  id: string;
  identificationNumber: string;
  status: 'OPEN' | 'IN_REVIEW' | 'CLOSED';
  data: Record<string, unknown>;
  user: {
    id: string;
    name: string;
    email: string;
    externalId: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tenant, setTenant] = useState<Tenant>({ name: '', logo: '' });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'claims' | 'config' | 'steps' | 'fields' | 'widget'
  >('claims');
  const [editingConfig, setEditingConfig] = useState(false);
  const [configText, setConfigText] = useState('');
  const [editingStep, setEditingStep] = useState<StepConfig | null>(null);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [showStepForm, setShowStepForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [draggedField, setDraggedField] = useState<{
    stepId: string;
    fieldId: string;
  } | null>(null);
  const [dragOverStep, setDragOverStep] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tenantResponse, claimsResponse, configResponse] =
        await Promise.all([
          axios.get(`http://localhost:3000/api/v1/tenants/${user?.tenantId}`),
          axios.get('http://localhost:3000/api/v1/claims'),
          axios.get('http://localhost:3000/api/v1/config'),
        ]);

      setTenant(tenantResponse.data);
      setClaims(claimsResponse.data);
      setConfig(configResponse.data);
      setConfigText(JSON.stringify(configResponse.data, null, 2));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (
    claimId: string,
    newStatus: 'OPEN' | 'IN_REVIEW' | 'CLOSED'
  ) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/claims/${claimId}`, {
        status: newStatus,
      });

      setClaims(
        claims.map(claim =>
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        )
      );
    } catch (error) {
      console.error('Failed to update claim status:', error);
    }
  };

  const saveConfig = async () => {
    try {
      const newConfig = JSON.parse(configText);
      await axios.post('http://localhost:3000/api/v1/config', newConfig);
      setConfig(newConfig);
      setEditingConfig(false);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Invalid JSON configuration');
    }
  };

  // Helper function to save config to server
  const saveConfigToServer = async (configToSave: AppConfig) => {
    try {
      await axios.post('http://localhost:3000/api/v1/config', configToSave);
      console.log('Configuration auto-saved successfully');
    } catch (error) {
      console.error('Failed to auto-save configuration:', error);
    }
  };

  const addStep = async (step: Omit<StepConfig, 'id'>) => {
    if (!config) return;

    const newStep: StepConfig = {
      ...step,
      id: `step-${Date.now()}`,
    };

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: [...config.claimForm.steps, newStep],
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    setShowStepForm(false);
    await saveConfigToServer(updatedConfig);
  };

  const updateStep = async (
    stepId: string,
    updatedStep: Partial<StepConfig>
  ) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.map(step =>
          step.id === stepId ? { ...step, ...updatedStep } : step
        ),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    setEditingStep(null);
    await saveConfigToServer(updatedConfig);
  };

  const deleteStep = async (stepId: string) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.filter(step => step.id !== stepId),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    await saveConfigToServer(updatedConfig);
  };

  const addField = async (stepId: string, field: Omit<FieldConfig, 'id'>) => {
    if (!config) return;

    const newField: FieldConfig = {
      ...field,
      id: `field-${Date.now()}`,
    };

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.map(step =>
          step.id === stepId
            ? { ...step, fields: [...step.fields, newField] }
            : step
        ),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    setShowFieldForm(false);
    await saveConfigToServer(updatedConfig);
  };

  const updateField = async (
    stepId: string,
    fieldId: string,
    updatedField: Partial<FieldConfig>
  ) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.map(step =>
          step.id === stepId
            ? {
                ...step,
                fields: step.fields.map(field =>
                  field.id === fieldId ? { ...field, ...updatedField } : field
                ),
              }
            : step
        ),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    setEditingField(null);
    await saveConfigToServer(updatedConfig);
  };

  const deleteField = async (stepId: string, fieldId: string) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.map(step =>
          step.id === stepId
            ? {
                ...step,
                fields: step.fields.filter(field => field.id !== fieldId),
              }
            : step
        ),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    await saveConfigToServer(updatedConfig);
  };

  const reorderSteps = async (fromIndex: number, toIndex: number) => {
    if (!config) return;

    const steps = [...config.claimForm.steps];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps,
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    await saveConfigToServer(updatedConfig);
  };

  const reorderFields = async (
    stepId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      claimForm: {
        ...config.claimForm,
        steps: config.claimForm.steps.map(step => {
          if (step.id === stepId) {
            const fields = [...step.fields];
            const [movedField] = fields.splice(fromIndex, 1);
            fields.splice(toIndex, 0, movedField);
            return { ...step, fields };
          }
          return step;
        }),
      },
    };

    setConfig(updatedConfig);
    setConfigText(JSON.stringify(updatedConfig, null, 2));
    await saveConfigToServer(updatedConfig);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
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
                | Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user?.role === 'super_admin' && (
                  <>
                <a
                  href="/admin/tenants"
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
                >
                  Manage Tenants
                </a>
                <a
                  href="/create-admin"
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
                  >
                  Create Admin
                </a>
                  </>
              )}
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-bold">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(
                [
                  { id: 'claims', label: 'Claims' },
                  { id: 'steps', label: 'Form Steps' },
                  { id: 'fields', label: 'Field Types' },
                  { id: 'config', label: 'JSON Configuration' },
                  { id: 'widget', label: 'Widget Configuration' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | 'claims'
                        | 'config'
                        | 'steps'
                        | 'fields'
                        | 'widget'
                    )
                  }
                  className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="mt-6 text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Claims
              </h2>

              {claims.length === 0 ? (
                <div className="text-left text-gray-600">No claims found.</div>
              ) : (
                <div className="bg-white overflow-hidden sm:rounded-md border border-gray-300">
                  <ul className="divide-y divide-gray-200">
                    {claims.map(claim => (
                      <li key={claim.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="text-left">
                                <p className="text-sm font-mono font-medium text-teal-600">
                                  {claim.identificationNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {claim.user.name} ({claim.user.email}) •{' '}
                                  <span className="font-mono">
                                    {claim.user.externalId || 'NO EXTERNAL ID'}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    claim.createdAt
                                  ).toLocaleDateString()}{' '}
                                  {new Date(
                                    claim.createdAt
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => setSelectedClaim(claim)}
                                className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-teal-700 text-nowrap cursor-pointer"
                              >
                                Show Details
                              </button>
                              <select
                                value={claim.status}
                                onChange={e =>
                                  updateClaimStatus(
                                    claim.id,
                                    e.target.value as
                                      | 'OPEN'
                                      | 'IN_REVIEW'
                                      | 'CLOSED'
                                  )
                                }
                                className="form-select block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                              >
                                <option value="OPEN">Open</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                              <span
                                className={`inline-flex items-center px-6 py-0.5 rounded-full text-xs font-medium text-nowrap ${getStatusColor(
                                  claim.status
                                )}`}
                              >
                                {claim.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Form Steps Tab */}
          {activeTab === 'steps' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Form Steps
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag and drop steps to reorder them. Use the grip icon to
                    drag items.
                  </p>
                </div>
                <button
                  onClick={() => setShowStepForm(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
                >
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {config?.claimForm.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`bg-white border border-gray-300 rounded-lg p-6 transition-all duration-200 ${
                      draggedStep === step.id ? 'opacity-50 scale-95' : ''
                    } ${
                      dragOverStep === step.id && draggedStep !== step.id
                        ? 'ring-2 ring-teal-500 bg-teal-50'
                        : ''
                    }`}
                    draggable
                    onDragStart={e => {
                      setDraggedStep(step.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDraggedStep(null)}
                    onDragOver={e => {
                      e.preventDefault();
                      setDragOverStep(step.id);
                    }}
                    onDragLeave={() => setDragOverStep(null)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOverStep(null);
                      if (draggedStep && draggedStep !== step.id) {
                        const draggedIndex = config.claimForm.steps.findIndex(
                          s => s.id === draggedStep
                        );
                        const targetIndex = index;
                        reorderSteps(draggedIndex, targetIndex);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3 flex-1">
                        <div
                          className="cursor-move text-gray-400 hover:text-gray-600 mt-1 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Drag to reorder"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {index + 1}. {step.title}
                          </h3>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {step.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">
                              {step.fields.length} field(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingStep(step)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step Form */}
              {showStepForm && (
                <StepForm
                  onSubmit={addStep}
                  onCancel={() => setShowStepForm(false)}
                />
              )}

              {/* Edit Step Form */}
              {editingStep && (
                <StepForm
                  step={editingStep}
                  onSubmit={step => updateStep(editingStep.id, step)}
                  onCancel={() => setEditingStep(null)}
                />
              )}
            </div>
          )}

          {/* Field Types Tab */}
          {activeTab === 'fields' && (
            <div className="mt-6">
              <div className="mb-6 text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  Field Types
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Drag and drop fields within each step to reorder them. Use the
                  grip icon to drag items.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {config?.claimForm.steps.map(step => (
                  <div key={step.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <div className="space-y-3">
                      {step.fields.map((field, fieldIndex) => (
                        <div
                          key={field.id}
                          className={`border border-gray-300 rounded-lg p-3 transition-all duration-200 ${
                            draggedField?.stepId === step.id &&
                            draggedField?.fieldId === field.id
                              ? 'opacity-50 scale-95'
                              : ''
                          } ${
                            dragOverField === field.id &&
                            draggedField?.stepId === step.id &&
                            draggedField?.fieldId !== field.id
                              ? 'ring-2 ring-teal-500 bg-teal-50'
                              : ''
                          }`}
                          draggable
                          onDragStart={e => {
                            setDraggedField({
                              stepId: step.id,
                              fieldId: field.id,
                            });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => setDraggedField(null)}
                          onDragOver={e => {
                            e.preventDefault();
                            setDragOverField(field.id);
                          }}
                          onDragLeave={() => setDragOverField(null)}
                          onDrop={e => {
                            e.preventDefault();
                            setDragOverField(null);
                            if (
                              draggedField &&
                              draggedField.stepId === step.id &&
                              draggedField.fieldId !== field.id
                            ) {
                              const draggedIndex = step.fields.findIndex(
                                f => f.id === draggedField.fieldId
                              );
                              const targetIndex = fieldIndex;
                              reorderFields(step.id, draggedIndex, targetIndex);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-2 flex-1">
                              <div
                                className="cursor-move text-gray-400 hover:text-gray-600 mt-1 p-1 rounded hover:bg-gray-100 transition-colors"
                                title="Drag to reorder"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {field.label}
                                </p>
                                <p className="text-sm font-mono text-gray-500">
                                  {field.type}
                                </p>
                                {field.required && (
                                  <span className="text-xs text-red-600">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => setEditingField(field)}
                                className="text-teal-600 hover:text-teal-800 text-xs cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  deleteField(step.id, field.id);
                                }}
                                className="text-red-600 hover:text-red-800 text-xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowFieldForm(true)}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Field Form */}
              {showFieldForm && (
                <FieldForm
                  steps={config?.claimForm.steps || []}
                  onSubmit={(stepId, field) => addField(stepId, field)}
                  onCancel={() => setShowFieldForm(false)}
                />
              )}

              {/* Edit Field Form */}
              {editingField && (
                <FieldForm
                  steps={config?.claimForm.steps || []}
                  field={editingField}
                  onSubmit={(stepId, field) =>
                    updateField(stepId, editingField.id, field)
                  }
                  onCancel={() => setEditingField(null)}
                />
              )}
            </div>
          )}
          {/* JSON Configuration Tab */}
          {activeTab === 'config' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  JSON Configuration
                </h2>
                {!editingConfig ? (
                  <button
                    onClick={() => setEditingConfig(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
                  >
                    Edit Configuration
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={saveConfig}
                      className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingConfig(false);
                        setConfigText(JSON.stringify(config, null, 2));
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {editingConfig ? (
                <div>
                  <textarea
                    value={configText}
                    onChange={e => setConfigText(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm text-left"
                    placeholder="Configuration JSON..."
                  />
                </div>
              ) : (
                <div className="bg-[#1e1e1e] border border-gray-300 rounded-lg p-6 overflow-auto rounded-lg">
                  <SyntaxHighlightedJSON json={config} />
                </div>
              )}
            </div>
          )}
          {/* Widget Configuration Tab */}
          {activeTab === 'widget' && (
            <div className="mt-6">
              <div className="mb-6 text-left">
                <h2 className="text-2xl font-bold text-gray-900">
                  Widget Configuration
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Just add this{' '}
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    script
                  </code>{' '}
                  tags at the end of your page. Make sure that the id of the
                  user from your domain is provided.
                </p>
              </div>
              <div className="space-x-2">
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap text-left">
                    {
                      '<script src="http://localhost:5173/lime-widget.iife.js"></script> // URL TO WIDGET FILE\n'
                    }
                    {'<script>\n'}
                    {'  ClaimWidget.createModal({\n'}
                    {"    apiUrl: 'http://localhost:3000/api/v1', // API URL\n"}
                    {`    apiKey: '${user?.tenantId}',\n`}
                    {`    userId: '<USER_ID>', // ID OF THE USER FROM YOUR DOMAIN\n`}
                    {'    onSuccess: function(claimId) {\n'}
                    {
                      "      alert('Claim successfully created. ID: ' + claimId);\n"
                    }
                    {'    },\n'}
                    {'    onError: function(error) {\n'}
                    {"      alert('Oops... error: ' + error);\n"}
                    {'    }\n'}
                    {'  });\n'}
                    {'</script>\n'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && (
        <ClaimDetailsModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
};

// Claim Details Modal Component
const ClaimDetailsModal: React.FC<{
  claim: Claim;
  onClose: () => void;
}> = ({ claim, onClose }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configResponse = await axios.get(
          'http://localhost:3000/api/v1/config'
        );
        setConfig(configResponse.data);
      } catch (error) {
        console.error('Failed to fetch configuration:', error);
      }
    };
    fetchConfig();
  }, []);

  const getFieldLabel = (fieldId: string): string => {
    if (!config) return fieldId.replace(/([A-Z])/g, ' $1').trim();

    for (const step of config.claimForm.steps) {
      const field = step.fields.find(f => f.id === fieldId);
      if (field) {
        return field.label;
      }
    }
    // Fallback to formatted field ID if not found
    return fieldId.replace(/([A-Z])/g, ' $1').trim();
  };
  const renderValue = (key: string, value: unknown): React.ReactNode => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          disabled
          className="h-4 w-4 text-teal-600 border-gray-300 rounded"
        />
      );
    }

    // Handle date (check if it looks like a date string)
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}/.test(value) &&
      !isNaN(Date.parse(value))
    ) {
      const date = new Date(value);
      return (
        <span className="text-gray-900">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      );
    }

    // Handle file/image (base64 or URL)
    if (typeof value === 'string' && value.length > 500) {
      return (
        <img
          src={`data:image/png;base64,${value}`}
          alt={key}
          className="max-w-xs max-h-48 rounded border border-gray-300"
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.insertAdjacentHTML(
              'afterend',
              '<span class="text-gray-400 italic">Invalid image</span>'
            );
          }}
        />
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside">
          {value.map((item, index) => (
            <li key={index} className="text-gray-900">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <div className="pl-4 border-l-2 border-gray-200">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="mb-2">
              <span className="font-medium text-gray-700">{k}: </span>
              {renderValue(k, v)}
            </div>
          ))}
        </div>
      );
    }

    // Handle everything else as string
    return <span className="text-gray-900">{String(value)}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Claim Details</h3>
            <p className="text-sm font-mono text-gray-600 mt-1">
              {claim.identificationNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Basic Info */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'OPEN'
                      ? 'bg-green-100 text-green-800'
                      : claim.status === 'IN_REVIEW'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {claim.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submitted by
                </label>
                <p className="text-gray-900">
                  {claim.user.name} ({claim.user.email}) •{' '}
                  <span className="font-mono">{claim.user.externalId}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-gray-900">
                  {new Date(claim.createdAt).toLocaleDateString()}{' '}
                  {new Date(claim.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {new Date(claim.updatedAt).toLocaleDateString()}{' '}
                  {new Date(claim.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Claim Data */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Claim Data
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {Object.entries(claim.data).map(([key, value]) => (
                <div
                  key={key}
                  className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    {getFieldLabel(key)}
                  </label>
                  <div className="text-sm">{renderValue(key, value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Step Form Component
const StepForm: React.FC<{
  step?: StepConfig;
  onSubmit: (step: Omit<StepConfig, 'id'>) => void;
  onCancel: () => void;
}> = ({ step, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: step?.title || '',
    description: step?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fields: step?.fields || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-left">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {step ? 'Edit Step' : 'Add Step'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
            >
              {step ? 'Update' : 'Add'} Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Field Form Component
const FieldForm: React.FC<{
  steps: StepConfig[];
  field?: FieldConfig;
  onSubmit: (stepId: string, field: Omit<FieldConfig, 'id'>) => void;
  onCancel: () => void;
}> = ({ steps, field, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    stepId: field
      ? steps.find(s => s.fields.some(f => f.id === field.id))?.id ||
        steps[0]?.id
      : steps[0]?.id || '',
    type: field?.type || 'STRING',
    label: field?.label || '',
    required: field?.required || false,
    placeholder: field?.placeholder || '',
    options: field?.options || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fieldData: Omit<FieldConfig, 'id'> = {
      type: formData.type as never,
      label: formData.label,
      required: formData.required,
      placeholder: formData.placeholder,
    };

    // Add options if it's a LIST field
    if (formData.type === 'LIST' && formData.options.length > 0) {
      fieldData.options = formData.options;
    }

    onSubmit(formData.stepId, fieldData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-left">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {field ? 'Edit Field' : 'Add Field'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Step
            </label>
            <select
              value={formData.stepId}
              onChange={e =>
                setFormData({ ...formData, stepId: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            >
              {steps.map(step => (
                <option key={step.id} value={step.id}>
                  {step.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={formData.type}
              onChange={e =>
                setFormData({
                  ...formData,
                  type: e.target.value as
                    | 'STRING'
                    | 'NUMBER'
                    | 'AMOUNT'
                    | 'DATE'
                    | 'BOOLEAN'
                    | 'FILE'
                    | 'LIST',
                })
              }
              className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            >
              <option value="STRING">String</option>
              <option value="NUMBER">Number</option>
              <option value="AMOUNT">Amount</option>
              <option value="DATE">Date</option>
              <option value="BOOLEAN">Boolean</option>
              <option value="FILE">File</option>
              <option value="LIST">List</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={e =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Placeholder
            </label>
            <input
              type="text"
              value={formData.placeholder}
              onChange={e =>
                setFormData({ ...formData, placeholder: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={e =>
                setFormData({ ...formData, required: e.target.checked })
              }
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Required</label>
          </div>

          {/* Options for LIST fields */}
          {formData.type === 'LIST' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={e => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="Enter option"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = formData.options.filter(
                          (_, i) => i !== index
                        );
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      options: [...formData.options, ''],
                    });
                  }}
                  className="text-teal-600 hover:text-teal-800 text-sm cursor-pointer"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 cursor-pointer"
            >
              {field ? 'Update' : 'Add'} Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
