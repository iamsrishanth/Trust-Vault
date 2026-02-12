import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'verified' | 'closed';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    pending: { color: 'bg-pending', text: 'Pending', icon: Circle },
    'in-progress': { color: 'bg-warning', text: 'In Progress', icon: Circle },
    verified: { color: 'bg-verified', text: 'Verified', icon: Circle },
    closed: { color: 'bg-closed', text: 'Closed', icon: Circle },
  };

  const variant = variants[status];

  return (
    <Badge variant="outline" className="gap-1.5">
      <Circle className={`h-2 w-2 fill-current ${variant.color}`} />
      {variant.text}
    </Badge>
  );
};
