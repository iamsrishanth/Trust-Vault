export interface User {
  id: string;
  email: string;
  password: string;
  role: 'police' | 'lab' | 'hospital' | 'court' | 'admin';
  name: string;
}

export type EvidenceType =
  | 'physical'
  | 'digital'
  | 'biological'
  | 'documentary'
  | 'weapon'
  | 'other';

export const EVIDENCE_TYPES: { value: EvidenceType; label: string; icon: string }[] = [
  { value: 'physical', label: 'Physical Evidence', icon: '📦' },
  { value: 'digital', label: 'Digital Evidence', icon: '💻' },
  { value: 'biological', label: 'Biological Evidence', icon: '🧬' },
  { value: 'documentary', label: 'Documentary Evidence', icon: '📄' },
  { value: 'weapon', label: 'Weapon', icon: '🔫' },
  { value: 'other', label: 'Other', icon: '📎' },
];

export interface Case {
  id: string;
  title: string;
  description: string;
  suspectDetails: string;
  date: string;
  location: string;
  status: 'pending' | 'in-progress' | 'verified' | 'closed';
  currentHolder: string;
  createdBy: string;
  createdAt: string;
  evidenceType: EvidenceType;
  evidenceDescription: string;
  evidenceFiles: Array<{
    name: string;
    hash: string;
    uploadedBy: string;
    uploadedAt: string;
    size: number;
    type: string;
  }>;
  labReport?: {
    testPerformed: string;
    findings: string;
    reportFile?: string;
    addedAt: string;
    signature?: string;
  };
  hospitalReport?: {
    medicalDetails: string;
    postMortem?: string;
    reportFile?: string;
    addedAt: string;
    signature?: string;
  };
}

// Mock users for demo
export const mockUsers: User[] = [
  { id: '1', email: 'police@trustvault.com', password: 'police123', role: 'police', name: 'Officer John Smith' },
  { id: '2', email: 'lab@trustvault.com', password: 'lab123', role: 'lab', name: 'Dr. Sarah Johnson' },
  { id: '3', email: 'hospital@trustvault.com', password: 'hospital123', role: 'hospital', name: 'Dr. Michael Chen' },
  { id: '4', email: 'court@trustvault.com', password: 'court123', role: 'court', name: 'Judge Emily Davis' },
  { id: '5', email: 'admin@trustvault.com', password: 'admin123', role: 'admin', name: 'Admin User' },
];

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'trustvault_current_user',
  CASES: 'trustvault_cases',
  BLOCKS: 'trustvault_blocks',
};
