'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function ProfileSettingsForm() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handle2FA = () => {
    toast.info('Two-Factor Authentication setup will be available soon.');
  };

  const handleLogoutAll = () => {
    toast.success('Logged out from all other active sessions.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>
            Manage your personal profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button type="button" variant="outline">Change Photo</Button>
                <p className="text-sm text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue="Super Admin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" defaultValue="admin@taxiapp.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input defaultValue="+91-1234567890" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Change Password</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" />
                </div>
              </div>
            </div>

            <Button type="submit">Save Profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Sessions</CardTitle>
          <CardDescription>
            Manage your account security and active sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <Button variant="outline" onClick={handle2FA}>Setup 2FA</Button>
          </div>
          
          <div className="flex items-center justify-between border-t pt-6">
            <div className="space-y-1">
              <p className="font-medium">Session Management</p>
              <p className="text-sm text-muted-foreground">Log out from all other devices and sessions.</p>
            </div>
            <Button variant="destructive" onClick={handleLogoutAll}>Log out all devices</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
