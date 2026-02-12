import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Case } from '@/lib/mockData';
import { Block, verifyChain } from '@/lib/blockchain';
import { CaseService, BlockService } from '@/lib/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, TrendingUp, CheckCircle, AlertCircle, Database, Link2, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setCases(CaseService.getAll());
    setBlocks(BlockService.getAll());
  }, []);

  const integrity = BlockService.getChainIntegritySummary();

  const departmentData = [
    { name: 'Police', cases: cases.filter((c) => c.currentHolder === 'Police').length },
    { name: 'Lab', cases: cases.filter((c) => c.currentHolder === 'Lab').length },
    { name: 'Hospital', cases: cases.filter((c) => c.currentHolder === 'Hospital').length },
    { name: 'Court', cases: cases.filter((c) => c.currentHolder === 'Court').length },
  ];

  const statusData = [
    { name: 'Pending', value: cases.filter((c) => c.status === 'pending').length, color: 'hsl(var(--pending))' },
    { name: 'In Progress', value: cases.filter((c) => c.status === 'in-progress').length, color: 'hsl(var(--warning))' },
    { name: 'Verified', value: cases.filter((c) => c.status === 'verified').length, color: 'hsl(var(--verified))' },
    { name: 'Closed', value: cases.filter((c) => c.status === 'closed').length, color: 'hsl(var(--closed))' },
  ];

  // Recent transfers (last 10 blocks)
  const recentBlocks = [...blocks].reverse().slice(0, 10);

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">System overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Total Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold animate-count-up">{cases.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                Total Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500 animate-count-up">{integrity.totalBlocks}</div>
              <p className="text-xs text-muted-foreground mt-1">Blockchain records</p>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-verified" />
                Verified Chains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-verified animate-count-up">{integrity.verifiedChains}</div>
              <p className="text-xs text-muted-foreground mt-1">Integrity confirmed</p>
            </CardContent>
          </Card>

          <Card className="glass gradient-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive animate-count-up">{integrity.tamperedChains}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Cases by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Case Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Custody Transfers */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Recent Custody Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBlocks.length > 0 ? (
              <div className="space-y-3">
                {recentBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{block.from}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{block.to}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground truncate">{block.action}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {block.caseId} • {new Date(block.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No transfers recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* All Cases Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Case ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Current Holder</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Blocks</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.slice(0, 15).map((caseItem) => {
                    const caseBlocks = blocks.filter((b) => b.caseId === caseItem.id);
                    return (
                      <tr key={caseItem.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{caseItem.id}</td>
                        <td className="py-3 px-4 text-sm">{caseItem.title}</td>
                        <td className="py-3 px-4 text-sm">{caseItem.currentHolder}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${caseItem.status === 'verified'
                                ? 'bg-verified/10 text-verified'
                                : caseItem.status === 'closed'
                                  ? 'bg-closed/10 text-closed'
                                  : caseItem.status === 'in-progress'
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-pending/10 text-pending'
                              }`}
                          >
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{caseBlocks.length}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(caseItem.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {cases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No cases in the system yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
