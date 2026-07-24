import { Badge } from '@/components/ui/badge';
import { DocumentStatus } from '@/types/document';

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'Pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
    case 'Submitted':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Submitted</Badge>;
    case 'Under Review':
      return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Under Review</Badge>;
    case 'Approved':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Approved</Badge>;
    case 'Rejected':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
    case 'Expired':
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
