import React, { useEffect, useRef, useState } from 'react';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SOURCE_LABELS,
  STATUS_LABELS,
} from '../constants/leads';
import { CreateLeadPayload, Lead, LeadSource, LeadStatus } from '../types/lead';
import {
  FormErrors,
  validateField,
  validateLeadForm,
} from '../utils/validation';

interface LeadFormProps {
  initialLead?: Lead | null;
  onSubmit: (data: CreateLeadPayload) => Promise<void>;
  onCancel: () => void;
  serverErrors?: FormErrors;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  initialLead,
  onSubmit,
  onCancel,
  serverErrors = {},
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateLeadPayload>({
    name: initialLead?.name || '',
    email: initialLead?.email || '',
    phone: initialLead?.phone || '',
    company: initialLead?.company || '',
    source: initialLead?.source || 'WEBSITE',
    status: initialLead?.status || 'NEW',
  });

  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus the first field upon modal mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Merge client-side validation errors with server-side response errors
  const errors: FormErrors = { ...clientErrors, ...serverErrors };

  const handleChange = (field: keyof CreateLeadPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If field was already touched, re-validate immediately on change
    if (touched[field]) {
      const error = validateField(field, value);
      setClientErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof CreateLeadPayload) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setClientErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      company: true,
      source: true,
      status: true,
    });

    // Validate entire form
    const validationErrors = validateLeadForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setClientErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        source: formData.source,
        status: formData.status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Name Field */}
      <div>
        <label
          htmlFor="lead-name"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="lead-name"
          ref={nameInputRef}
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g. Sarah Connor"
          disabled={isSubmitting}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
            errors.name && touched.name
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-950'
              : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900'
          }`}
        />
        {errors.name && touched.name && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      {/* Email & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="lead-email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="sarah@example.com"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
              errors.email && (touched.email || serverErrors.email)
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-950'
                : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900'
            }`}
          />
          {errors.email && (touched.email || serverErrors.email) && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label
            htmlFor="lead-phone"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="lead-phone"
            type="text"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder="+1 (555) 019-2834"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
              errors.phone && touched.phone
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-950'
                : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900'
            }`}
          />
          {errors.phone && touched.phone && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errors.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Company Field */}
      <div>
        <label
          htmlFor="lead-company"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          Company Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="lead-company"
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          onBlur={() => handleBlur('company')}
          placeholder="Cyberdyne Systems"
          disabled={isSubmitting}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none transition-all ${
            errors.company && touched.company
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-950'
              : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900'
          }`}
        />
        {errors.company && touched.company && (
          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{errors.company}</span>
          </p>
        )}
      </div>

      {/* Source & Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Source Dropdown */}
        <div>
          <label
            htmlFor="lead-source"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Lead Source <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="lead-source"
              value={formData.source}
              onChange={(e) =>
                handleChange('source', e.target.value as LeadSource)
              }
              onBlur={() => handleBlur('source')}
              disabled={isSubmitting}
              className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900"
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source] || source}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label
            htmlFor="lead-status"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Pipeline Status
          </label>
          <div className="relative">
            <select
              id="lead-status"
              value={formData.status}
              onChange={(e) =>
                handleChange('status', e.target.value as LeadStatus)
              }
              onBlur={() => handleBlur('status')}
              disabled={isSubmitting}
              className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors disabled:opacity-50 min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialLead ? 'Update Lead' : 'Create Lead'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
