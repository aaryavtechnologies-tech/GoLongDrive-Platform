'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Download, FileText } from 'lucide-react';
import Image from 'next/image';

interface ImageViewerProps {
  url: string;
  fileType: string;
  documentName: string;
}

export function ImageViewer({ url, fileType, documentName }: ImageViewerProps) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isPdf = fileType === 'application/pdf' || url.endsWith('.pdf');

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col bg-zinc-950 border border-white/5 rounded-lg overflow-hidden ${isFullscreen ? 'h-screen w-screen z-50' : 'h-[600px] w-full'}`}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
        <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={isPdf} className="h-8 w-8 text-zinc-300 hover:text-white rounded-full">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="text-xs font-medium text-white w-10 text-center select-none">
          {Math.round(zoom * 100)}%
        </div>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={isPdf} className="h-8 w-8 text-zinc-300 hover:text-white rounded-full">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <Button variant="ghost" size="icon" onClick={handleRotate} disabled={isPdf} className="h-8 w-8 text-zinc-300 hover:text-white rounded-full">
          <RotateCw className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 text-zinc-300 hover:text-white rounded-full">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <a href={url} download={documentName} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white rounded-full">
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Viewer Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-black/50 flex items-center justify-center checkered-bg">
        {isPdf ? (
          <iframe 
            src={`${url}#toolbar=0`} 
            className="w-full h-full border-0 bg-white"
            title={documentName}
          />
        ) : (
          <div 
            className="transition-transform duration-200 ease-out origin-center"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              cursor: zoom > 1 ? 'grab' : 'default'
            }}
          >
            {/* We use standard img here instead of next/image for reliable CSS transforms without layout thrashing */}
            <img 
              src={url} 
              alt={documentName} 
              className="max-w-full max-h-[800px] object-contain select-none shadow-2xl"
              draggable="false"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .checkered-bg {
          background-image: 
            linear-gradient(45deg, #18181b 25%, transparent 25%), 
            linear-gradient(-45deg, #18181b 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #18181b 75%), 
            linear-gradient(-45deg, transparent 75%, #18181b 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
}
