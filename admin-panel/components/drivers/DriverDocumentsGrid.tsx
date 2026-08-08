'use client';

import * as React from 'react';
import Image from 'next/image';
import { DriverDocument, DocumentStatus } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ZoomIn, Check, X, FileCheck2, FileWarning } from 'lucide-react';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';
import { useUpdateDocumentStatus } from '@/hooks/useDriverActions';

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
  const updateStatus = useUpdateDocumentStatus();

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Approved': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 absolute top-2 right-2 backdrop-blur-md">Approved</Badge>;
      case 'Pending': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 absolute top-2 right-2 backdrop-blur-md">Pending</Badge>;
      case 'Rejected': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 absolute top-2 right-2 backdrop-blur-md">Rejected</Badge>;
      default: return null;
    }
  };

  const handleStatusUpdate = (docId: string, status: DocumentStatus) => {
    updateStatus.mutate({ driverId, docId, status });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full bg-zinc-950 rounded-lg border border-white/5" />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-8 border border-white/5 border-dashed rounded-lg bg-zinc-950/30">
        <FileWarning className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
        <p className="text-zinc-400">No documents found for this driver.</p>
      </div>
    );
  }

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051/api/v1').replace(/\/api\/v1\/?$/, '');
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="bg-zinc-950 border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-md flex flex-col">
            <div className="relative h-40 w-full bg-zinc-900">
              <Image 
                src={getImageUrl(doc.url)} 
                alt={doc.type} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                sizes="(max-w-768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                  onClick={() => setPreviewDoc({ url: getImageUrl(doc.url), title: doc.type })}
                >
                  <ZoomIn className="h-4 w-4 mr-2" /> Preview
                </Button>
              </div>
              {getStatusBadge(doc.status)}
            </div>
            <CardContent className="p-3 flex flex-col flex-1">
              <div className="text-sm font-medium text-zinc-200 mb-1">{doc.type}</div>
              <div className="text-xs text-zinc-500 mb-3 truncate">ID: {doc.id}</div>
              
              <div className="mt-auto flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-green-500/5 hover:bg-green-500/10 text-green-500 border-green-500/20 h-8 text-xs"
                  onClick={() => handleStatusUpdate(doc.id, 'Approved')}
                  disabled={doc.status === 'Approved' || updateStatus.isPending}
                >
                  <Check className="h-3 w-3 mr-1" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-red-500/5 hover:bg-red-500/10 text-red-500 border-red-500/20 h-8 text-xs"
                  onClick={() => handleStatusUpdate(doc.id, 'Rejected')}
                  disabled={doc.status === 'Rejected' || updateStatus.isPending}
                >
                  <X className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
