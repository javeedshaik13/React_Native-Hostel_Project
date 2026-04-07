// ─── Document type keys ────────────────────────────────────────────────────────
export const DOC_TYPES = {
  PDF:         'pdf',
  IMAGE:       'image',
  VIDEO:       'video',
  AUDIO:       'audio',
  ID:          'id',
  CERTIFICATE: 'certificate',
  OTHER:       'other',
};

// ─── Per-type meta (colors resolved at render time via theme) ──────────────────
export const DOC_TYPE_CONFIG = {
  pdf: {
    label: 'PDF',
    icon:  'document-text',
    getColor: C => C.doc.pdf,
    getBg:    C => C.doc.pdfBg,
    mimes:   ['application/pdf'],
    ext:     ['.pdf'],
  },
  image: {
    label: 'Image',
    icon:  'image',
    getColor: C => C.doc.image,
    getBg:    C => C.doc.imageBg,
    mimes:   ['image/jpeg', 'image/png', 'image/webp'],
    ext:     ['.jpg', '.jpeg', '.png', '.webp'],
  },
  video: {
    label: 'Video',
    icon:  'videocam',
    getColor: C => C.doc.video,
    getBg:    C => C.doc.videoBg,
    mimes:   ['video/mp4', 'video/quicktime'],
    ext:     ['.mp4', '.mov'],
  },
  audio: {
    label: 'Audio',
    icon:  'musical-note',
    getColor: C => C.doc.audio,
    getBg:    C => C.doc.audioBg,
    mimes:   ['audio/mpeg', 'audio/wav'],
    ext:     ['.mp3', '.wav'],
  },
  id: {
    label: 'ID Document',
    icon:  'card',
    getColor: C => C.doc.id,
    getBg:    C => C.doc.idBg,
    mimes:   ['application/pdf', 'image/jpeg', 'image/png'],
    ext:     ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  certificate: {
    label: 'Certificate',
    icon:  'ribbon',
    getColor: C => C.doc.certificate,
    getBg:    C => C.doc.certificateBg,
    mimes:   ['application/pdf', 'image/jpeg', 'image/png'],
    ext:     ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  other: {
    label: 'Other',
    icon:  'folder',
    getColor: C => C.doc.other,
    getBg:    C => C.doc.otherBg,
    mimes:   ['*/*'],
    ext:     [],
  },
};

// ─── Filter categories (document list) ────────────────────────────────────────
export const FILTER_CATEGORIES = [
  { key: 'all',         label: 'All',          icon: 'grid-outline' },
  { key: 'id',          label: 'ID Docs',      icon: 'card-outline' },
  { key: 'pdf',         label: 'PDFs',         icon: 'document-text-outline' },
  { key: 'image',       label: 'Images',       icon: 'image-outline' },
  { key: 'video',       label: 'Videos',       icon: 'videocam-outline' },
  { key: 'audio',       label: 'Audio',        icon: 'musical-note-outline' },
  { key: 'certificate', label: 'Certificates', icon: 'ribbon-outline' },
];

// ─── Sort options ──────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest first' },
  { key: 'date_asc',  label: 'Oldest first' },
  { key: 'name_asc',  label: 'Name A – Z' },
  { key: 'name_desc', label: 'Name Z – A' },
  { key: 'freq_desc', label: 'Most accessed' },
  { key: 'size_desc', label: 'Largest first' },
];

// ─── Quick-access shortcuts (dashboard) ───────────────────────────────────────
export const QUICK_ACCESS_DOCS = [
  { id: 'qa_aadhaar',  label: 'Aadhaar',  icon: 'card-outline',    docTag: 'aadhaar' },
  { id: 'qa_pan',      label: 'PAN Card', icon: 'wallet-outline',  docTag: 'pan' },
  { id: 'qa_dl',       label: 'Driving L',icon: 'car-outline',     docTag: 'driving-license' },
  { id: 'qa_passport', label: 'Passport', icon: 'globe-outline',   docTag: 'passport' },
  { id: 'qa_certs',    label: 'Certs',    icon: 'ribbon-outline',  docTag: 'certificate' },
  { id: 'qa_health',   label: 'Health',   icon: 'heart-outline',   docTag: 'health' },
];

// ─── Upload – category choices ─────────────────────────────────────────────────
export const DOC_CATEGORIES = [
  { key: 'id',          label: 'ID Document' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'pdf',         label: 'PDF / Document' },
  { key: 'image',       label: 'Image / Photo' },
  { key: 'video',       label: 'Video' },
  { key: 'audio',       label: 'Audio' },
  { key: 'other',       label: 'Other' },
];

// ─── Common suggested tags ─────────────────────────────────────────────────────
export const COMMON_TAGS = [
  'aadhaar', 'pan', 'passport', 'driving-license', 'certificate',
  'health', 'legal', 'financial', 'education', 'property',
];
