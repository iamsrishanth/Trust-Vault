import CryptoJS from 'crypto-js';

export interface Block {
  id: string;
  caseId: string;
  from: string;
  to: string;
  timestamp: string;
  fileHash: string;
  previousHash: string;
  action: string;
  fileName?: string;
  fileSize?: number;
  signature?: string;
}

export interface EvidenceFile {
  name: string;
  size: number;
  type: string;
  hash: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Generate SHA-256 hash of a file
export const generateFileHash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString();
        resolve(hash);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Generate block hash from block data
export const generateBlockHash = (block: Omit<Block, 'id'>): string => {
  const data = `${block.caseId}${block.from}${block.to}${block.timestamp}${block.fileHash}${block.previousHash}${block.action}`;
  return CryptoJS.SHA256(data).toString();
};

// Generate HMAC-SHA256 digital signature
export const generateSignature = (data: string, signerKey: string): string => {
  return CryptoJS.HmacSHA256(data, signerKey).toString();
};

// Verify a digital signature
export const verifySignature = (data: string, signature: string, signerKey: string): boolean => {
  const expectedSig = CryptoJS.HmacSHA256(data, signerKey).toString();
  return expectedSig === signature;
};

// Sign a block transfer
export const signBlock = (block: Omit<Block, 'id' | 'signature'>, signerEmail: string): string => {
  const blockData = `${block.caseId}|${block.from}|${block.to}|${block.timestamp}|${block.fileHash}|${block.action}`;
  return generateSignature(blockData, signerEmail);
};

// Verify the entire chain of blocks
export const verifyChain = (blocks: Block[]): boolean => {
  if (blocks.length === 0) return true;

  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];

    if (currentBlock.previousHash !== generateBlockHash(previousBlock)) {
      return false;
    }
  }

  return true;
};

// Validate a single block's integrity
export const validateBlock = (
  block: Block,
  previousBlock?: Block
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!block.id) errors.push('Missing block ID');
  if (!block.caseId) errors.push('Missing case ID');
  if (!block.from) errors.push('Missing sender');
  if (!block.to) errors.push('Missing recipient');
  if (!block.timestamp) errors.push('Missing timestamp');
  if (!block.fileHash) errors.push('Missing file hash');
  if (!block.action) errors.push('Missing action');

  if (previousBlock) {
    const expectedPrevHash = generateBlockHash(previousBlock);
    if (block.previousHash !== expectedPrevHash) {
      errors.push('Previous hash mismatch — possible tampering detected');
    }
  } else if (block.previousHash !== '0') {
    errors.push('Genesis block should have previous hash of "0"');
  }

  return { valid: errors.length === 0, errors };
};

// Format hash for display
export const formatHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
};

// Get a human-readable summary of block action
export const getActionColor = (action: string): string => {
  if (action.includes('Created')) return 'text-blue-500';
  if (action.includes('Transferred')) return 'text-amber-500';
  if (action.includes('Report')) return 'text-purple-500';
  if (action.includes('Verified')) return 'text-emerald-500';
  if (action.includes('Closed')) return 'text-slate-500';
  return 'text-primary';
};
