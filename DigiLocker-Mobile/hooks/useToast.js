import { useToastStore } from '../store/toastStore';

export function useToast() {
  const showToast = useToastStore(s => s.showToast);
  
  return {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
  };
}
