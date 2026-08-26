'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
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
import apiClient from '@/lib/axios';

interface VehicleType {
  _id: string;
  name: string;
  category: string;
  baseFare: number;
  pricePerKm: number;
  advanceAmount: number;
  seatingCapacity: number;
  luggageCapacity: number;
  iconUrl?: string;
  isActive?: boolean;
}

interface EditVehicleDialogProps {
  vehicle: VehicleType;
  onSuccess: () => void;
}

export function EditVehicleDialog({ vehicle, onSuccess }: EditVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  
  const [formData, setFormData] = useState({
    name: vehicle.name || '',
    category: vehicle.category || '',
    baseFare: vehicle.baseFare || 0,
    pricePerKm: vehicle.pricePerKm || 0,
    advanceAmount: vehicle.advanceAmount || 0,
    seatingCapacity: vehicle.seatingCapacity || 1,
    luggageCapacity: vehicle.luggageCapacity || 0,
    iconUrl: vehicle.iconUrl || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: vehicle.name || '',
        category: vehicle.category || '',
        baseFare: vehicle.baseFare || 0,
        pricePerKm: vehicle.pricePerKm || 0,
        advanceAmount: vehicle.advanceAmount || 0,
        seatingCapacity: vehicle.seatingCapacity || 1,
        luggageCapacity: vehicle.luggageCapacity || 0,
        iconUrl: vehicle.iconUrl || ''
      });
      setImageFile(null);
    }
  }, [open, vehicle]);

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
    const uploadData = new FormData();
    uploadData.append('vehicleImage', imageFile);

    const response = await apiClient.post('/admin/vehicles/upload-image', uploadData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
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

      const response = await apiClient.put(`/admin/vehicles/${vehicle._id}`, payload);

      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Failed to update vehicle');
      }

      toast.success('Vehicle updated successfully');
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 w-8 p-0 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white" />}>
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Edit Vehicle Details</DialogTitle>
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
              <Input required type="number" min="0" name="baseFare" value={formData.baseFare} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Price Per KM (₹)</Label>
              <Input required type="number" min="0" name="pricePerKm" value={formData.pricePerKm} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Advance Amount (₹)</Label>
              <Input required type="number" min="0" name="advanceAmount" value={formData.advanceAmount} onChange={handleChange} className="bg-zinc-800 border-zinc-700 text-white" />
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

            {(imageMode === 'url' && formData.iconUrl) || (imageMode === 'upload' && imageFile) ? (
              <div className="mt-4 p-2 rounded-lg border border-zinc-700 bg-zinc-900/50 inline-block">
                <p className="text-xs text-zinc-400 mb-2">Image Preview</p>
                <div className="h-24 w-32 rounded bg-black/50 overflow-hidden flex items-center justify-center">
                  <img 
                    src={imageMode === 'upload' && imageFile ? URL.createObjectURL(imageFile) : formData.iconUrl} 
                    alt="Preview" 
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-6 border-t border-zinc-800 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold min-w-[120px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Vehicle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
