'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Car,
  Edit,
  Trash2,
  Clock,
  IndianRupee,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { TourPackage } from '@/services/tour-package.service';

interface TourPackageDetailsDialogProps {
  pkg: TourPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pkg: TourPackage) => void;
  onDelete: (id: string, title: string) => void;
}

export function TourPackageDetailsDialog({
  pkg,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TourPackageDetailsDialogProps) {
  if (!pkg) return null;

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const imageUrl = getImageUrl(pkg.imageUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Hero Image Header */}
        <div className="relative w-full h-56 sm:h-72 bg-zinc-900 overflow-hidden">
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageUrl}
              alt={pkg.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span className="text-sm">No cover image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30" />

          {/* Badges on Hero */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge
              className={
                pkg.isActive
                  ? 'bg-emerald-500/90 text-white font-semibold'
                  : 'bg-zinc-700 text-zinc-300 font-semibold'
              }
            >
              {pkg.isActive ? 'Active on App' : 'Hidden / Inactive'}
            </Badge>
          </div>

          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-yellow-400 border border-yellow-400/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {pkg.days} Days / {pkg.nights || 0} Nights
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {pkg.title}
            </h2>
            {pkg.route && (
              <p className="text-xs sm:text-sm text-yellow-300 font-medium flex items-center gap-1.5 mt-1.5 drop-shadow">
                <MapPin className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                <span>{pkg.route}</span>
              </p>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Pricing Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block">
                Total Price
              </span>
              <p className="text-xl font-bold text-white mt-0.5">
                ₹{pkg.price.toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block">
                Per Person Rate
              </span>
              <p className="text-xl font-bold text-yellow-400 mt-0.5">
                ₹{pkg.pricePerPerson.toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block">
                Persons Included
              </span>
              <p className="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-400" />
                {pkg.numberOfPersons}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block">
                Duration
              </span>
              <p className="text-base font-bold text-white mt-0.5">
                {pkg.days}D / {pkg.nights || 0}N
              </p>
            </div>
          </div>

          {/* Vehicle Pricing Tiers (if configured) */}
          {pkg.pricing && pkg.pricing.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-yellow-400" />
                Vehicle Options & Fares
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pkg.pricing.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{tier.vehicleType}</p>
                      <span className="text-[10px] text-zinc-400">All-Inclusive</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-400">
                      ₹{tier.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tour Overview & Description
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
              {pkg.description}
            </p>
          </div>

          {/* Places To Explore */}
          {pkg.placesToExplore && pkg.placesToExplore.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-yellow-400" />
                Key Attractions & Sightseeing Stops
              </h4>
              <div className="flex flex-wrap gap-2">
                {pkg.placesToExplore.map((place, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-zinc-900 text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {place}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions and Exclusions Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is Included */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                What is Included
              </h4>
              {pkg.includes && pkg.includes.length > 0 ? (
                <ul className="space-y-2 text-xs text-zinc-300">
                  {pkg.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500 italic">No inclusions listed</p>
              )}
            </div>

            {/* What is Excluded */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                What is Excluded
              </h4>
              {pkg.excludes && pkg.excludes.length > 0 ? (
                <ul className="space-y-2 text-xs text-zinc-300">
                  {pkg.excludes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500 italic">No exclusions listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(pkg._id, pkg.title);
            }}
            className="border-red-900/60 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Package
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(pkg);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit Package & Images
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
