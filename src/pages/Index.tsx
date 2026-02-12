import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Database, FileCheck, ArrowRight, Fingerprint, Link2, Eye } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ blocks: 0, transfers: 0, integrity: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const targets = { blocks: 1247, transfers: 3862, integrity: 100 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounters({
        blocks: Math.round(targets.blocks * ease),
        transfers: Math.round(targets.transfers * ease),
        integrity: Math.round(targets.integrity * ease),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center glow-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TrustVault</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="gap-2 shadow-lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium mb-8 animate-slide-in-up">
            <Lock className="h-4 w-4 text-primary" />
            <span>Blockchain-Powered Evidence Integrity</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-in-up stagger-1">
            Tamper-Proof
            <br />
            <span className="text-gradient">Evidence Management</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-in-up stagger-2">
            Ensuring the integrity of crime evidence through immutable custody chains,
            cryptographic hashing, and role-based access control.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up stagger-3">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="gap-2 px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Shield className="h-5 w-5" />
              Launch Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="gap-2 px-8 py-6 text-lg glass hover:bg-primary/5 transition-all duration-300"
            >
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Blocks Secured', value: counters.blocks.toLocaleString(), suffix: '+', icon: Database },
              { label: 'Custody Transfers', value: counters.transfers.toLocaleString(), suffix: '+', icon: Link2 },
              { label: 'Chain Integrity', value: counters.integrity.toString(), suffix: '%', icon: Shield },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`glass rounded-2xl p-6 text-center gradient-border animate-slide-in-up stagger-${i + 1}`}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-gradient animate-count-up">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="text-gradient">Evidence Integrity</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature designed to prevent tampering, ensure transparency, and maintain a complete chain of custody.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Lock,
                title: 'Immutable Custody Chain',
                description: 'Every transfer is cryptographically linked. Once recorded, evidence history cannot be altered.',
                color: 'text-blue-500',
              },
              {
                icon: Fingerprint,
                title: 'SHA-256 Hash Verification',
                description: 'Every piece of evidence gets a unique digital fingerprint. Any tampering is instantly detectable.',
                color: 'text-purple-500',
              },
              {
                icon: Database,
                title: 'Role-Based Access',
                description: 'Police, Lab, Hospital, and Court — each role has specific permissions and workflows.',
                color: 'text-emerald-500',
              },
              {
                icon: Eye,
                title: 'Full Audit Trail',
                description: 'Complete chronological history of every custody transfer, viewable by authorized personnel.',
                color: 'text-amber-500',
              },
              {
                icon: Link2,
                title: 'Digital Signatures',
                description: 'HMAC-SHA256 signatures verify the identity of every person in the chain of custody.',
                color: 'text-rose-500',
              },
              {
                icon: FileCheck,
                title: 'Downloadable Reports',
                description: 'Generate and download audit reports for court proceedings with full chain verification.',
                color: 'text-cyan-500',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`group glass rounded-2xl p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">TrustVault</span> Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A secure evidence lifecycle from collection to court presentation.
            </p>
          </div>

          <div className="space-y-0">
            {[
              { step: '01', role: 'Police Officer', action: 'Registers evidence with SHA-256 hash', icon: '🛡️' },
              { step: '02', role: 'Forensic Lab', action: 'Analyzes evidence and submits report', icon: '🔬' },
              { step: '03', role: 'Hospital', action: 'Conducts medical examination', icon: '🏥' },
              { step: '04', role: 'Court Official', action: 'Verifies chain integrity and reviews case', icon: '⚖️' },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="h-14 w-14 rounded-2xl glass gradient-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  {i < 3 && (
                    <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </div>
                <div className="flex-1 glass rounded-xl p-4 group-hover:shadow-card transition-all duration-300">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Step {item.step}</span>
                    <span className="text-sm font-semibold">{item.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="glass rounded-3xl p-12 gradient-border">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Evidence?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Start managing evidence with blockchain-level security. Create your account in seconds.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="gap-2 px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2026 TrustVault — Blockchain Evidence Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
