'use client';

import { DriverDocumentDetails } from '@/types/document';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Car, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function DriverSummaryCard({ document }: { document: DriverDocumentDetails }) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md h-full">
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-zinc-400" />
            Driver Details
          </div>
          <Link href={`/drivers/${document.driverId}`} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
            View Full Profile <ExternalLink className="h-3 w-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16 border-2 border-zinc-800">
            <AvatarImage src={document.driverAvatar} alt={document.driverName} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xl">{document.driverName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">{document.driverName}</h3>
            <p className="text-xs text-zinc-500 font-mono">{document.driverId}</p>
            <div className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300">
              {document.driverApprovalStatus}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 text-sm text-zinc-300 bg-zinc-900/50 p-4 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-zinc-500 shrink-0" /> 
              <span>{document.driverPhone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-zinc-500 shrink-0" /> 
              <span className="truncate">{document.driverEmail}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-zinc-500 shrink-0" /> 
              <span>{document.city}</span>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-zinc-500 shrink-0" /> 
              <span className="font-medium text-white">{document.vehicleNumber}</span>
              <span className="text-zinc-500 ml-auto">{document.vehicleType}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
