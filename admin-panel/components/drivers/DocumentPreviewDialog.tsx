'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, CheckCircle, XCircle } from 'lucide-react';

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function DocumentPreviewDialog({ isOpen, onClose, imageUrl, title }: DocumentPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between z-10 bg-zinc-950/80 backdrop-blur-sm absolute w-full top-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[60vh] sm:h-[80vh] flex items-center justify-center bg-black/50 p-4 pt-16">
          <div className="relative w-full h-full">
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-contain"
              sizes="(max-w-768px) 100vw, 800px"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
