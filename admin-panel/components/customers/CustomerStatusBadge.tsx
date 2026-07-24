import { Badge } from '@/components/ui/badge';
import { CustomerStatus } from '@/types/customer';

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  switch (status) {
    case 'Active':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>;
    case 'Inactive':
      return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Inactive</Badge>;
    case 'Blocked':
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Blocked</Badge>;
    case 'Deleted':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Deleted</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
