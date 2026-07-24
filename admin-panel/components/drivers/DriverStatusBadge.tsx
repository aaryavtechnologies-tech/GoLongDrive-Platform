import { Badge } from '@/components/ui/badge';
import { DriverApprovalStatus } from '@/types/driver';

export function DriverStatusBadge({ status }: { status: DriverApprovalStatus }) {
  switch (status) {
    case 'Approved':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Approved</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
    case 'Documents Submitted':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Docs Submitted</Badge>;
    case 'Under Review':
      return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Under Review</Badge>;
    case 'Suspended':
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Suspended</Badge>;
    case 'Rejected':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
