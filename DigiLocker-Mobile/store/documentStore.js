import { create } from 'zustand';
import { loadDocumentMeta, saveDocumentMeta, deleteVaultFile } from '../utils/fileStorage';

const sortDocuments = (docs, sortKey) => {
  const s = [...docs];
  switch (sortKey) {
    case 'date_desc': return s.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    case 'date_asc':  return s.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    case 'name_asc':  return s.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc': return s.sort((a, b) => b.name.localeCompare(a.name));
    case 'freq_desc': return s.sort((a, b) => b.accessCount - a.accessCount);
    case 'size_desc': return s.sort((a, b) => b.size - a.size);
    default:          return s;
  }
};

// Fire-and-forget — callers don't wait for AsyncStorage
const persist = (documents, recentDocIds) => {
  saveDocumentMeta(documents, recentDocIds).catch(() => {});
};

export const useDocumentStore = create((set, get) => ({
  documents:    [],
  recentDocIds: [],
  activeFilter: 'all',
  sortKey:      'date_desc',
  searchQuery:  '',
  isGridView:   false,
  isLoaded:     false, // becomes true after first AsyncStorage load

  // ── Bootstrap: call once on app start ────────────────────────────────────
  hydrate: async () => {
    if (get().isLoaded) return;
    try {
      const { documents, recentDocIds } = await loadDocumentMeta();
      set({ documents, recentDocIds, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  // ── Computed selectors ────────────────────────────────────────────────────
  getFilteredDocs: () => {
    const { documents, activeFilter, sortKey, searchQuery } = get();
    let out = documents;
    if (activeFilter !== 'all')
      out = out.filter(d => d.type === activeFilter || d.fileType === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      out = out.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q)) ||
        (d.ocrText     || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    return sortDocuments(out, sortKey);
  },

  getDocById:         (id)  => get().documents.find(d => d.id === id),
  getRecentDocs:      ()    => {
    const { documents, recentDocIds } = get();
    return recentDocIds.map(id => documents.find(d => d.id === id)).filter(Boolean).slice(0, 5);
  },
  getQuickAccessDocs: (tag) => get().documents.filter(d => d.tags.includes(tag)),
  getStorageUsed:     ()    => get().documents.reduce((acc, d) => acc + (d.size || 0), 0),
  getTotalByType:     ()    => {
    const docs = get().documents;
    return {
      id:          docs.filter(d => d.type === 'id').length,
      pdf:         docs.filter(d => d.fileType === 'pdf').length,
      image:       docs.filter(d => d.fileType === 'image').length,
      video:       docs.filter(d => d.fileType === 'video').length,
      audio:       docs.filter(d => d.fileType === 'audio').length,
      certificate: docs.filter(d => d.type === 'certificate').length,
    };
  },

  // ── Filter / sort / view ──────────────────────────────────────────────────
  setFilter:  filter => set({ activeFilter: filter }),
  setSort:    key    => set({ sortKey: key }),
  setSearch:  query  => set({ searchQuery: query }),
  toggleView: ()     => set(s => ({ isGridView: !s.isGridView })),

  // ── CRUD ──────────────────────────────────────────────────────────────────
  // doc MUST include: localUri (vault path), size (bytes from copyFileToVault)
  addDocument: (doc) => {
    const newDoc = {
      id:          `d${Date.now()}`,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
      accessCount: 0,
      isStarred:   false,
      ocrText:     '',
      description: '',
      tags:        [],
      pages:       1,
      localUri:    null,
      encrypted:   false,
      ...doc,
    };
    set(s => {
      const documents    = [newDoc, ...s.documents];
      const recentDocIds = [newDoc.id, ...s.recentDocIds.slice(0, 9)];
      persist(documents, recentDocIds);
      return { documents, recentDocIds };
    });
    return newDoc; // caller uses .id to store the encryption password
  },

  // Async: deletes the physical vault file before removing metadata.
  deleteDocument: async (id) => {
    const doc = get().documents.find(d => d.id === id);
    if (doc?.localUri) {
      try { deleteVaultFile(doc.localUri); } catch {}
    }
    set(s => {
      const documents    = s.documents.filter(d => d.id !== id);
      const recentDocIds = s.recentDocIds.filter(r => r !== id);
      persist(documents, recentDocIds);
      return { documents, recentDocIds };
    });
  },

  toggleStar: (id) => set(s => {
    const documents = s.documents.map(d =>
      d.id === id ? { ...d, isStarred: !d.isStarred } : d
    );
    persist(documents, s.recentDocIds);
    return { documents };
  }),

  incrementAccess: (id) => set(s => {
    const documents    = s.documents.map(d =>
      d.id === id ? { ...d, accessCount: d.accessCount + 1 } : d
    );
    const recentDocIds = [id, ...s.recentDocIds.filter(r => r !== id).slice(0, 9)];
    persist(documents, recentDocIds);
    return { documents, recentDocIds };
  }),

  updateDocument: (id, updates) => set(s => {
    const documents = s.documents.map(d =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    persist(documents, s.recentDocIds);
    return { documents };
  }),
}));
