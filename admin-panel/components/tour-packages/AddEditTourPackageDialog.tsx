'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Loader2,
  Image as ImageIcon,
  MapPin,
  CheckCircle,
  Users,
  Link as LinkIcon,
  X,
  Sparkles,
} from 'lucide-react';
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
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    numberOfPersons: 2,
    pricePerPerson: 0,
    days: 3,
    nights: 2,
    route: '',
    placesToExplore: '',
    includes: '',
    excludes: '',
    imageUrl: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (packageToEdit) {
      setFormData({
        title: packageToEdit.title || '',
        description: packageToEdit.description || '',
        price: packageToEdit.price || 0,
        numberOfPersons: packageToEdit.numberOfPersons || 2,
        pricePerPerson: packageToEdit.pricePerPerson || 0,
        days: packageToEdit.days || 1,
        nights: packageToEdit.nights || 0,
        route: packageToEdit.route || '',
        placesToExplore: packageToEdit.placesToExplore ? packageToEdit.placesToExplore.join(', ') : '',
        includes: packageToEdit.includes ? packageToEdit.includes.join(', ') : '',
        excludes: packageToEdit.excludes ? packageToEdit.excludes.join(', ') : '',
        imageUrl: packageToEdit.imageUrl || '',
        isActive: packageToEdit.isActive !== false,
      });
      setPreviewUrl(packageToEdit.imageUrl || '');
      setImageFile(null);
      setImageMode(packageToEdit.imageUrl?.startsWith('http') ? 'url' : 'upload');
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        numberOfPersons: 2,
        pricePerPerson: 0,
        days: 3,
        nights: 2,
        route: '',
        placesToExplore: '',
        includes: '',
        excludes: '',
        imageUrl: '',
        isActive: true,
      });
      setPreviewUrl('');
      setImageFile(null);
      setImageMode('url');
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

      if (name === 'imageUrl') {
        setPreviewUrl(value);
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

  const handleClearImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Please enter a valid total price');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('price', String(formData.price));
      fd.append('numberOfPersons', String(formData.numberOfPersons));
      fd.append('pricePerPerson', String(formData.pricePerPerson));
      fd.append('days', String(formData.days));
      fd.append('nights', String(formData.nights));
      fd.append('route', formData.route.trim());
      fd.append('placesToExplore', formData.placesToExplore);
      fd.append('includes', formData.includes);
      fd.append('excludes', formData.excludes);
      fd.append('isActive', String(formData.isActive));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (formData.imageUrl.trim()) {
        fd.append('imageUrl', formData.imageUrl.trim());
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

  const getResolvedPreview = () => {
    if (!previewUrl) return '';
    if (previewUrl.startsWith('blob:') || previewUrl.startsWith('http://') || previewUrl.startsWith('https://')) {
      return previewUrl;
    }
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${base}${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`;
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
            {isEditing ? 'Edit Tour Package & Images' : 'Create New Tour Package'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Set up package details, real destination images, route itinerary, pricing, and inclusions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Package Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleTextChange}
              placeholder="e.g. Golden Triangle Tour: Delhi, Agra & Jaipur"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Package Description *</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleTextChange}
              placeholder="Highlight key experiences, heritage palaces, hotel/transfer perks..."
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 min-h-[90px]"
              required
            />
          </div>

          {/* Image Upload / URL Mode */}
          <div className="space-y-2 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-200 font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-yellow-400" />
                Package Cover Image
              </Label>
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    imageMode === 'url' ? 'bg-yellow-400 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3 h-3 inline mr-1" />
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    imageMode === 'upload' ? 'bg-yellow-400 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Upload File
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <div className="space-y-1.5">
                <Input
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleTextChange}
                  placeholder="Paste direct image link (e.g. Unsplash URL: https://images.unsplash.com/...)"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 text-xs"
                />
                <p className="text-[11px] text-zinc-500">
                  Tip: Real high-resolution Unsplash photos work instantly in the user app and admin panel.
                </p>
              </div>
            ) : (
              <label className="border border-dashed border-zinc-700 hover:border-yellow-400 rounded-lg p-3 text-center cursor-pointer flex flex-col items-center justify-center transition-colors bg-zinc-900/40">
                <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                <span className="text-xs text-zinc-300 font-medium">Click to select photo from device</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Preview Box */}
            {previewUrl && (
              <div className="mt-2 relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 h-32 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getResolvedPreview()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow-md transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
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
                placeholder="15999"
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
                placeholder="2"
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
                placeholder="7999"
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
                placeholder="4"
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
                placeholder="3"
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
              placeholder="e.g. New Delhi → Agra → Jaipur → New Delhi"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-300">Places to Explore (comma-separated)</Label>
            <Input
              name="placesToExplore"
              value={formData.placesToExplore}
              onChange={handleTextChange}
              placeholder="e.g. Taj Mahal, Agra Fort, Amber Palace, Hawa Mahal"
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
              placeholder="e.g. Private AC Cab, Chauffeur Allowance, Interstate Tolls, Fuel, Airport Pickup & Drop"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 min-h-[60px]"
            />
          </div>

          {/* Exclusions */}
          <div className="space-y-1.5">
            <Label className="text-zinc-300">What is NOT Included (Excludes - comma-separated)</Label>
            <Textarea
              name="excludes"
              value={formData.excludes}
              onChange={handleTextChange}
              placeholder="e.g. Monument Entry Tickets, Hotel Bookings, Personal Meals & Drinks, Tips"
              className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-400 min-h-[60px]"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div>
              <Label className="text-sm font-semibold text-white cursor-pointer">
                Visible in User App
              </Label>
              <p className="text-xs text-zinc-400">
                When enabled, customers can view and book this package in the user application.
              </p>
            </div>
            <input
              type="checkbox"
              id="isActiveToggle"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-5 h-5 accent-yellow-400 cursor-pointer rounded"
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
