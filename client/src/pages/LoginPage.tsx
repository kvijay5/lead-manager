import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/http';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { FormErrors } from '../utils/validation';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard or previous destination
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
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
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && Array.isArray(err.details)) {
          const fieldErrors: FormErrors = {};
          err.details.forEach((d) => {
            fieldErrors[d.field as keyof FormErrors] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          toast.error(err.message || 'Invalid email or password');
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
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back to Lead Manager CRM
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-slate-200/80 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email Address
              </label>
              <input
                id="login-email"
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
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 transition-all ${
                  errors.password
                    ? 'border-rose-300 focus:border-rose-500'
                    : 'border-slate-200 focus:border-brand-500'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Toggle to Signup */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
