import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '@/types/payment';
import { InvoiceStatus } from '@/types/invoice';
import { SettlementStatus } from '@/types/earning';
import { CouponStatus } from '@/types/coupon';

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
    case 'Partially Refunded':
      return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">Partial Refund</Badge>;
    case 'Failed':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case 'Paid':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Paid</Badge>;
    case 'Unpaid':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Unpaid</Badge>;
    case 'Overdue':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Overdue</Badge>;
    case 'Cancelled':
      return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function SettlementStatusBadge({ status }: { status: SettlementStatus }) {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Settled</Badge>;
    case 'Pending':
      return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
    case 'Processing':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Processing</Badge>;
    case 'Failed':
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function CouponStatusBadge({ status }: { status: CouponStatus }) {
  switch (status) {
    case 'Active':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Active</Badge>;
    case 'Inactive':
      return <Badge className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20">Inactive</Badge>;
    case 'Expired':
      return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">Expired</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
