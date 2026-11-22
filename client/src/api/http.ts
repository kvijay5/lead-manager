export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public details?: ApiErrorDetail[];

  constructor(message: string, statusCode: number, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const normalizedBase = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase}/api`;

export const AUTH_TOKEN_KEY = 'lead_manager_token';

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    let payload: {
      error?: {
        message?: string;
        details?: ApiErrorDetail[];
      };
    } | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        payload = (await response.json()) as {
          error?: {
            message?: string;
            details?: ApiErrorDetail[];
          };
        };
      } catch {
        // Ignore JSON parse failure
      }
    }

    if (!response.ok) {
      const message =
        payload?.error?.message ||
        `Request failed with status ${response.status}`;
      const details = payload?.error?.details;

      // Handle 401 Unauthorized for authenticated endpoints (auto-logout)
      if (
        response.status === 401 &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/signup')
      ) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      throw new ApiError(message, response.status, details);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    throw new ApiError(
      'Cannot reach the server. Please check your network connection or ensure the server is running.',
      0
    );
  }
}
