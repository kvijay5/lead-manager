import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/http';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { FormErrors } from '../utils/validation';

export const SignupPage: React.FC = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be at most 100 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password =
        'Password must contain at least one letter and one digit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success('Account created successfully');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          const fieldErrors: FormErrors = {};
          err.details.forEach((d) => {
            fieldErrors[d.field as keyof FormErrors] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          toast.error(err.message || 'Signup failed. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20 mb-3">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Start managing and tracking your leads with Lead Manager CRM
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition-all ${
                  errors.name
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Work Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition-all ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition-all ${
                  errors.password
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                At least 8 characters, including 1 letter and 1 number.
              </p>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Toggle to Login */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
