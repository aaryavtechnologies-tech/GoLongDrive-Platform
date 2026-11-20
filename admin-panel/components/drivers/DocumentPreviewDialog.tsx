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
import { ZoomIn, ZoomOut, RotateCw, ExternalLink, Download } from 'lucide-react';

interface DocumentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function DocumentPreviewDialog({ isOpen, onClose, imageUrl, title }: DocumentPreviewDialogProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-4xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-white/10 flex flex-row items-center justify-between z-20 bg-zinc-950/90 backdrop-blur-md">
          <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
            {title}
          </DialogTitle>
          <div className="flex items-center gap-1.5 mr-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={handleRotate}
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => window.open(imageUrl, '_blank')}
              title="Open full size"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="relative w-full h-[65vh] sm:h-[80vh] flex items-center justify-center bg-black/80 p-6 overflow-hidden">
          <div 
            className="relative w-full h-full transition-transform duration-200 flex items-center justify-center"
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          >
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              unoptimized
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
