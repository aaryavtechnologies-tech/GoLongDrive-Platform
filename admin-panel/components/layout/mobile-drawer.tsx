'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Users, UserCircle, Car, 
  FileText, CreditCard, Settings, LogOut, Menu, Receipt, Landmark, Ticket
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Drivers', href: '/drivers', icon: UserCircle },
  { name: 'Rides', href: '/rides', icon: Car },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Earnings', href: '/earnings', icon: Landmark },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="sm:hidden text-zinc-400 hover:text-white transition-colors">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[340px] bg-black border-white/5 p-0 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/30 to-transparent pointer-events-none" />
        <SheetHeader className="p-6 border-b border-white/5 text-left z-10 relative">
          <SheetTitle className="flex items-center gap-3 font-bold text-lg text-white group">
            <div className="relative h-8 w-8 overflow-hidden rounded bg-white p-0.5 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
              <Image src="/logo.jpeg" alt="GoLongDrive Logo" fill className="object-cover rounded-sm" />
            </div>
            <span className="tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">GoLongDrive</span>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] py-4 z-10 relative">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-yellow-400/10 text-yellow-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-yellow-400' : 'text-zinc-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-4 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">Admin Profile</p>
            </div>
            <button className="text-zinc-400 hover:text-white transition-colors" onClick={() => setOpen(false)}>
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
