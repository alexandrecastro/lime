/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

interface Tenant {
  name: string;
  logo: string;
}

interface AppConfig {
  version: string;
  color: string;
  abTest: {
    fileUploadMethod: 'drag-drop' | 'dialog';
  };
  claimForm: {
    steps: StepConfig[];
  };
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

interface FormData {
  [key: string]: any;
}

interface ClaimWidgetProps {
  apiUrl: string;
  apiKey: string;
  userId: string;
  onSuccess?: (claimId: string) => void;
  onError?: (error: string) => void;
}

const ClaimWidget: React.FC<ClaimWidgetProps> = ({
  apiUrl,
  apiKey,
  userId,
  onSuccess,
  onError,
}) => {
  const [tenant, setTenant] = useState<Tenant>();
  const [config, setConfig] = useState<AppConfig>();
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileUploadMethod, setFileUploadMethod] = useState<
    'drag-drop' | 'dialog'
  >('drag-drop');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [apiUrl, apiKey]);

  const fetchConfig = async () => {
    try {
      const headers = apiKey ? { 'API-Key': apiKey } : {};
      const configResponse = await axios.get(`${apiUrl}/config/w`, { headers });
      const tenantResponse = await axios.get(`${apiUrl}/tenants/w`, {
        headers,
      });

      setTenant(tenantResponse.data);
      setConfig(configResponse.data);
      setSteps(configResponse.data.claimForm.steps);
      setFileUploadMethod(configResponse.data.abTest.fileUploadMethod);
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
      onError?.('Failed to load claim form configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      [fieldId]: value,
    });
  };

  const handleFileUpload = async (fieldId: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Store the filename for display
      setFileNames({
        ...fileNames,
        [fieldId]: file.name,
      });

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64String.split(',')[1];

        setFormData({
          ...formData,
          [fieldId]: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(fieldId, files);
  };

  const validateStep = (step: StepConfig): boolean => {
    return step.fields.every(field => {
      if (field.required) {
        const value = formData[field.id];
        return value !== undefined && value !== null && value !== '';
      }
      return true;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const headers = { 'API-Key': apiKey, 'User-ID': userId };
      const response = await axios.post(
        `${apiUrl}/claims/w`,
        {
          data: formData,
        },
        { headers }
      );
      onSuccess?.(response.data.id);
      setIsOpen(false);
      // Reset form
      setFormData({});
      setCurrentStep(0);
    } catch (error) {
      console.error('Failed to submit claim:', error);
      onError?.('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'STRING':
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-${config?.color}-500 focus:border-${config?.color}-500 sm:text-sm focus:outline-none`}
          />
        );

      case 'NUMBER':
      case 'AMOUNT':
        return (
          <input
            type="number"
            value={value}
            onChange={e =>
              handleInputChange(field.id, parseFloat(e.target.value) || '')
            }
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-${config?.color}-500 focus:border-${config?.color}-500 sm:text-sm focus:outline-none`}
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-${config?.color}-500 focus:border-${config?.color}-500 sm:text-sm focus:outline-none`}
          />
        );

      case 'BOOLEAN':
        return (
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={e => handleInputChange(field.id, e.target.checked)}
                className={`form-checkbox h-4 w-4 text-${config?.color}-600 transition duration-150 ease-in-out`}
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          </div>
        );

      case 'FILE':
        return (
          <div>
            {fileUploadMethod === 'drag-drop' ? (
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition duration-150 ease-in-out"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, field.id)}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor={`file-${field.id}`}
                      className={`relative cursor-pointer bg-white rounded-md font-medium text-${config?.color}-600 hover:text-${config?.color}-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-${config?.color}-500`}
                    >
                      <span>Upload a file</span>
                      <input
                        id={`file-${field.id}`}
                        name={`file-${field.id}`}
                        type="file"
                        className="sr-only"
                        onChange={e =>
                          handleFileUpload(field.id, e.target.files)
                        }
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <input
                  type="file"
                  onChange={e => handleFileUpload(field.id, e.target.files)}
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-${config?.color}-50 file:text-${config?.color}-700 hover:file:bg-${config?.color}-100`}
                />
              </div>
            )}
            {formData[field.id] && fileNames[field.id] && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {fileNames[field.id]}
              </p>
            )}
          </div>
        );

      case 'LIST':
        return (
          <select
            value={value}
            onChange={e => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={`mt-1 block w-full border-gray-300 rounded-md px-3 py-2 border placeholder-gray-500 text-gray-900 focus:ring-${config?.color}-500 focus:border-${config?.color}-500 sm:text-sm focus:outline-none`}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-center">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 border-${config?.color}-500`}
            ></div>
          </div>
          <p className="text-center mt-4 text-gray-600">
            Loading claim form...
          </p>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return null;
  }

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = validateStep(currentStepConfig);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="flex items-center text-xl font-semibold text-gray-900">
              {tenant?.name && tenant?.logo && (
                <img
                  src={`data:image/png;base64,${tenant.logo}`}
                  alt={tenant.name}
                  className="h-8 w-8 object-cover mr-2"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div>
                {tenant?.name ? tenant.name + ' • ' : ''}Claim Form • Version{' '}
                {config?.version || 'Unknown'}
              </div>
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`bg-${config?.color}-600 h-2 rounded-full transition-all duration-300`}
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentStepConfig?.title}
          </h3>
          {currentStepConfig?.description && (
            <p className="text-sm text-gray-600 mb-6">
              {currentStepConfig.description}
            </p>
          )}

          <div className="space-y-6">
            {currentStepConfig?.fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className={`bg-${config?.color}-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-${config?.color}-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className={`bg-${config?.color}-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-${config?.color}-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Widget initialization function
declare global {
  interface Window {
    ClaimWidget: {
      init: (containerId: string, options: ClaimWidgetProps) => void;
      createModal: (options: ClaimWidgetProps) => void;
    };
  }
}

// Export the widget functions
const ClaimWidgetAPI = {
  init: (containerId: string, options: ClaimWidgetProps) => {
    const container = document.getElementById(containerId);
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.render(<ClaimWidget {...options} />);
    }
  },
  createModal: (options: ClaimWidgetProps) => {
    const container = document.createElement('div');
    container.id = 'claim-widget-container';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<ClaimWidget {...options} />);
  },
};

// For IIFE builds, assign to window at module level
if (typeof window !== 'undefined') {
  window.ClaimWidget = ClaimWidgetAPI;
}

// Export for module systems
export default ClaimWidgetAPI;
