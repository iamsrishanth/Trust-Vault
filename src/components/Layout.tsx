import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, User, Moon, Sun, FileSearch, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const stored = localStorage.getItem('trustvault-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('trustvault-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('trustvault-theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">TrustVault</h1>
                  <p className="text-[10px] text-muted-foreground leading-none">Evidence Management</p>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="gap-2 text-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={location.pathname === '/audit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate('/audit')}
                  className="gap-2 text-sm"
                >
                  <FileSearch className="h-4 w-4" />
                  Audit Trail
                </Button>
              </nav>
            </div>

            {/* User & Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {user && (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
                    <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium leading-tight">{user.fullName || user.email}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{user.role}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
