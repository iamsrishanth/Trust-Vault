import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustodyChain } from '@/components/CustodyChain';
import { BlockService, CaseService } from '@/lib/dataService';
import { Block, verifyChain } from '@/lib/blockchain';
import { Case } from '@/lib/mockData';
import { Search, FileSearch, Shield, Database, CheckCircle, Download, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AuditTrail = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        setCases(CaseService.getAll());
        setBlocks(BlockService.getAll());
    }, [isAuthenticated, navigate]);

    const filteredCases = cases.filter((c) =>
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedCase = selectedCaseId ? cases.find((c) => c.id === selectedCaseId) : null;
    const selectedBlocks = selectedCaseId ? BlockService.getByCaseId(selectedCaseId) : [];
    const isVerified = selectedBlocks.length > 0 ? verifyChain(selectedBlocks) : true;

    const integrity = BlockService.getChainIntegritySummary();

    const downloadAuditLog = (caseItem: Case) => {
        const caseBlocks = BlockService.getByCaseId(caseItem.id);
        const content = `
╔══════════════════════════════════════════════════╗
║         TRUSTVAULT BLOCKCHAIN AUDIT REPORT        ║
╚══════════════════════════════════════════════════╝

Case ID:        ${caseItem.id}
Case Title:     ${caseItem.title}
Status:         ${caseItem.status.toUpperCase()}
Current Holder: ${caseItem.currentHolder}
Created By:     ${caseItem.createdBy}
Created At:     ${new Date(caseItem.createdAt).toLocaleString()}
Generated:      ${new Date().toLocaleString()}

EVIDENCE TYPE:  ${caseItem.evidenceType || 'Not specified'}
EVIDENCE FILES: ${caseItem.evidenceFiles.length} file(s)
${caseItem.evidenceFiles.map((f, i) => `  ${i + 1}. ${f.name} (SHA-256: ${f.hash})`).join('\n')}

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
VERIFICATION STATUS: ${verifyChain(caseBlocks) ? '✅ VERIFIED — No tampering detected' : '❌ TAMPERED — Chain integrity compromised'}
Total Blocks:        ${caseBlocks.length}
═══════════════════════════════════════════════════
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-report-${caseItem.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Audit report downloaded');
    };

    return (
        <Layout>
            <div className="space-y-6 animate-slide-in-up">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <FileSearch className="h-8 w-8 text-primary" />
                            Audit Trail
                        </h2>
                        <p className="text-muted-foreground mt-1">Search and verify evidence custody chains</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Blocks', value: integrity.totalBlocks, icon: Database, color: 'text-blue-500' },
                        { label: 'Total Cases', value: integrity.totalCases, icon: Shield, color: 'text-primary' },
                        { label: 'Verified Chains', value: integrity.verifiedChains, icon: CheckCircle, color: 'text-emerald-500' },
                        { label: 'Issues Found', value: integrity.tamperedChains, icon: Shield, color: 'text-destructive' },
                    ].map((stat) => (
                        <Card key={stat.label} className="glass">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    <div>
                                        <div className="text-2xl font-bold">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Search */}
                <Card className="glass">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by Case ID or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Case List */}
                    <div className="lg:col-span-1">
                        <Card className="glass">
                            <CardHeader>
                                <CardTitle className="text-base">Cases ({filteredCases.length})</CardTitle>
                                <CardDescription>Select a case to view its custody chain</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                    {filteredCases.map((caseItem) => {
                                        const caseBlocks = BlockService.getByCaseId(caseItem.id);
                                        const isValid = verifyChain(caseBlocks);

                                        return (
                                            <button
                                                key={caseItem.id}
                                                onClick={() => setSelectedCaseId(caseItem.id)}
                                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-card ${selectedCaseId === caseItem.id
                                                        ? 'border-primary bg-primary/5 shadow-card'
                                                        : 'border-border/50 hover:border-primary/30'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-mono text-xs text-muted-foreground">{caseItem.id}</span>
                                                    {isValid ? (
                                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Shield className="h-3.5 w-3.5 text-destructive" />
                                                    )}
                                                </div>
                                                <div className="font-medium text-sm truncate">{caseItem.title}</div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {caseBlocks.length} blocks
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${caseItem.status === 'verified'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : caseItem.status === 'closed'
                                                                ? 'bg-slate-500/10 text-slate-600'
                                                                : 'bg-primary/10 text-primary'
                                                        }`}>
                                                        {caseItem.status}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {filteredCases.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            {searchQuery ? 'No matching cases found.' : 'No cases registered yet.'}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chain Detail */}
                    <div className="lg:col-span-2">
                        {selectedCase ? (
                            <Card className="glass">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{selectedCase.title}</CardTitle>
                                            <CardDescription className="font-mono text-xs mt-1">
                                                {selectedCase.id} • {selectedBlocks.length} blocks
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadAuditLog(selectedCase)}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Report
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CustodyChain blocks={selectedBlocks} verified={isVerified} />
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="glass">
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <FileSearch className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-muted-foreground text-sm">Select a case to view its custody chain</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AuditTrail;
