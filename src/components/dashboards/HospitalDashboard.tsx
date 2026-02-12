import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Case } from '@/lib/mockData';
import { Block, signBlock } from '@/lib/blockchain';
import { CaseService, BlockService, TransferService } from '@/lib/dataService';
import { Heart, Send } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CustodyChain } from '@/components/CustodyChain';
import { useAuth } from '@/contexts/AuthContext';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [hospitalReport, setHospitalReport] = useState({
    medicalDetails: '',
    postMortem: '',
  });

  useEffect(() => {
    setCases(CaseService.getAll());
    setBlocks(BlockService.getAll());
  }, []);

  const hospitalCases = cases.filter((c) => c.currentHolder === 'Hospital');
  const getCaseBlocks = (caseId: string) => blocks.filter((b) => b.caseId === caseId);

  const handleSubmitReport = () => {
    if (!selectedCase || !user) return;

    const timestamp = new Date().toISOString();

    const signature = signBlock(
      {
        caseId: selectedCase.id,
        from: 'Hospital',
        to: 'Hospital',
        timestamp,
        fileHash: selectedCase.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: 'Medical Report Added',
      },
      user.email
    );

    const newBlock = BlockService.createBlock({
      caseId: selectedCase.id,
      from: 'Hospital',
      to: 'Hospital',
      action: 'Medical Report Added',
      fileHash: selectedCase.evidenceFiles[0]?.hash || '',
      signature,
    });

    const updatedCases = CaseService.update(selectedCase.id, {
      hospitalReport: {
        ...hospitalReport,
        addedAt: timestamp,
        signature,
      },
    });

    const updatedBlocks = BlockService.addBlock(newBlock);

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    setHospitalReport({ medicalDetails: '', postMortem: '' });
    toast.success('Medical report submitted with digital signature');
  };

  const handleTransferToCourt = (caseItem: Case) => {
    if (!user) return;

    const signature = signBlock(
      {
        caseId: caseItem.id,
        from: 'Hospital',
        to: 'Court',
        timestamp: new Date().toISOString(),
        fileHash: caseItem.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: 'Transferred to Court',
      },
      user.email
    );

    const { updatedCases, updatedBlocks } = TransferService.transferCustody({
      caseItem,
      from: 'Hospital',
      to: 'Court',
      signature,
    });

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    setSelectedCase(null);
    toast.success('Case transferred to Court');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        <div>
          <h2 className="text-3xl font-bold">Hospital Dashboard</h2>
          <p className="text-muted-foreground">Medical examination and post-mortem reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Assigned Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold animate-count-up">{hospitalCases.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Reports Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning animate-count-up">
                {hospitalCases.filter((c) => !c.hospitalReport).length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Reports Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-verified animate-count-up">
                {hospitalCases.filter((c) => c.hospitalReport).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Assigned Cases
            </CardTitle>
            <CardDescription>Cases received for medical examination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalCases.map((caseItem) => (
                <Card key={caseItem.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} />
                          {caseItem.hospitalReport && (
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
                            <CustodyChain blocks={getCaseBlocks(caseItem.id)} />

                            {caseItem.hospitalReport ? (
                              <Card className="bg-muted">
                                <CardHeader>
                                  <CardTitle className="text-base">Medical Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label>Medical Details</Label>
                                    <p className="text-sm mt-1">{caseItem.hospitalReport.medicalDetails}</p>
                                  </div>
                                  {caseItem.hospitalReport.postMortem && (
                                    <div>
                                      <Label>Post-Mortem Details</Label>
                                      <p className="text-sm mt-1">{caseItem.hospitalReport.postMortem}</p>
                                    </div>
                                  )}
                                  <div>
                                    <Label>Submitted At</Label>
                                    <p className="text-sm mt-1">{new Date(caseItem.hospitalReport.addedAt).toLocaleString()}</p>
                                  </div>
                                  {caseItem.hospitalReport.signature && (
                                    <div>
                                      <Label>Digital Signature</Label>
                                      <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1 block break-all">
                                        {caseItem.hospitalReport.signature}
                                      </code>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ) : (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Submit Medical Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Medical Details</Label>
                                    <Textarea
                                      placeholder="Describe medical examination findings..."
                                      value={hospitalReport.medicalDetails}
                                      onChange={(e) => setHospitalReport({ ...hospitalReport, medicalDetails: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Post-Mortem Details (if applicable)</Label>
                                    <Textarea
                                      placeholder="Detail post-mortem findings..."
                                      value={hospitalReport.postMortem}
                                      onChange={(e) => setHospitalReport({ ...hospitalReport, postMortem: e.target.value })}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSubmitReport}
                                    disabled={!hospitalReport.medicalDetails}
                                    className="w-full"
                                  >
                                    Submit Report with Digital Signature
                                  </Button>
                                </CardContent>
                              </Card>
                            )}

                            {caseItem.hospitalReport && (
                              <Button onClick={() => handleTransferToCourt(caseItem)} className="w-full gap-2">
                                <Send className="h-4 w-4" />
                                Transfer to Court
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {hospitalCases.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No cases assigned yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HospitalDashboard;
