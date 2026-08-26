'use client';

import React, { useState } from 'react';
import { Plus, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AddVehicleDialogProps {
  onSuccess: () => void;
}

export function AddVehicleDialog({ onSuccess }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    baseFare: 2000,
    pricePerKm: 12,
    advanceAmount: 500,
    seatingCapacity: 4,
    luggageCapacity: 2,
    iconUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return '';
    const formData = new FormData();
    formData.append('vehicleImage', imageFile);

    const response = await fetch('http://localhost:5000/api/v1/admin/vehicles/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalIconUrl = formData.iconUrl;

      if (imageMode === 'upload' && imageFile) {
        finalIconUrl = await uploadImage();
      }

      const payload = {
        ...formData,
        iconUrl: finalIconUrl
      };

      const response = await fetch('http://localhost:5000/api/v1/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create vehicle');
      }

      toast.success('Vehicle created successfully');
      setOpen(false);
      onSuccess();
      
      // Reset form
      setFormData({
        name: '', category: '', baseFare: 2000, pricePerKm: 12, advanceAmount: 500, seatingCapacity: 4, luggageCapacity: 2, iconUrl: ''
      });
      setImageFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold gap-2" />}>
        <Plus className="w-4 h-4" /> Add Vehicle
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add New Vehicle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Vehicle Name</Label>
              <Input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sedan Premium" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Category</Label>
              <Input required name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Sedan, SUV" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Base Fare (₹)</Label>
              <Input required type="number" min="2000" name="baseFare" value={formData.baseFare} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Price Per KM (₹)</Label>
              <Input required type="number" min="0" name="pricePerKm" value={formData.pricePerKm} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Advance Amount (₹)</Label>
              <Input required type="number" min="500" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-zinc-300">Seats</Label>
                <Input required type="number" min="1" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Luggage</Label>
                <Input required type="number" min="0" name="luggageCapacity" value={formData.luggageCapacity} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <Label className="text-zinc-300 block">Vehicle Image</Label>
            
            <div className="flex gap-2 mb-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setImageMode('url')}
                className={cn("gap-2 flex-1 border-zinc-700", imageMode === 'url' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/50' : 'bg-zinc-800 text-zinc-400')}
              >
                <LinkIcon className="w-4 h-4" /> Image URL
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setImageMode('upload')}
                className={cn("gap-2 flex-1 border-zinc-700", imageMode === 'upload' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/50' : 'bg-zinc-800 text-zinc-400')}
              >
                <Upload className="w-4 h-4" /> Upload File
              </Button>
            </div>

            {imageMode === 'url' ? (
              <Input 
                key="url-input"
                name="iconUrl" 
                value={formData.iconUrl} 
                onChange={handleChange} 
                placeholder="https://example.com/image.png" 
                className="bg-zinc-800 border-zinc-700 text-white" 
              />
            ) : (
              <Input 
                key="file-input"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="bg-zinc-800 border-zinc-700 text-white cursor-pointer file:text-yellow-400 file:bg-zinc-700 file:border-0 file:mr-4 file:px-4 file:py-1 file:rounded-full file:text-sm hover:file:bg-zinc-600" 
              />
            )}
          </div>

          <DialogFooter className="mt-6 border-t border-zinc-800 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
