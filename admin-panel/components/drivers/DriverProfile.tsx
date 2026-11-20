'use client';

import { Driver } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DriverStatusBadge } from './DriverStatusBadge';
import { AvailabilityBadge } from './AvailabilityBadge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  UserCircle2, 
  Briefcase, 
  PhoneCall, 
  ShieldCheck, 
  Copy, 
  Check 
} from 'lucide-react';
import { safeFormatDate, getMediaUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DriverProfile({ driver }: { driver: Driver }) {
  const [copiedId, setCopiedId] = useState(false);

  const copyDriverId = () => {
    if (driver?.id) {
      navigator.clipboard.writeText(driver.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const avatarUrl = getMediaUrl(driver.avatar);

  return (
    <Card className="bg-zinc-950/80 border border-white/5 backdrop-blur-md text-white shadow-xl rounded-2xl overflow-hidden hover:border-yellow-500/20 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-yellow-400" />
          Driver Profile
        </CardTitle>
        <button 
          onClick={copyDriverId}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900/80 px-2.5 py-1 rounded-md border border-white/5 transition-colors"
          title="Copy Driver ID"
        >
          {copiedId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copiedId ? 'Copied' : 'ID'}</span>
        </button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
          <div className="relative mb-3">
            <Avatar className="h-28 w-28 border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(255,201,40,0.15)] ring-4 ring-zinc-900">
              <AvatarImage src={avatarUrl} alt={driver.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-zinc-900 text-yellow-400 text-3xl font-bold">
                {driver.name ? driver.name.substring(0, 2).toUpperCase() : 'DR'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <AvailabilityBadge availability={driver.availability} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-white tracking-tight">{driver.name}</h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">{driver.id}</p>
          
          <div className="mt-3 flex items-center gap-2">
            <DriverStatusBadge status={driver.status} />
          </div>
        </div>
        
        {/* Contact Quick Actions */}
        <div className="grid grid-cols-2 gap-2 my-5">
          {driver.phone && (
            <a 
              href={`tel:${driver.phone}`} 
              className="flex items-center justify-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Call</span>
            </a>
          )}
          {driver.email && (
            <a 
              href={`mailto:${driver.email}`} 
              className="flex items-center justify-center gap-2 text-xs font-medium py-2 px-3 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors truncate"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Email</span>
            </a>
          )}
        </div>

        {/* Detailed Fields */}
        <div className="space-y-4 text-sm">
          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Phone className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">Phone</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs select-all">{driver.phone || 'N/A'}</span>
          </div>

          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Mail className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">Email</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs truncate max-w-[170px] select-all">{driver.email || 'N/A'}</span>
          </div>

          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">City / Area</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs">
              {[driver.city, driver.state, driver.pincode].filter(Boolean).join(', ') || driver.address || 'N/A'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Briefcase className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">Experience</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs">{driver.experience || 'Not specified'}</span>
          </div>

          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">Date of Birth</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs">{safeFormatDate(driver.dateOfBirth, 'MMMM dd, yyyy')}</span>
          </div>

          <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">Joined Platform</span>
            </div>
            <span className="font-medium text-zinc-200 text-right text-xs">{safeFormatDate(driver.joinedDate, 'MMMM dd, yyyy')}</span>
          </div>

          {driver.emergencyContact && (
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 shrink-0">
                <PhoneCall className="h-4 w-4" />
                <span className="text-xs">Emergency</span>
              </div>
              <span className="font-medium text-amber-300 text-right text-xs select-all">{driver.emergencyContact}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
