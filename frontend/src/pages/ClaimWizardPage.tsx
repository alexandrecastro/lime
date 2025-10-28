import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Logo from '../assets/logo.svg';
import { useAuth } from '../hooks/useAuth.ts';

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

interface FormData {
  [key: string]: string | number | boolean | undefined;
}

const ClaimWizardPage: React.FC = () => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant>({ name: '', logo: '' });
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const tenantResponse = await axios.get(
        `http://localhost:3000/api/v1/tenants/${user?.tenantId}`
      );
      const stepsResponse = await axios.get(
        'http://localhost:3000/api/v1/config/claim-form'
      );

      setTenant(tenantResponse.data);
      setSteps(stepsResponse.data);
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    fieldId: string,
    value: string | number | boolean
  ) => {
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
      await axios.post('http://localhost:3000/api/v1/claims', {
        data: formData,
      });
      // Redirect to dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to submit claim:', error);
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm focus:outline-none"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm focus:outline-none"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:ring-teal-500 focus:border-teal-500 sm:text-sm focus:outline-none"
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
                className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">Yes</span>
            </label>
          </div>
        );

      case 'FILE':
        return (
          <div>
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
                    className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id={`file-${field.id}`}
                      name={`file-${field.id}`}
                      type="file"
                      className="sr-only"
                      onChange={e => handleFileUpload(field.id, e.target.files)}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </div>
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
            className="mt-1 block w-full border-gray-300 rounded-md px-3 py-2 border placeholder-gray-500 text-gray-900 focus:ring-teal-500 focus:border-teal-500 sm:text-sm focus:outline-none"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed = validateStep(currentStepConfig);

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
                  | New Claim
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 font-bold">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white border border-gray-300 rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                {currentStepConfig.title}
              </h2>
              {currentStepConfig.description && (
                <p className="text-sm text-gray-600 mb-6">
                  {currentStepConfig.description}
                </p>
              )}

              <div className="text-left space-y-6">
                {currentStepConfig.fields.map(field => (
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
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed}
                    className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimWizardPage;
