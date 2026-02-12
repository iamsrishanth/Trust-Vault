import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Case, EVIDENCE_TYPES, EvidenceType } from '@/lib/mockData';
import { generateFileHash, Block, signBlock } from '@/lib/blockchain';
import { CaseService, BlockService, TransferService } from '@/lib/dataService';
import { Plus, FolderOpen, Upload, Send, Hash, FileType } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustodyChain } from '@/components/CustodyChain';

const PoliceDashboard = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    suspectDetails: '',
    date: '',
    location: '',
  });
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('physical');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [fileHashes, setFileHashes] = useState<{ name: string; hash: string; size: number; type: string }[]>([]);
  const [transferTo, setTransferTo] = useState<'Lab' | 'Hospital'>('Lab');
  const [hashing, setHashing] = useState(false);

  useEffect(() => {
    setCases(CaseService.getAll());
    setBlocks(BlockService.getAll());
  }, []);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const fileArr = Array.from(files);
    setEvidenceFiles(fileArr);
    setHashing(true);

    try {
      const hashes = await Promise.all(
        fileArr.map(async (file) => ({
          name: file.name,
          hash: await generateFileHash(file),
          size: file.size,
          type: file.type || 'unknown',
        }))
      );
      setFileHashes(hashes);
    } catch (error) {
      toast.error('Failed to hash files');
    } finally {
      setHashing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileHashes.length === 0 || !user) return;

    try {
      const caseId = CaseService.generateId();
      const timestamp = new Date().toISOString();

      const newCase: Case = {
        id: caseId,
        ...formData,
        status: 'pending',
        currentHolder: 'Police',
        createdBy: user.fullName || user.email,
        createdAt: timestamp,
        evidenceType,
        evidenceDescription,
        evidenceFiles: fileHashes.map((fh) => ({
          ...fh,
          uploadedBy: user.fullName || user.email,
          uploadedAt: timestamp,
        })),
      };

      const signature = signBlock(
        {
          caseId,
          from: 'System',
          to: 'Police',
          timestamp,
          fileHash: fileHashes[0].hash,
          previousHash: '0',
          action: 'Case Created',
        },
        user.email
      );

      const newBlock = BlockService.createBlock({
        caseId,
        from: 'System',
        to: 'Police',
        action: 'Case Created',
        fileHash: fileHashes[0].hash,
        fileName: fileHashes[0].name,
        fileSize: fileHashes[0].size,
        signature,
      });

      const updatedCases = CaseService.create(newCase);
      const updatedBlocks = BlockService.addBlock(newBlock);

      setCases(updatedCases);
      setBlocks(updatedBlocks);
      setShowNewCase(false);
      setFormData({ title: '', description: '', suspectDetails: '', date: '', location: '' });
      setEvidenceFiles([]);
      setFileHashes([]);
      setEvidenceDescription('');
      toast.success('Case registered with blockchain record');
    } catch (error) {
      toast.error('Failed to register case');
    }
  };

  const handleTransfer = (caseItem: Case) => {
    if (!user) return;

    const signature = signBlock(
      {
        caseId: caseItem.id,
        from: 'Police',
        to: transferTo,
        timestamp: new Date().toISOString(),
        fileHash: caseItem.evidenceFiles[0]?.hash || '',
        previousHash: '',
        action: `Transferred to ${transferTo}`,
      },
      user.email
    );

    const { updatedCases, updatedBlocks } = TransferService.transferCustody({
      caseItem,
      from: 'Police',
      to: transferTo,
      signature,
    });

    setCases(updatedCases);
    setBlocks(updatedBlocks);
    setSelectedCase(null);
    toast.success(`Evidence custody transferred to ${transferTo}`);
  };

  const getCaseBlocks = (caseId: string) => blocks.filter((b) => b.caseId === caseId);

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Police Dashboard</h2>
            <p className="text-muted-foreground">Register and manage criminal cases</p>
          </div>
          <Button onClick={() => setShowNewCase(true)} className="gap-2 shadow-md">
            <Plus className="h-4 w-4" />
            Register New Case
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold animate-count-up">{cases.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pending animate-count-up">
                {cases.filter((c) => c.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning animate-count-up">
                {cases.filter((c) => c.status === 'in-progress').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Case Dialog */}
        <Dialog open={showNewCase} onOpenChange={setShowNewCase}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Register New Case
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Crime Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspect">Suspect Details</Label>
                <Textarea id="suspect" value={formData.suspectDetails} onChange={(e) => setFormData({ ...formData, suspectDetails: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                </div>
              </div>

              {/* Evidence Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileType className="h-4 w-4" />
                  Evidence Type
                </Label>
                <Select value={evidenceType} onValueChange={(v: EvidenceType) => setEvidenceType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_TYPES.map((et) => (
                      <SelectItem key={et.value} value={et.value}>
                        {et.icon} {et.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceDesc">Evidence Description</Label>
                <Textarea
                  id="evidenceDesc"
                  placeholder="Describe the evidence in detail..."
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence Files</Label>
                <Input id="evidence" type="file" multiple onChange={(e) => handleFileSelect(e.target.files)} required />
              </div>

              {/* Hash Preview */}
              {fileHashes.length > 0 && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-primary" />
                    SHA-256 Hash Preview
                  </div>
                  {fileHashes.map((fh, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <div className="font-medium">{fh.name}</div>
                      <code className="text-[10px] font-mono text-muted-foreground break-all bg-background px-2 py-1 rounded block">
                        {fh.hash}
                      </code>
                    </div>
                  ))}
                </div>
              )}

              {hashing && (
                <div className="text-sm text-muted-foreground animate-pulse">
                  Generating SHA-256 hashes...
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={fileHashes.length === 0 || hashing}>
                <Upload className="h-4 w-4" />
                Register Case with Blockchain Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Case List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              All Cases
            </CardTitle>
            <CardDescription>Manage and track all registered cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} />
                          {caseItem.evidenceType && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {EVIDENCE_TYPES.find((et) => et.value === caseItem.evidenceType)?.icon}{' '}
                              {EVIDENCE_TYPES.find((et) => et.value === caseItem.evidenceType)?.label}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Case ID:</span>
                            <span className="ml-2 font-mono text-xs">{caseItem.id}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Holder:</span>
                            <span className="ml-2 font-medium">{caseItem.currentHolder}</span>
                          </div>
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
                              <div>
                                <Label>Location</Label>
                                <p className="text-sm">{caseItem.location}</p>
                              </div>
                              <div>
                                <Label>Date</Label>
                                <p className="text-sm">{caseItem.date}</p>
                              </div>
                            </div>

                            {/* Evidence Files */}
                            {caseItem.evidenceFiles.length > 0 && (
                              <div className="space-y-2">
                                <Label>Evidence Files ({caseItem.evidenceFiles.length})</Label>
                                <div className="space-y-1">
                                  {caseItem.evidenceFiles.map((ef, i) => (
                                    <div key={i} className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                                      <span className="font-medium">{ef.name}</span>
                                      <code className="font-mono text-muted-foreground">
                                        {ef.hash.substring(0, 16)}...
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <CustodyChain blocks={getCaseBlocks(caseItem.id)} />

                            {caseItem.currentHolder === 'Police' && (
                              <div className="space-y-4 pt-4 border-t">
                                <Label>Transfer Custody To</Label>
                                <div className="flex gap-4">
                                  <Select value={transferTo} onValueChange={(v: 'Lab' | 'Hospital') => setTransferTo(v)}>
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Lab">Forensic Lab</SelectItem>
                                      <SelectItem value="Hospital">Hospital</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button onClick={() => handleTransfer(caseItem)} className="gap-2">
                                    <Send className="h-4 w-4" />
                                    Transfer Custody
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {cases.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No cases registered yet. Click "Register New Case" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PoliceDashboard;
