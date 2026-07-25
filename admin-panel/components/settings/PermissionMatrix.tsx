'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Permission } from '@/types/role';

interface PermissionMatrixProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

export function PermissionMatrix({ permissions, selectedPermissionIds, onChange, disabled }: PermissionMatrixProps) {
  // Group permissions by module
  const modules = Array.from(new Set(permissions.map(p => p.module)));
  
  const handleToggle = (permissionId: string) => {
    if (disabled) return;
    if (selectedPermissionIds.includes(permissionId)) {
      onChange(selectedPermissionIds.filter(id => id !== permissionId));
    } else {
      onChange([...selectedPermissionIds, permissionId]);
    }
  };

  const handleToggleModuleRow = (module: string, checked: boolean) => {
    if (disabled) return;
    const modulePermissions = permissions.filter(p => p.module === module).map(p => p._id);
    if (checked) {
      // Add all missing permissions for this module
      const newSelections = new Set([...selectedPermissionIds, ...modulePermissions]);
      onChange(Array.from(newSelections));
    } else {
      // Remove all permissions for this module
      onChange(selectedPermissionIds.filter(id => !modulePermissions.includes(id)));
    }
  };

  const actions = ['create', 'read', 'update', 'delete', 'manage'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions Matrix</CardTitle>
        <CardDescription>Configure granular access rights for each module.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Module</TableHead>
                <TableHead className="text-center">Select All</TableHead>
                {actions.map(action => (
                  <TableHead key={action} className="text-center capitalize">{action}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map(module => {
                const modulePerms = permissions.filter(p => p.module === module);
                const isAllSelected = modulePerms.every(p => selectedPermissionIds.includes(p._id));
                const isIndeterminate = !isAllSelected && modulePerms.some(p => selectedPermissionIds.includes(p._id));

                return (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{module}</TableCell>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                        onCheckedChange={(checked) => handleToggleModuleRow(module, checked as boolean)}
                        disabled={disabled}
                      />
                    </TableCell>
                    {actions.map(action => {
                      const perm = modulePerms.find(p => p.action === action);
                      return (
                        <TableCell key={action} className="text-center">
                          {perm ? (
                            <Checkbox 
                              checked={selectedPermissionIds.includes(perm._id)}
                              onCheckedChange={() => handleToggle(perm._id)}
                              disabled={disabled}
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
