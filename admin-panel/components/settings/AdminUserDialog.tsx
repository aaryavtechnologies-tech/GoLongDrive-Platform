'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminUser, CreateAdminUserDTO, UpdateAdminUserDTO } from '@/types/admin-user';
import { useRoles } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().optional(),
  role: z.string().min(1, 'Role type is required'),
  roleId: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function AdminUserDialog({ open, onOpenChange, user, onSave, isLoading }: AdminUserDialogProps) {
  const { roles } = useRoles();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      roleId: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        roleId: user.roleId?._id || undefined,
        isActive: user.isActive,
        password: '', // do not populate password
      });
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        roleId: undefined,
        isActive: true,
      });
    }
  }, [user, form, open]);

  const onSubmit = async (data: FormValues) => {
    if (!data.password && !user) {
      form.setError('password', { type: 'manual', message: 'Password is required for new users' });
      return;
    }
    const submitData = { ...data };
    if (!submitData.password) delete submitData.password;
    if (!submitData.roleId) delete submitData.roleId;

    await onSave(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit Admin User' : 'Create Admin User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update admin user details and permissions.' : 'Add a new administrator to the system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register('email')} type="email" />
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password {user && <span className="text-muted-foreground font-normal">(Leave empty to keep current)</span>}</label>
            <Input {...form.register('password')} type="password" />
            {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role Type</label>
            <Select 
              value={form.watch('role')} 
              onValueChange={(val) => form.setValue('role', val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a generic role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Role (Optional)</label>
            <Select 
              value={form.watch('roleId')} 
              onValueChange={(val) => form.setValue('roleId', val === 'none' ? undefined : (val as any))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select custom role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {roles.map(r => (
                  <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isActive" 
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked as boolean)}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Account is Active</label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
