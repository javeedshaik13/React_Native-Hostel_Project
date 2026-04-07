import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
  toggle: () => set((state) => ({ visible: !state.visible })),
}));
