import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Case } from '@/lib/mockData';
import { Block, signBlock, verifyChain } from '@/lib/blockchain';
import { CaseService, BlockService, TransferService } from '@/lib/dataService';
import { Microscope, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustodyChain } from '@/components/CustodyChain';
import { useAuth } from '@/contexts/AuthContext';

const LabDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [labReport, setLabReport] = useState({
    testPerformed: '',
    findings: '',
  });

  useEffect(() => {
    setCases(CaseService.getAll());
    setBlocks(BlockService.getAll());
  }, []);

  const labCases = cases.filter((c) => c.currentHolder === 'Lab');
  const getCaseBlocks = (caseId: string) => blocks.filter((b) => b.caseId === caseId);

  const verifyEvidence = (caseItem: Case) => {
    const caseBlocks = getCaseBlocks(caseItem.id);
    const isValid = verifyChain(caseBlocks);

    if (isValid) {
      toast.success('Evidence integrity verified', {
        description: 'SHA-256 hash chain is intact. No tampering detected.',
      });
    } else {
      toast.error('Evidence integrity check FAILED', {
        description: 'Hash chain mismatch detected. Evidence may have been tampered with.',
      });
    }
    return isValid;
  };

  const handleSubmitReport = () => {
    if (!selectedCase || !user) return;

    const timestamp = new Date().toISOString();

    const signature = signBlock(
      {
        caseId: selectedCase.id,
        from: 'Lab',
        to: 'Lab',
        timestamp,
        fileHash: selectedCase.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: 'Lab Report Added',
      },
      user.email
    );

    const newBlock = BlockService.createBlock({
      caseId: selectedCase.id,
      from: 'Lab',
      to: 'Lab',
      action: 'Lab Report Added',
      fileHash: selectedCase.evidenceFiles[0]?.hash || '',
      signature,
    });

    const updatedCases = CaseService.update(selectedCase.id, {
      labReport: {
        ...labReport,
        addedAt: timestamp,
        signature,
      },
    });

    const updatedBlocks = BlockService.addBlock(newBlock);

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    setLabReport({ testPerformed: '', findings: '' });
    toast.success('Lab report submitted with digital signature');
  };

  const handleTransfer = (caseItem: Case, to: 'Hospital' | 'Court') => {
    if (!user) return;

    const signature = signBlock(
      {
        caseId: caseItem.id,
        from: 'Lab',
        to,
        timestamp: new Date().toISOString(),
        fileHash: caseItem.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: `Transferred to ${to}`,
      },
      user.email
    );

    const { updatedCases, updatedBlocks } = TransferService.transferCustody({
      caseItem,
      from: 'Lab',
      to,
      signature,
    });

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    setSelectedCase(null);
    toast.success(`Case transferred to ${to}`);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        <div>
          <h2 className="text-3xl font-bold">Forensic Lab Dashboard</h2>
          <p className="text-muted-foreground">Analyze evidence and submit reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold animate-count-up">{labCases.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Reports Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning animate-count-up">
                {labCases.filter((c) => !c.labReport).length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Reports Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-verified animate-count-up">
                {labCases.filter((c) => c.labReport).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5" />
              Assigned Cases
            </CardTitle>
            <CardDescription>Cases received for forensic analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {labCases.map((caseItem) => (
                <Card key={caseItem.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} />
                          {caseItem.labReport && (
                            <span className="text-xs bg-verified/10 text-verified px-2 py-1 rounded-full">
                              ✓ Report Submitted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Case ID:</span>
                          <span className="ml-2 font-mono text-xs">{caseItem.id}</span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCase(caseItem)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{caseItem.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Verify Evidence Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => verifyEvidence(caseItem)}
                              className="gap-2"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Verify Evidence Integrity
                            </Button>

                            <CustodyChain blocks={getCaseBlocks(caseItem.id)} />

                            {caseItem.labReport ? (
                              <Card className="bg-muted">
                                <CardHeader>
                                  <CardTitle className="text-base">Lab Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label>Tests Performed</Label>
                                    <p className="text-sm mt-1">{caseItem.labReport.testPerformed}</p>
                                  </div>
                                  <div>
                                    <Label>Findings</Label>
                                    <p className="text-sm mt-1">{caseItem.labReport.findings}</p>
                                  </div>
                                  <div>
                                    <Label>Submitted At</Label>
                                    <p className="text-sm mt-1">{new Date(caseItem.labReport.addedAt).toLocaleString()}</p>
                                  </div>
                                  {caseItem.labReport.signature && (
                                    <div>
                                      <Label>Digital Signature</Label>
                                      <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1 block break-all">
                                        {caseItem.labReport.signature}
                                      </code>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ) : (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Submit Lab Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Tests Performed</Label>
                                    <Textarea
                                      placeholder="Describe the forensic tests conducted..."
                                      value={labReport.testPerformed}
                                      onChange={(e) => setLabReport({ ...labReport, testPerformed: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Findings</Label>
                                    <Textarea
                                      placeholder="Detail your findings and conclusions..."
                                      value={labReport.findings}
                                      onChange={(e) => setLabReport({ ...labReport, findings: e.target.value })}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSubmitReport}
                                    disabled={!labReport.testPerformed || !labReport.findings}
                                    className="w-full"
                                  >
                                    Submit Report with Digital Signature
                                  </Button>
                                </CardContent>
                              </Card>
                            )}

                            {caseItem.labReport && (
                              <div className="flex gap-3">
                                <Button onClick={() => handleTransfer(caseItem, 'Hospital')} className="flex-1 gap-2" variant="outline">
                                  <Send className="h-4 w-4" />
                                  Transfer to Hospital
                                </Button>
                                <Button onClick={() => handleTransfer(caseItem, 'Court')} className="flex-1 gap-2">
                                  <Send className="h-4 w-4" />
                                  Transfer to Court
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
              {labCases.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No cases assigned yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LabDashboard;
