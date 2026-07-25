'use client';

import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Role } from '@/types/role';

export function RolesTable() {
  const { roles, isLoadingRoles, deleteRole, isDeleting } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (isLoadingRoles) return <div>Loading roles...</div>;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      await deleteRole(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage roles and their permissions across the application.</CardDescription>
        </div>
        <Button onClick={() => setSelectedRole(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Permissions Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Badge variant={role.isSystem ? 'default' : 'secondary'}>
                    {role.isSystem ? 'System' : 'Custom'}
                  </Badge>
                </TableCell>
                <TableCell>{role.permissions?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedRole(role)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDelete(role._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
