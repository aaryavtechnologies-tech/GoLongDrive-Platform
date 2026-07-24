'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDocument, useDocumentHistory } from '@/hooks/useDocument';
import { DriverSummaryCard } from '@/components/documents/DriverSummaryCard';
import { ImageViewer } from '@/components/documents/ImageViewer';
import { VerificationPanel } from '@/components/documents/VerificationPanel';
import { VerificationTimeline } from '@/components/documents/VerificationTimeline';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, HardDrive, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from 'date-fns';
import { DocumentStatusBadge } from '@/components/documents/DocumentStatusBadge';

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: document, isLoading: isDocumentLoading, isError, refetch } = useDocument(id);
  const { data: timeline, isLoading: isTimelineLoading } = useDocumentHistory(id);

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load document details')} reset={refetch} />;
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/documents" className="text-zinc-400 hover:text-white">Verification</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">
                  {isDocumentLoading ? <Skeleton className="h-4 w-24 bg-zinc-800" /> : document?.id}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mt-1">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              {isDocumentLoading ? <Skeleton className="h-8 w-48 bg-zinc-800" /> : document?.type}
              {!isDocumentLoading && document && <DocumentStatusBadge status={document.status} />}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Document Preview */}
          <div className="bg-zinc-950 border border-white/5 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-zinc-400" />
                Preview
              </h2>
            </div>
            {isDocumentLoading ? (
              <Skeleton className="h-[600px] w-full bg-zinc-900" />
            ) : document ? (
              <ImageViewer 
                url={document.url} 
                fileType={document.metadata.fileType} 
                documentName={`${document.driverName} - ${document.type}`}
              />
            ) : null}
          </div>

          {/* Metadata Bar */}
          {!isDocumentLoading && document && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-2 rounded text-zinc-400"><Calendar className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-zinc-500">Uploaded</p>
                  <p className="text-sm font-medium text-white">{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-2 rounded text-zinc-400"><HardDrive className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-zinc-500">Size</p>
                  <p className="text-sm font-medium text-white">{formatSize(document.metadata.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-2 rounded text-zinc-400"><Hash className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-zinc-500">Format</p>
                  <p className="text-sm font-medium text-white">{document.metadata.fileType.split('/')[1]?.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-2 rounded text-zinc-400"><Calendar className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs text-zinc-500">Expiry</p>
                  <p className="text-sm font-medium text-white">
                    {document.expiryDate ? format(new Date(document.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isDocumentLoading ? (
            <Skeleton className="h-[200px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : document ? (
            <DriverSummaryCard document={document} />
          ) : null}
        </div>

        <div className="xl:col-span-1 space-y-6">
          {isDocumentLoading ? (
            <Skeleton className="h-[300px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : document ? (
            <VerificationPanel document={document} />
          ) : null}

          <VerificationTimeline data={timeline} isLoading={isTimelineLoading} />
        </div>
      </div>
    </div>
  );
}
