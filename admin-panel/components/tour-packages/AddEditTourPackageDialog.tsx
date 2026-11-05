'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Loader2, Image as ImageIcon, MapPin, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { tourPackageService, TourPackage } from '@/services/tour-package.service';

interface AddEditTourPackageDialogProps {
  packageToEdit?: TourPackage | null;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
}

export function AddEditTourPackageDialog({
  packageToEdit,
  isOpen,
  onClose,
  onSuccess,
}: AddEditTourPackageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (onClose && !val) onClose();
    setInternalOpen(val);
  };

  const isEditing = !!packageToEdit;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    numberOfPersons: 1,
    pricePerPerson: 0,
    days: 1,
    nights: 0,
    route: '',
    placesToExplore: '',
    includes: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (packageToEdit) {
      setFormData({
        title: packageToEdit.title || '',
        description: packageToEdit.description || '',
        price: packageToEdit.price || 0,
        numberOfPersons: packageToEdit.numberOfPersons || 1,
        pricePerPerson: packageToEdit.pricePerPerson || 0,
        days: packageToEdit.days || 1,
        nights: packageToEdit.nights || 0,
        route: packageToEdit.route || '',
        placesToExplore: packageToEdit.placesToExplore ? packageToEdit.placesToExplore.join(', ') : '',
        includes: packageToEdit.includes ? packageToEdit.includes.join(', ') : '',
      });
      setPreviewUrl(packageToEdit.imageUrl || '');
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        numberOfPersons: 1,
        pricePerPerson: 0,
        days: 1,
        nights: 0,
        route: '',
        placesToExplore: '',
        includes: '',
      });
      setPreviewUrl('');
      setImageFile(null);
    }
  }, [packageToEdit, open]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
      };

      // Auto calculate per person price or nights
      if (name === 'price' || name === 'numberOfPersons') {
        const persons = name === 'numberOfPersons' ? Number(value) : prev.numberOfPersons;
        const total = name === 'price' ? Number(value) : prev.price;
        if (persons > 0 && total > 0) {
          next.pricePerPerson = Math.round(total / persons);
        }
      }
      if (name === 'days') {
        const d = Number(value);
        if (d > 1) {
          next.nights = d - 1;
        } else {
          next.nights = 0;
        }
      }

      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', String(formData.price));
      fd.append('numberOfPersons', String(formData.numberOfPersons));
      fd.append('pricePerPerson', String(formData.pricePerPerson));
      fd.append('days', String(formData.days));
      fd.append('nights', String(formData.nights));
      fd.append('route', formData.route);
      fd.append('placesToExplore', formData.placesToExplore);
      fd.append('includes', formData.includes);

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (previewUrl && !previewUrl.startsWith('blob:')) {
        fd.append('imageUrl', previewUrl);
      }

      if (isEditing && packageToEdit) {
        await tourPackageService.updatePackage(packageToEdit._id, fd);
        toast.success('Tour Package updated successfully');
      } else {
        await tourPackageService.createPackage(fd);
        toast.success('Tour Package created successfully');
      }

      setOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!packageToEdit && (
        <DialogTrigger asChild>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-[0_0_20px_rgba(250,204,21,0.2)]">
            <Plus className="w-4 h-4 mr-2" />
            Add Tour Package
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-yellow-400" />
            {isEditing ? 'Edit Tour Package' : 'Create New Tour Package'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Set up details, route, local image, pricing, and inclusions for customers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Package Title / Name *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleTextChange}
              placeholder="e.g. Golden Triangle Tour (Delhi - Agra - Jaipur)"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Description *</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleTextChange}
              placeholder="Describe the journey, highlights, accommodations and itinerary details..."
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 min-h-[90px]"
              required
            />
          </div>

          {/* Image Upload (Stored Locally on Backend) */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Package Image (Stored locally on server)</Label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-zinc-700 hover:border-yellow-400 rounded-lg p-4 flex flex-col items-center justify-center bg-zinc-900/50 transition-colors">
                <Upload className="w-6 h-6 text-yellow-400 mb-1" />
                <span className="text-sm text-zinc-300 font-medium">Click to upload image</span>
                <span className="text-xs text-zinc-500">JPG, PNG, WEBP (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-zinc-700 relative bg-zinc-900 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      previewUrl.startsWith('blob:') || previewUrl.startsWith('http')
                        ? previewUrl
                        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price & Person Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Total Price (₹) *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleTextChange}
                placeholder="15000"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">No. of Persons</Label>
              <Input
                type="number"
                name="numberOfPersons"
                value={formData.numberOfPersons || ''}
                onChange={handleTextChange}
                placeholder="4"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Per Person Price (₹)</Label>
              <Input
                type="number"
                name="pricePerPerson"
                value={formData.pricePerPerson || ''}
                onChange={handleTextChange}
                placeholder="3750"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Days & Nights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">No. of Days *</Label>
              <Input
                type="number"
                name="days"
                value={formData.days || ''}
                onChange={handleTextChange}
                placeholder="3"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">No. of Nights</Label>
              <Input
                type="number"
                name="nights"
                value={formData.nights}
                onChange={handleTextChange}
                placeholder="2"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Route & Places */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Route Summary</Label>
            <Input
              name="route"
              value={formData.route}
              onChange={handleTextChange}
              placeholder="e.g. Delhi → Agra → Jaipur → Delhi"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Places to Explore (comma-separated)</Label>
            <Input
              name="placesToExplore"
              value={formData.placesToExplore}
              onChange={handleTextChange}
              placeholder="e.g. Taj Mahal, Agra Fort, Fatehpur Sikri, Hawa Mahal, Amber Fort"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
            />
          </div>

          {/* Inclusions */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">What is Included (comma-separated)</Label>
            <Textarea
              name="includes"
              value={formData.includes}
              onChange={handleTextChange}
              placeholder="e.g. AC Sedan/SUV Cab, Experienced Driver, Fuel & Toll Charges, Parking, Sightseeing"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Package'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

