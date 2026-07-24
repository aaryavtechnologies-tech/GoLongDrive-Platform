import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types/ride';

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case 'Pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
    case 'Advance Paid':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Advance Paid</Badge>;
    case 'Paid':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Paid</Badge>;
    case 'Refunded':
      return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Refunded</Badge>;
    case 'Failed':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
