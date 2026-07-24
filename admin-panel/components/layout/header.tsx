'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MobileDrawer } from './mobile-drawer';
import { format } from 'date-fns';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Header() {
  const pathname = usePathname();
  
  const title = pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard';
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
  // Optional date-fns dependency: actually date-fns is not installed, so I'll just use native Intl
  // Let me just format date natively instead of date-fns to avoid missing deps if not requested.
  const today = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' 
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-zinc-950/80 px-4 backdrop-blur sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
      <MobileDrawer />
      
      <div className="hidden sm:flex sm:flex-col sm:flex-1 gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-600" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-yellow-400">{capitalizedTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-end gap-3 mt-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">{capitalizedTitle}</h1>
          <p className="text-sm text-zinc-400 mb-1">{today}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 sm:flex-initial">
        <form className="hidden lg:flex lg:max-w-xs relative items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full bg-zinc-900 border-zinc-800 pl-9 pr-4 text-sm text-white placeholder:text-zinc-400 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 transition-all"
          />
        </form>
        <button className="relative rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-700">
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400" />
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
