import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: {
    id:           null,
    name:         '',
    email:        '',
    phone:        '',
    avatar:       null,
    initials:     '',
    storageLimit: 1073741824, // 1 GB
  },
  isAuthenticated: false,
  isLocked:        false,
  pin:             null,

  security: {
    biometricEnabled:     false,
    pinEnabled:           false,
    autoLockMinutes:      5,
    stealthMode:          false,
    encryptNewByDefault:  false,
    showPreviewInRecents: true,
  },

  // ── Auth ─────────────────────────────────────────────────────────────────
  login: (email, password) => {
    if (!email || !password || password.length < 6) return false;
    // Derive a display name from the email prefix
    const raw      = email.split('@')[0].replace(/[._]/g, ' ');
    const name     = raw.charAt(0).toUpperCase() + raw.slice(1);
    const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    set({
      isAuthenticated: true,
      isLocked:        false,
      user: { ...get().user, name, email, initials },
    });
    return true;
  },

  register: (name, email) => {
    const initials = name.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    set({
      isAuthenticated: true,
      isLocked:        false,
      user: { ...get().user, name: name.trim(), email, initials },
    });
  },

  logout: () => set({
    isAuthenticated: false,
    isLocked:        false,
    user: { id: null, name: '', email: '', phone: '', avatar: null, initials: '', storageLimit: 1073741824 },
  }),

  lock:   ()    => set({ isLocked: true }),
  unlock: pin   => {
    const { pin: stored, security } = get();
    if (!security.pinEnabled || pin === stored) { set({ isLocked: false }); return true; }
    return false;
  },

  // ── Security ──────────────────────────────────────────────────────────────
  setupPin:       pin     => set(s => ({ pin, security: { ...s.security, pinEnabled: true } })),
  updateSecurity: updates => set(s => ({ security: { ...s.security, ...updates } })),
  updateUser:     updates => set(s => ({ user:     { ...s.user,     ...updates } })),
}));
