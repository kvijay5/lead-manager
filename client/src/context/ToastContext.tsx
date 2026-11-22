import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);
