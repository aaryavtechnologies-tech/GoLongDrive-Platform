import { Badge } from '@/components/ui/badge';
import { RideStatus } from '@/types/ride';

export function RideStatusBadge({ status }: { status: RideStatus }) {
  switch (status) {
    case 'Pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
    case 'Searching Driver':
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Searching Driver</Badge>;
    case 'Driver Assigned':
    case 'Driver Accepted':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{status}</Badge>;
    case 'Confirmed':
      return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Confirmed</Badge>;
    case 'Driver Arrived':
      return <Badge className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20">Driver Arrived</Badge>;
    case 'Trip Started':
      return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 animate-pulse">Trip Started</Badge>;
    case 'Trip Completed':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
    case 'Cancelled by Customer':
    case 'Cancelled by Driver':
    case 'Cancelled by Admin':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">{status.replace('Cancelled by ', 'Cancelled (') + ')'}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
