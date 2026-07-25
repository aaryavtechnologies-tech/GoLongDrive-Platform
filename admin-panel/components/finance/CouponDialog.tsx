'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Coupon, DiscountType } from '@/types/coupon';
import { useCreateCoupon } from '@/hooks/useFinanceActions';
import { Ticket } from 'lucide-react';

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: Coupon | null;
}

export function CouponDialog({ isOpen, onClose, couponToEdit }: CouponDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Coupon>>({
    code: '',
    title: '',
    description: '',
    discountType: 'Percentage',
    discountValue: 0,
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const createMutation = useCreateCoupon();

  React.useEffect(() => {
    if (couponToEdit) {
      setFormData({
        ...couponToEdit,
        startDate: couponToEdit.startDate.split('T')[0],
        expiryDate: couponToEdit.expiryDate.split('T')[0],
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        discountType: 'Percentage',
        discountValue: 0,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, [couponToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: e.target.type === 'number' ? (value ? Number(value) : undefined) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.discountValue) return;

    if (couponToEdit) {
      // In a real app, we'd have a useUpdateCoupon hook
      // updateMutation.mutate({ ... })
      onClose();
    } else {
      createMutation.mutate({
        ...(formData as Omit<Coupon, 'id' | 'usageCount'>),
        startDate: new Date(formData.startDate as string).toISOString(),
        expiryDate: new Date(formData.expiryDate as string).toISOString(),
      }, {
        onSuccess: onClose
      });
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            <Ticket className="h-5 w-5" />
            {couponToEdit ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            Fill in the details to configure the discount coupon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Coupon Code *</label>
              <Input
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER20"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400 uppercase font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Title *</label>
              <Input
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Summer Discount"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short description of the offer..."
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Discount Type</label>
              <Select 
                value={formData.discountType} 
                onValueChange={(v) => handleSelectChange('discountType', v as string)}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white focus:ring-yellow-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="Percentage">Percentage (%)</SelectItem>
                  <SelectItem value="Flat">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Discount Value *</label>
              <Input
                name="discountValue"
                type="number"
                required
                min="1"
                max={formData.discountType === 'Percentage' ? 100 : undefined}
                value={formData.discountValue || ''}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Max Discount (₹)</label>
              <Input
                name="maxDiscount"
                type="number"
                disabled={formData.discountType === 'Flat'}
                value={formData.maxDiscount || ''}
                onChange={handleChange}
                placeholder={formData.discountType === 'Flat' ? 'N/A' : 'e.g. 500'}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Min Booking Amount (₹)</label>
              <Input
                name="minBookingAmount"
                type="number"
                value={formData.minBookingAmount || ''}
                onChange={handleChange}
                placeholder="e.g. 2000"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Total Usage Limit</label>
              <Input
                name="usageLimit"
                type="number"
                value={formData.usageLimit || ''}
                onChange={handleChange}
                placeholder="Leave blank for unlimited"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Usage Per Customer</label>
              <Input
                name="usagePerCustomer"
                type="number"
                value={formData.usagePerCustomer || ''}
                onChange={handleChange}
                placeholder="e.g. 1"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Start Date</label>
              <Input
                name="startDate"
                type="date"
                required
                value={formData.startDate as string}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Expiry Date</label>
              <Input
                name="expiryDate"
                type="date"
                required
                value={formData.expiryDate as string}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" 
              disabled={isPending}
            >
              {isPending ? 'Saving...' : couponToEdit ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
