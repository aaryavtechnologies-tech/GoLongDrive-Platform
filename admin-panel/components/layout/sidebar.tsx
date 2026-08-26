'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, UserCircle, Car, 
  CreditCard, Settings, LogOut, Ticket
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Drivers', href: '/drivers', icon: UserCircle },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Rides', href: '/rides', icon: Car },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r border-white/[0.08] bg-black/40 backdrop-blur-xl md:flex md:w-64 md:flex-col shadow-2xl z-20 relative transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 to-transparent pointer-events-none" />
      <div className="flex h-16 items-center border-b border-white/[0.08] px-6 z-10">
        <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg text-white group">
          <div className="relative h-8 w-8 overflow-hidden rounded bg-white p-0.5 shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-shadow duration-300">
            <Image src="/logo.jpeg" alt="GoLongDrive Logo" fill sizes="32px" className="object-cover rounded-sm" />
          </div>
          <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 group-hover:to-white transition-colors duration-300">GoLongDrive</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4 z-10">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 overflow-hidden',
                  isActive
                    ? 'bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.05)]'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-md bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                )}
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-yellow-400' : 'text-zinc-400 group-hover:text-white'
                  )}
                  aria-hidden="true"
                />
                <span className="relative z-10 tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t border-white/[0.08] p-4 z-10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
            <UserCircle className="h-5 w-5 text-zinc-300" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-white tracking-tight">Admin Profile</p>
            <p className="truncate text-xs text-zinc-500 font-medium">Super Admin</p>
          </div>
          <button 
            className="text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-zinc-800 rounded-md"
            onClick={() => {
              document.cookie = 'admin_token=; Max-Age=0; path=/';
              window.location.href = '/login';
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
