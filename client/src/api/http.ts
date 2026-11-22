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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

    let payload: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        // Ignore JSON parse failure
      }
    }

    if (!response.ok) {
      const message =
        payload?.error?.message || `Request failed with status ${response.status}`;
      const details = payload?.error?.details;
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
