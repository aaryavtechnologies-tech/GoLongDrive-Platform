'use client';

import { useSystemStatus } from '@/hooks/useSystemStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthIndicator } from './HealthIndicator';
import { Server, Database, Cloud, Activity, Cpu, HardDrive, MemoryStick } from 'lucide-react';

export function SystemStatusCards() {
  const { status, isLoading, isError } = useSystemStatus();

  if (isLoading) {
    return <div className="text-center p-8">Loading system status...</div>;
  }

  if (isError || !status) {
    return <div className="text-center p-8 text-destructive">Failed to load system status.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Services Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Activity className="h-4 w-4 mr-2" /> API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">REST API</div>
          <HealthIndicator status={status.APIStatus} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Database className="h-4 w-4 mr-2" /> Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">MongoDB</div>
          <HealthIndicator status={status.DatabaseStatus} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Cloud className="h-4 w-4 mr-2" /> Socket Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">WebSocket</div>
          <HealthIndicator status={status.SocketStatus} />
        </CardContent>
      </Card>

      {/* Infrastructure Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Cpu className="h-4 w-4 mr-2" /> CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.CPUUsage}</div>
          <p className="text-xs text-muted-foreground mt-1">Average load</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <MemoryStick className="h-4 w-4 mr-2" /> Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.MemoryUsage}</div>
          <p className="text-xs text-muted-foreground mt-1">Total system memory</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Server className="h-4 w-4 mr-2" /> Server Uptime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.ServerUptime}</div>
          <p className="text-xs text-muted-foreground mt-1">Environment: {status.Environment}</p>
        </CardContent>
      </Card>
    </div>
  );
}
