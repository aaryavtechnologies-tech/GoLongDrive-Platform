'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Building2, 
  User, 
  ShieldCheck, 
  Mail, 
  Bell, 
  Users, 
  UserCog, 
  History, 
  Activity 
} from 'lucide-react';

const sidebarItems = [
  { name: 'General', href: '/settings/general', icon: Settings },
  { name: 'Company', href: '/settings/company', icon: Building2 },
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Security', href: '/settings/security', icon: ShieldCheck },
  { name: 'Email (SMTP)', href: '/settings/email', icon: Mail },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell },
  { name: 'Roles & Permissions', href: '/settings/roles', icon: Users },
  { name: 'Admin Users', href: '/settings/admin-users', icon: UserCog },
  { name: 'Audit Logs', href: '/settings/audit-logs', icon: History },
  { name: 'System Status', href: '/settings/system', icon: Activity },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              isActive
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
