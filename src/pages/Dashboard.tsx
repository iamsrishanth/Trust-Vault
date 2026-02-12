import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PoliceDashboard from '@/components/dashboards/PoliceDashboard';
import LabDashboard from '@/components/dashboards/LabDashboard';
import HospitalDashboard from '@/components/dashboards/HospitalDashboard';
import CourtDashboard from '@/components/dashboards/CourtDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const dashboards = {
    police: PoliceDashboard,
    lab: LabDashboard,
    hospital: HospitalDashboard,
    court: CourtDashboard,
    admin: AdminDashboard,
  };

  const DashboardComponent = dashboards[user.role?.toLowerCase() as keyof typeof dashboards];

  if (!DashboardComponent) {
    return <div className="p-8 text-center">Invalid role assigned. Please contact support.</div>;
  }

  return <DashboardComponent />;
};

export default Dashboard;
