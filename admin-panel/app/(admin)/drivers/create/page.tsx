'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { driverService } from '@/services/driver.service';
import { toast } from 'sonner';
import { ChevronLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function CreateDriverPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await driverService.createDriver(formData);
      toast.success("Driver created successfully!", {
        description: `${formData.fullName} has been added to the system.`
      });
      router.push('/drivers');
    } catch (error: any) {
      toast.error("Failed to create driver", {
        description: error.response?.data?.message || "An unexpected error occurred."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/drivers">
          <Button variant="outline" size="icon" className="border-white/10 bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full h-10 w-10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Add New Driver</h1>
          <p className="text-sm text-zinc-400 mt-1">Create a new driver account with an initial password.</p>
        </div>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar" 
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com" 
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-400/50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-zinc-300">Phone Number (10 digits)</Label>
              <Input 
                id="phoneNumber" 
                name="phoneNumber"
                required
                pattern="[6-9][0-9]{9}"
                title="Please enter a valid 10-digit Indian mobile number starting with 6-9"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210" 
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Initial Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-yellow-400/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Driver
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
