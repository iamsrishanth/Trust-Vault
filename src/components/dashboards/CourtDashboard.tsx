import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Case } from '@/lib/mockData';
import { Block, verifyChain, signBlock } from '@/lib/blockchain';
import { CaseService, BlockService } from '@/lib/dataService';
import { Scale, CheckCircle, XCircle, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustodyChain } from '@/components/CustodyChain';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const CourtDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setCases(CaseService.getAll());
    setBlocks(BlockService.getAll());
  }, []);

  const courtCases = cases.filter((c) => c.currentHolder === 'Court');
  const getCaseBlocks = (caseId: string) => blocks.filter((b) => b.caseId === caseId);

  const verifyCase = (caseId: string) => {
    const caseBlocks = getCaseBlocks(caseId);
    const result = BlockService.verifyChainForCase(caseId);

    if (result.valid) {
      toast.success('Chain verified successfully', {
        description: `All ${result.blockCount} blocks are properly linked with no tampering detected`,
      });
    } else {
      toast.error('Chain verification failed', {
        description: result.errors.join('; '),
      });
    }

    return result.valid;
  };

  const handleVerifyCase = (caseItem: Case) => {
    if (!user) return;

    const isValid = verifyCase(caseItem.id);
    if (!isValid) return;

    const signature = signBlock(
      {
        caseId: caseItem.id,
        from: 'Court',
        to: 'Court',
        timestamp: new Date().toISOString(),
        fileHash: caseItem.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: 'Case Verified',
      },
      user.email
    );

    const newBlock = BlockService.createBlock({
      caseId: caseItem.id,
      from: 'Court',
      to: 'Court',
      action: 'Case Verified',
      fileHash: caseItem.evidenceFiles[0]?.hash || '',
      signature,
    });

    const updatedBlocks = BlockService.addBlock(newBlock);
    const updatedCases = CaseService.update(caseItem.id, { status: 'verified' });

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    toast.success('Case marked as verified');
  };

  const handleCloseCase = (caseItem: Case) => {
    if (!user) return;

    const signature = signBlock(
      {
        caseId: caseItem.id,
        from: 'Court',
        to: 'Court',
        timestamp: new Date().toISOString(),
        fileHash: caseItem.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: 'Case Closed',
      },
      user.email
    );

    const newBlock = BlockService.createBlock({
      caseId: caseItem.id,
      from: 'Court',
      to: 'Court',
      action: 'Case Closed',
      fileHash: caseItem.evidenceFiles[0]?.hash || '',
      signature,
    });

    const updatedBlocks = BlockService.addBlock(newBlock);
    const updatedCases = CaseService.update(caseItem.id, { status: 'closed' });

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    toast.success('Case closed successfully');
  };

  const downloadAuditLog = (caseItem: Case) => {
    const caseBlocks = getCaseBlocks(caseItem.id);
    const content = `
╔══════════════════════════════════════════════════╗
║         TRUSTVAULT BLOCKCHAIN AUDIT REPORT        ║
╚══════════════════════════════════════════════════╝

Case ID:        ${caseItem.id}
Case Title:     ${caseItem.title}
Status:         ${caseItem.status.toUpperCase()}
Current Holder: ${caseItem.currentHolder}
Generated:      ${new Date().toLocaleString()}

═══════════════════════════════════════════════════
                  CUSTODY CHAIN
═══════════════════════════════════════════════════
${caseBlocks
        .map(
          (block, i) => `
┌─ Block #${i + 1} ─────────────────────────────────
│ From:         ${block.from}
│ To:           ${block.to}
│ Action:       ${block.action}
│ Timestamp:    ${new Date(block.timestamp).toLocaleString()}
│ File Hash:    ${block.fileHash}
│ Prev Hash:    ${block.previousHash}${block.signature ? `\n│ Signature:    ${block.signature}` : ''}
└──────────────────────────────────────────────────`
        )
        .join('\n')}

═══════════════════════════════════════════════════
VERIFICATION: ${verifyChain(caseBlocks) ? '✅ VERIFIED' : '❌ TAMPERED'}
Total Blocks:  ${caseBlocks.length}
═══════════════════════════════════════════════════
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${caseItem.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log downloaded');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        <div>
          <h2 className="text-3xl font-bold">Court Dashboard</h2>
          <p className="text-muted-foreground">Review cases and verify evidence integrity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold animate-count-up">{courtCases.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pending animate-count-up">
                {courtCases.filter((c) => c.status === 'in-progress').length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-verified animate-count-up">
                {courtCases.filter((c) => c.status === 'verified').length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-closed animate-count-up">
                {courtCases.filter((c) => c.status === 'closed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Court Cases
            </CardTitle>
            <CardDescription>Review and verify evidence integrity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courtCases.map((caseItem) => (
                <Card key={caseItem.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Case ID:</span>
                          <span className="ml-2 font-mono text-xs">{caseItem.id}</span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Review Case
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{caseItem.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Case ID</Label>
                                <p className="font-mono text-sm">{caseItem.id}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="mt-1">
                                  <StatusBadge status={caseItem.status} />
                                </div>
                              </div>
                            </div>

                            <CustodyChain
                              blocks={getCaseBlocks(caseItem.id)}
                              verified={verifyChain(getCaseBlocks(caseItem.id))}
                            />

                            {caseItem.labReport && (
                              <Card className="bg-muted">
                                <CardHeader>
                                  <CardTitle className="text-base">Lab Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <div><span className="font-medium">Tests:</span> {caseItem.labReport.testPerformed}</div>
                                  <div><span className="font-medium">Findings:</span> {caseItem.labReport.findings}</div>
                                </CardContent>
                              </Card>
                            )}

                            {caseItem.hospitalReport && (
                              <Card className="bg-muted">
                                <CardHeader>
                                  <CardTitle className="text-base">Medical Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  <div><span className="font-medium">Medical Details:</span> {caseItem.hospitalReport.medicalDetails}</div>
                                  {caseItem.hospitalReport.postMortem && (
                                    <div><span className="font-medium">Post-Mortem:</span> {caseItem.hospitalReport.postMortem}</div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                              <Button
                                onClick={() => verifyCase(caseItem.id)}
                                variant="outline"
                                className="flex-1 gap-2"
                              >
                                <ShieldCheck className="h-4 w-4" />
                                Verify Chain
                              </Button>
                              <Button
                                onClick={() => downloadAuditLog(caseItem)}
                                variant="outline"
                                className="flex-1 gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download Audit Log
                              </Button>
                            </div>

                            {caseItem.status !== 'closed' && (
                              <div className="flex gap-3">
                                {caseItem.status !== 'verified' && (
                                  <Button onClick={() => handleVerifyCase(caseItem)} className="flex-1 gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Mark as Verified
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleCloseCase(caseItem)}
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Close Case
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {courtCases.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No cases received yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CourtDashboard;
