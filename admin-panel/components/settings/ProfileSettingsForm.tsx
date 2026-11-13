'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getAdminProfile, updateAdminProfile } from '@/services/settings.service';
import { User, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function ProfileSettingsForm() {
  const [profile, setProfile] = React.useState<{
    id?: string;
    name: string;
    email: string;
    role: string;
    roleName?: string;
  }>({
    name: '',
    email: '',
    role: 'admin',
    roleName: 'Administrator',
  });

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAdminProfile();
        if (mounted && res) {
          setProfile({
            id: res.id,
            name: res.name || '',
            email: res.email || '',
            role: res.role || 'admin',
            roleName: res.roleName || 'Administrator',
          });
        }
      } catch (err: any) {
        console.warn('Could not load current admin profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (!currentPassword) {
        toast.error('Please enter your current password to set a new password');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await updateAdminProfile({
        name: profile.name,
        email: profile.email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      toast.success('Admin profile saved successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (res) {
        setProfile(prev => ({
          ...prev,
          name: res.name || prev.name,
          email: res.email || prev.email,
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  if (isLoading) {
    return <div className="text-zinc-400 p-8 text-center text-sm">Loading admin profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5 text-yellow-400" />
            Admin Profile
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Manage your personal login credentials, identity, and authentication password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center space-x-6 pb-2">
              <Avatar className="h-20 w-20 border border-white/10">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Admin')}&background=eab308&color=000`} alt={profile.name} />
                <AvatarFallback className="bg-yellow-500 text-black font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">{profile.name || 'Administrator'}</h4>
                <p className="text-xs text-yellow-400 font-medium capitalize">{profile.roleName || profile.role}</p>
                <p className="text-xs text-zinc-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white text-sm"
                  placeholder="Super Admin"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Admin Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  required
                  className="bg-zinc-900 border-zinc-800 text-white text-sm"
                  placeholder="admin@golongdrive.com"
                />
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-zinc-400" />
                <h4 className="text-xs font-semibold text-zinc-300">Change Password (Leave blank to keep existing)</h4>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Current Password</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-900 border-zinc-800 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="bg-zinc-900 border-zinc-800 text-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="bg-zinc-900 border-zinc-800 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs h-9"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
