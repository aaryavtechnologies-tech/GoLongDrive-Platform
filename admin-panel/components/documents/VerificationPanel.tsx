'use client';

import * as React from 'react';
import { DriverDocumentDetails } from '@/types/document';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { ApproveDialog } from './dialogs/ApproveDialog';
import { RejectDialog } from './dialogs/RejectDialog';
import { useUpdateDocumentStatus } from '@/hooks/useDocumentActions';

export function VerificationPanel({ document }: { document: DriverDocumentDetails }) {
  const [internalNotes, setInternalNotes] = React.useState(document.notes || '');
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  
  const isPending = document.status === 'Pending' || document.status === 'Submitted' || document.status === 'Under Review';
  
  const updateStatus = useUpdateDocumentStatus();

  // If status is "Pending" or "Submitted", when the admin opens this page, 
  // they are technically reviewing it. We could auto-mark as "Under Review".
  React.useEffect(() => {
    if (document.status === 'Pending' || document.status === 'Submitted') {
      updateStatus.mutate({ id: document.id, status: 'Under Review' });
    }
  }, []);

  return (
    <>
      <Card className="bg-zinc-950 border-white/5 text-white shadow-md sticky top-6">
        <CardHeader className="pb-4 border-b border-white/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zinc-400" />
            Verification Action
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {isPending ? (
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Please carefully review the document for clarity, validity, and match against driver details.</p>
            </div>
          ) : (
            <div className={`border p-3 rounded-lg flex items-start gap-3 text-sm ${
              document.status === 'Approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 
              document.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
              'bg-orange-500/10 border-orange-500/20 text-orange-400'
            }`}>
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Document is {document.status}</p>
                {document.reviewedBy && (
                  <p className="text-xs mt-1 opacity-80">Reviewed by {document.reviewedBy}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Internal Notes / Reason</label>
            <Textarea 
              placeholder="Add internal notes or rejection reason..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={!isPending}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400 text-white min-h-[120px] resize-none disabled:opacity-50"
            />
          </div>
        </CardContent>
        {isPending && (
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg shadow-lg shadow-green-900/20"
              onClick={() => setIsApproveOpen(true)}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Approve Document
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 h-12 text-lg"
              onClick={() => setIsRejectOpen(true)}
            >
              <XCircle className="mr-2 h-5 w-5" />
              Reject Document
            </Button>
          </CardFooter>
        )}
      </Card>

      <ApproveDialog 
        isOpen={isApproveOpen} 
        onClose={() => setIsApproveOpen(false)} 
        documentId={document.id} 
      />
      
      <RejectDialog 
        isOpen={isRejectOpen} 
        onClose={() => setIsRejectOpen(false)} 
        documentId={document.id} 
      />
    </>
  );
}
