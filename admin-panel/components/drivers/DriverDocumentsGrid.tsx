'use client';

import * as React from 'react';
import Image from 'next/image';
import { DriverDocument, DocumentStatus } from '@/types/driver';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ZoomIn, Check, X, FileWarning, FileText, ExternalLink, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { useUpdateDocumentStatus } from '@/hooks/useDriverActions';
import { getMediaUrl } from '@/lib/utils';

export function DriverDocumentsGrid({ 
  driverId, 
  documents, 
  isLoading 
}: { 
  driverId: string;
  documents?: DriverDocument[]; 
  isLoading: boolean;
}) {
  const [previewDoc, setPreviewDoc] = React.useState<{ url: string; title: string } | null>(null);
  const [failedImages, setFailedImages] = React.useState<Record<string, boolean>>({});
  const updateStatus = useUpdateDocumentStatus();

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Approved': 
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-sm">
            <ShieldCheck className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'Pending': 
        return (
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-sm">
            <Clock className="h-3 w-3" /> Under Review
          </Badge>
        );
      case 'Rejected': 
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 backdrop-blur-md px-2.5 py-1 text-xs font-medium flex items-center gap-1 shadow-sm">
            <AlertTriangle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default: 
        return null;
    }
  };

  const handleStatusUpdate = (docId: string, status: DocumentStatus) => {
    updateStatus.mutate({ driverId, docId, status });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full bg-zinc-950/70 rounded-xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-10 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 backdrop-blur-sm">
        <FileWarning className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">No Documents Uploaded</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
          The driver hasn't submitted their required verification documents yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc) => {
          const docUrl = getMediaUrl(doc.url);
          const isFailed = failedImages[doc.id] || !docUrl;

          return (
            <Card 
              key={doc.id} 
              className="bg-zinc-950/80 border border-white/5 hover:border-yellow-500/30 overflow-hidden group transition-all duration-300 rounded-xl flex flex-col shadow-lg shadow-black/40 hover:shadow-yellow-500/5"
            >
              <div className="relative h-44 w-full bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center overflow-hidden">
                {!isFailed ? (
                  <Image 
                    src={docUrl} 
                    alt={doc.type} 
                    fill 
                    unoptimized
                    onError={() => setFailedImages((prev) => ({ ...prev, [doc.id]: true }))}
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-yellow-400 transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="text-xs text-zinc-400 font-medium line-clamp-1">{doc.type}</span>
                    <span className="text-[11px] text-zinc-600">Preview not available</span>
                  </div>
                )}

                {/* Status Badge overlay */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  {getStatusBadge(doc.status)}
                </div>

                {/* Hover overlay with zoom */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-xs z-10">
                  {docUrl && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white/15 hover:bg-white/25 text-white border border-white/10 backdrop-blur-md text-xs h-8 px-3"
                      onClick={() => setPreviewDoc({ url: docUrl, title: doc.type })}
                    >
                      <ZoomIn className="h-3.5 w-3.5 mr-1.5" /> View
                    </Button>
                  )}
                  {docUrl && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white/15 hover:bg-white/25 text-white border border-white/10 backdrop-blur-md text-xs h-8 w-8 p-0"
                      onClick={() => window.open(docUrl, '_blank')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-zinc-200 truncate">{doc.type}</h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">Document ID: {doc.id}</p>
                </div>

                {doc.status === 'Pending' ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 h-8 text-xs font-medium"
                      onClick={() => handleStatusUpdate(doc.id, 'Approved')}
                      disabled={updateStatus.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 h-8 text-xs font-medium"
                      onClick={() => handleStatusUpdate(doc.id, 'Rejected')}
                      disabled={updateStatus.isPending}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <span>Status</span>
                    <span className={doc.status === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}>
                      {doc.status}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {previewDoc && (
        <DocumentPreviewDialog 
          isOpen={!!previewDoc} 
          onClose={() => setPreviewDoc(null)} 
          imageUrl={previewDoc.url} 
          title={previewDoc.title} 
        />
      )}
    </>
  );
}
