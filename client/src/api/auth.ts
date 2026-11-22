import { AuthResponse, LoginPayload, SignupPayload, User } from '../types/auth';
import { request } from './http';

export async function login(data: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function signup(data: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(signal?: AbortSignal): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me', { signal });
}
