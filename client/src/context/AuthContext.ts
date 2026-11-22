import { createContext } from 'react';
import { LoginPayload, SignupPayload, User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  signup: (data: SignupPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
