import { Case, STORAGE_KEYS } from './mockData';
import { Block, generateBlockHash, verifyChain } from './blockchain';

// ============================================================
// Case Service — Centralized CRUD for evidence cases
// ============================================================

export const CaseService = {
  getAll(): Case[] {
    const saved = localStorage.getItem(STORAGE_KEYS.CASES);
    return saved ? JSON.parse(saved) : [];
  },

  getById(caseId: string): Case | undefined {
    return this.getAll().find((c) => c.id === caseId);
  },

  getByHolder(holder: string): Case[] {
    return this.getAll().filter((c) => c.currentHolder === holder);
  },

  getByStatus(status: Case['status']): Case[] {
    return this.getAll().filter((c) => c.status === status);
  },

  create(newCase: Case): Case[] {
    const cases = this.getAll();
    const updated = [...cases, newCase];
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updated));
    return updated;
  },

  update(caseId: string, updates: Partial<Case>): Case[] {
    const cases = this.getAll();
    const updated = cases.map((c) =>
      c.id === caseId ? { ...c, ...updates } : c
    );
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(updated));
    return updated;
  },

  generateId(): string {
    return `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  },
};

// ============================================================
// Block Service — Blockchain block management
// ============================================================

export const BlockService = {
  getAll(): Block[] {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    return saved ? JSON.parse(saved) : [];
  },

  getByCaseId(caseId: string): Block[] {
    return this.getAll().filter((b) => b.caseId === caseId);
  },

  getLastBlock(caseId: string): Block | undefined {
    const caseBlocks = this.getByCaseId(caseId);
    return caseBlocks[caseBlocks.length - 1];
  },

  addBlock(block: Block): Block[] {
    const blocks = this.getAll();
    const updated = [...blocks, block];
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(updated));
    return updated;
  },

  createBlock(params: {
    caseId: string;
    from: string;
    to: string;
    action: string;
    fileHash: string;
    fileName?: string;
    fileSize?: number;
    signature?: string;
  }): Block {
    const lastBlock = this.getLastBlock(params.caseId);
    const timestamp = new Date().toISOString();

    return {
      id: `BLOCK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      caseId: params.caseId,
      from: params.from,
      to: params.to,
      timestamp,
      fileHash: params.fileHash,
      previousHash: lastBlock ? generateBlockHash(lastBlock) : '0',
      action: params.action,
      fileName: params.fileName,
      fileSize: params.fileSize,
      signature: params.signature,
    };
  },

  verifyChainForCase(caseId: string): { valid: boolean; blockCount: number; errors: string[] } {
    const caseBlocks = this.getByCaseId(caseId);
    const errors: string[] = [];

    if (caseBlocks.length === 0) {
      return { valid: true, blockCount: 0, errors };
    }

    for (let i = 1; i < caseBlocks.length; i++) {
      const currentBlock = caseBlocks[i];
      const previousBlock = caseBlocks[i - 1];

      if (currentBlock.previousHash !== generateBlockHash(previousBlock)) {
        errors.push(`Block #${i + 1} has invalid previous hash link`);
      }
    }

    return {
      valid: errors.length === 0,
      blockCount: caseBlocks.length,
      errors,
    };
  },

  getChainIntegritySummary(): {
    totalBlocks: number;
    totalCases: number;
    verifiedChains: number;
    tamperedChains: number;
  } {
    const blocks = this.getAll();
    const caseIds = [...new Set(blocks.map((b) => b.caseId))];

    let verifiedChains = 0;
    let tamperedChains = 0;

    caseIds.forEach((caseId) => {
      const result = this.verifyChainForCase(caseId);
      if (result.valid) {
        verifiedChains++;
      } else {
        tamperedChains++;
      }
    });

    return {
      totalBlocks: blocks.length,
      totalCases: caseIds.length,
      verifiedChains,
      tamperedChains,
    };
  },
};

// ============================================================
// Transfer Service — Evidence custody transfers
// ============================================================

export const TransferService = {
  transferCustody(params: {
    caseItem: Case;
    from: string;
    to: string;
    action?: string;
    signature?: string;
  }): { updatedCases: Case[]; updatedBlocks: Block[] } {
    const { caseItem, from, to, action, signature } = params;
    const transferAction = action || `Transferred to ${to}`;

    const newBlock = BlockService.createBlock({
      caseId: caseItem.id,
      from,
      to,
      action: transferAction,
      fileHash: caseItem.evidenceFiles[0]?.hash || '',
      signature,
    });

    const updatedBlocks = BlockService.addBlock(newBlock);

    const updatedCases = CaseService.update(caseItem.id, {
      currentHolder: to,
      status: 'in-progress',
    });

    return { updatedCases, updatedBlocks };
  },
};
