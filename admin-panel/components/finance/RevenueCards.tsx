'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueStats } from '@/types/payment';
import { IndianRupee, CreditCard, Activity, ArrowUpRight, ArrowDownRight, RefreshCcw, HandCoins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueCardsProps {
  stats?: RevenueStats;
  isLoading: boolean;
}

export function RevenueCards({ stats, isLoading }: RevenueCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue,
      icon: <IndianRupee className="h-4 w-4 text-zinc-400" />,
      trend: '+12.5%',
      isPositive: true,
      color: 'text-white'
    },
    {
      title: "Today's Revenue",
      value: stats?.todayRevenue,
      icon: <Activity className="h-4 w-4 text-zinc-400" />,
      trend: '+4.2%',
      isPositive: true,
      color: 'text-yellow-400'
    },
    {
      title: 'Platform Earnings',
      value: stats?.platformEarnings,
      icon: <HandCoins className="h-4 w-4 text-zinc-400" />,
      trend: '+15.3%',
      isPositive: true,
      color: 'text-green-400'
    },
    {
      title: 'Refunds Processed',
      value: stats?.refundAmount,
      icon: <RefreshCcw className="h-4 w-4 text-zinc-400" />,
      trend: '-2.1%',
      isPositive: false,
      color: 'text-zinc-300'
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950 border-white/10 shadow-sm animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24 bg-zinc-900" />
              <Skeleton className="h-4 w-4 rounded-full bg-zinc-900" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 bg-zinc-800 mb-2" />
              <Skeleton className="h-3 w-20 bg-zinc-900" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <Card key={i} className="bg-zinc-950 border-white/5 shadow-md overflow-hidden relative group transition-all hover:border-white/10 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="z-10 relative">
            <div className={`text-3xl font-bold tracking-tight ${card.color}`}>
              {card.value !== undefined ? formatCurrency(card.value) : '₹0'}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {card.isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {card.trend}
              </span>
              <span className="text-xs text-zinc-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
