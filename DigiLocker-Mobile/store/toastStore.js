import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  
  showToast: (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
    
    // Auto-dismiss after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, duration);
    
    return id;
  },
  
  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },
  
  clearToasts: () => set({ toasts: [] }),
}));
