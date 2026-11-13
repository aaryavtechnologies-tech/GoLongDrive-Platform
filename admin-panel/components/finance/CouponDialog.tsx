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
import { Coupon, DiscountType, CouponStatus } from '@/types/coupon';
import { useCreateCoupon, useUpdateCoupon } from '@/hooks/useFinanceActions';
import { Ticket, Percent, IndianRupee, Calendar, ShieldAlert } from 'lucide-react';

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit?: Coupon | null;
  onSuccess?: () => void;
}

export function CouponDialog({ isOpen, onClose, couponToEdit, onSuccess }: CouponDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Coupon>>(() => ({
    code: '',
    title: '',
    description: '',
    discountType: 'Percentage',
    discountValue: 10,
    maxDiscount: undefined,
    minBookingAmount: 0,
    usageLimit: undefined,
    usagePerCustomer: 1,
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const [validationError, setValidationError] = React.useState<string | null>(null);

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();

  React.useEffect(() => {
    setValidationError(null);
    if (couponToEdit) {
      setFormData({
        ...couponToEdit,
        startDate: couponToEdit.startDate ? couponToEdit.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: couponToEdit.expiryDate ? couponToEdit.expiryDate.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        discountType: 'Percentage',
        discountValue: 10,
        maxDiscount: undefined,
        minBookingAmount: 0,
        usageLimit: undefined,
        usagePerCustomer: 1,
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, [couponToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValidationError(null);
    setFormData(prev => ({ 
      ...prev, 
      [name]: e.target.type === 'number' 
        ? (value === '' ? undefined : Number(value)) 
        : (name === 'code' ? value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') : value) 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const code = (formData.code || '').trim().toUpperCase();
    if (!code) {
      setValidationError('Please enter a coupon code.');
      return;
    }
    if (!formData.title?.trim()) {
      setValidationError('Please enter a coupon title.');
      return;
    }
    if (formData.discountValue === undefined || formData.discountValue <= 0) {
      setValidationError('Discount value must be greater than 0.');
      return;
    }
    if (formData.discountType === 'Percentage' && formData.discountValue > 100) {
      setValidationError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (formData.startDate && formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.startDate)) {
      setValidationError('Expiry date cannot be earlier than start date.');
      return;
    }

    const payload = {
      ...formData,
      code,
      title: formData.title.trim(),
      description: formData.description || '',
      discountType: formData.discountType as DiscountType,
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.discountType === 'Flat' ? undefined : (formData.maxDiscount ? Number(formData.maxDiscount) : undefined),
      minBookingAmount: formData.minBookingAmount ? Number(formData.minBookingAmount) : 0,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      usagePerCustomer: formData.usagePerCustomer ? Number(formData.usagePerCustomer) : 1,
      status: formData.status as CouponStatus,
      startDate: new Date(formData.startDate as string).toISOString(),
      expiryDate: new Date(formData.expiryDate as string).toISOString(),
    };

    if (couponToEdit && couponToEdit.id) {
      updateMutation.mutate(
        { id: couponToEdit.id, data: payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
        }
      );
    } else {
      createMutation.mutate(payload as Omit<Coupon, 'id' | 'usageCount'>, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400 text-lg">
            <Ticket className="h-5 w-5" />
            {couponToEdit ? `Edit Coupon: ${couponToEdit.code}` : 'Create New Promo Coupon'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {couponToEdit
              ? 'Update the discount rate, eligibility criteria, and validity window.'
              : 'Configure a new promotional code for customers to redeem on rides and packages.'}
          </DialogDescription>
        </DialogHeader>

        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Code & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Coupon Code <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <Input
                  name="code"
                  required
                  value={formData.code || ''}
                  onChange={handleChange}
                  placeholder="e.g. FESTIVE50"
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 uppercase font-mono tracking-wider pl-3 text-sm font-bold"
                />
              </div>
              <p className="text-[10px] text-zinc-500">Only uppercase letters, digits, dashes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Offer Title <span className="text-yellow-400">*</span>
              </label>
              <Input
                name="title"
                required
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="e.g. Summer Vacation Special"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-sm"
              />
              <p className="text-[10px] text-zinc-500">Customer visible title.</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Description</label>
            <Textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="e.g. Get 20% off on your outstation trip up to ₹1,000."
              className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 min-h-[64px] text-xs resize-none"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-3 rounded-lg border border-white/5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Discount Type</label>
              <Select 
                value={formData.discountType || 'Percentage'} 
                onValueChange={(v) => v && handleSelectChange('discountType', v)}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white focus:ring-yellow-400 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="Percentage" className="flex items-center gap-2">
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value="Flat" className="flex items-center gap-2">
                    Flat Amount (₹)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Discount Value <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">
                  {formData.discountType === 'Flat' ? '₹' : '%'}
                </span>
                <Input
                  name="discountValue"
                  type="number"
                  required
                  min="1"
                  max={formData.discountType === 'Percentage' ? 100 : undefined}
                  value={formData.discountValue ?? ''}
                  onChange={handleChange}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 pl-7 text-sm"
                  placeholder={formData.discountType === 'Flat' ? '500' : '20'}
                />
              </div>
            </div>
          </div>

          {/* Max Discount & Min Booking Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Max Discount (₹)
              </label>
              <Input
                name="maxDiscount"
                type="number"
                min="0"
                disabled={formData.discountType === 'Flat'}
                value={formData.discountType === 'Flat' ? '' : (formData.maxDiscount ?? '')}
                onChange={handleChange}
                placeholder={formData.discountType === 'Flat' ? 'Not applicable for Flat' : 'e.g. 1000'}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 disabled:opacity-40 text-sm"
              />
              <p className="text-[10px] text-zinc-500">Cap on percentage discounts.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Min Booking Amount (₹)
              </label>
              <Input
                name="minBookingAmount"
                type="number"
                min="0"
                value={formData.minBookingAmount ?? ''}
                onChange={handleChange}
                placeholder="0"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-sm"
              />
              <p className="text-[10px] text-zinc-500">Minimum fare before applying.</p>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Total Usages Allowed
              </label>
              <Input
                name="usageLimit"
                type="number"
                min="1"
                value={formData.usageLimit ?? ''}
                onChange={handleChange}
                placeholder="Unlimited (leave empty)"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Usages Per Customer
              </label>
              <Input
                name="usagePerCustomer"
                type="number"
                min="1"
                value={formData.usagePerCustomer ?? 1}
                onChange={handleChange}
                placeholder="1"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-sm"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Valid From</label>
              <Input
                name="startDate"
                type="date"
                required
                value={formData.startDate as string}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Valid Until</label>
              <Input
                name="expiryDate"
                type="date"
                required
                value={formData.expiryDate as string}
                onChange={handleChange}
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Status</label>
              <Select
                value={formData.status || 'Active'}
                onValueChange={(v) => v && handleSelectChange('status', v)}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white focus:ring-yellow-400 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                  <SelectItem value="Active" className="text-green-400 font-medium">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-zinc-400">Inactive</SelectItem>
                  <SelectItem value="Expired" className="text-orange-400">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/5 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="border-white/10 bg-transparent text-white hover:bg-zinc-900"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md"
            >
              {isPending 
                ? (couponToEdit ? 'Updating...' : 'Creating...') 
                : (couponToEdit ? 'Save Changes' : 'Create Coupon')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
