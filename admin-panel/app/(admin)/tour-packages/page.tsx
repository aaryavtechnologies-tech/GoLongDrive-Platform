'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  MapPin,
  Phone,
  Eye,
  CheckCircle2,
  Car,
  Clock,
  Search,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  tourPackageService,
  TourPackage,
  TourBooking,
} from '@/services/tour-package.service';
import { AddEditTourPackageDialog } from '@/components/tour-packages/AddEditTourPackageDialog';
import { AssignTourDriverDialog } from '@/components/tour-packages/AssignTourDriverDialog';
import { TourBookingDetailsDialog } from '@/components/tour-packages/TourBookingDetailsDialog';
import { TourPackageDetailsDialog } from '@/components/tour-packages/TourPackageDetailsDialog';

export default function TourPackagesPage() {
  const [activeTab, setActiveTab] = useState<'packages' | 'bookings'>('packages');

  // Packages State
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageSearch, setPackageSearch] = useState('');
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<TourPackage | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Driver Assign State
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null);
  const [assignBookingNumber, setAssignBookingNumber] = useState<string>('');
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchBookings();
  }, []);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const data = await tourPackageService.getPackages();
      setPackages(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load tour packages');
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await tourPackageService.getTourBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load tour bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleDeletePackage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete tour package "${title}"?`)) return;
    try {
      await tourPackageService.deletePackage(id);
      toast.success('Tour package deleted successfully');
      setPackages((prev) => prev.filter((p) => p._id !== id));
      if (viewingPackage?._id === id) {
        setIsViewOpen(false);
        setViewingPackage(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete');
    }
  };

  const handleSeedPackages = async () => {
    if (!confirm('Populate database with curated tour packages with real Unsplash images? Existing packages will be refreshed.')) return;
    setSeeding(true);
    try {
      const res = await tourPackageService.seedPackages(true);
      toast.success(res.message || 'Seeded 8 tour packages successfully');
      fetchPackages();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to seed packages');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenAssign = (bookingId: string, bookingNumber: string) => {
    setAssignBookingId(bookingId);
    setAssignBookingNumber(bookingNumber);
    setIsAssignOpen(true);
  };

  const handleQuickConfirm = async (bookingId: string) => {
    try {
      await tourPackageService.confirmBooking(bookingId, 'Admin confirmed booking via phone');
      toast.success('Booking confirmed! Ready for driver assignment.');
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  };

  const filteredPackages = packages.filter((p) => {
    const q = packageSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.route && p.route.toLowerCase().includes(q)) ||
      (p.placesToExplore && p.placesToExplore.some((pl) => pl.toLowerCase().includes(q)))
    );
  });

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const id = (b.bookingId || '').toLowerCase();
    const customer = (b.customer?.fullName || '').toLowerCase();
    const phone = (b.customer?.phoneNumber || '').toLowerCase();
    const pkg = (b.tourPackage?.title || '').toLowerCase();
    return id.includes(q) || customer.includes(q) || phone.includes(q) || pkg.includes(q);
  });

  const pendingBookingsCount = bookings.filter((b) => b.rideStatus === 'Pending').length;

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-yellow-400" />
            Tour Packages & Bookings
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage curated multi-day tour packages and customer booking requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={seeding}
            onClick={handleSeedPackages}
            className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 text-xs font-semibold"
            title="Populate curated tour packages with real Unsplash images"
          >
            <Compass className={`w-4 h-4 mr-1.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding...' : 'Seed Curated Tours'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchPackages();
              fetchBookings();
            }}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>

          <AddEditTourPackageDialog onSuccess={fetchPackages} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'packages'
              ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          Tour Packages ({packages.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'bookings'
              ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Booking Requests ({bookings.length})
          {pendingBookingsCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-black">
              {pendingBookingsCount} New
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TOUR PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search packages by title, route, or places..."
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-yellow-400"
              />
            </div>
            <span className="text-xs text-zinc-500">
              Showing {filteredPackages.length} packages
            </span>
          </div>

          {loadingPackages ? (
            <div className="text-center py-16 text-zinc-500">Loading tour packages...</div>
          ) : filteredPackages.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 text-center py-16">
              <CardContent className="space-y-3">
                <Compass className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No Tour Packages Found</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  Click the &quot;Add Tour Package&quot; button above to create your first package with
                  local images, route, pricing, and inclusions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <Card
                  key={pkg._id}
                  className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-all duration-300"
                >
                  {/* Package Image */}
                  <div
                    onClick={() => {
                      setViewingPackage(pkg);
                      setIsViewOpen(true);
                    }}
                    className="h-44 w-full relative bg-zinc-950 overflow-hidden cursor-pointer"
                  >
                    {pkg.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getImageUrl(pkg.imageUrl)}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                        <ImageIcon className="w-10 h-10 mb-1" />
                        <span className="text-xs">No image uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          pkg.isActive
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {pkg.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-yellow-400 border border-yellow-400/20">
                      {pkg.days} Days / {pkg.nights || 0} Nights
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle
                      onClick={() => {
                        setViewingPackage(pkg);
                        setIsViewOpen(true);
                      }}
                      className="text-lg text-white font-bold line-clamp-1 hover:text-yellow-400 cursor-pointer transition-colors"
                    >
                      {pkg.title}
                    </CardTitle>
                    {pkg.route && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{pkg.route}</span>
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-zinc-400 line-clamp-2">{pkg.description}</p>

                    {/* Places to explore */}
                    {pkg.placesToExplore && pkg.placesToExplore.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.placesToExplore.slice(0, 3).map((place, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md"
                          >
                            {place}
                          </span>
                        ))}
                        {pkg.placesToExplore.length > 3 && (
                          <span className="text-[10px] text-zinc-500 px-1 py-0.5">
                            +{pkg.placesToExplore.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pricing Row */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Total Fare
                        </span>
                        <span className="text-xl font-bold text-white">
                          ₹{pkg.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          For {pkg.numberOfPersons} Persons
                        </span>
                        <span className="text-xs text-yellow-400 font-semibold">
                          ₹{pkg.pricePerPerson.toLocaleString()} / person
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingPackage(pkg);
                          setIsViewOpen(true);
                        }}
                        className="border-zinc-800 text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                        title="View Full Package Details"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPackage(pkg);
                          setIsEditOpen(true);
                        }}
                        className="flex-1 border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePackage(pkg._id, pkg.title)}
                        className="border-zinc-800 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        title="Delete Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKING REQUESTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search bookings by customer name, phone, or ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-yellow-400"
              />
            </div>
            <span className="text-xs text-zinc-500">
              Showing {filteredBookings.length} bookings
            </span>
          </div>

          {loadingBookings ? (
            <div className="text-center py-16 text-zinc-500">Loading booking requests...</div>
          ) : filteredBookings.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 text-center py-16">
              <CardContent className="space-y-3">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No Tour Bookings Found</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  When customers book tour packages in the user app, requests will appear here for
                  phone confirmation and driver assignment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-xs uppercase bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Booking ID</th>
                        <th className="px-6 py-4 font-semibold">Customer & Contact</th>
                        <th className="px-6 py-4 font-semibold">Package & Route</th>
                        <th className="px-6 py-4 font-semibold">Travel Date</th>
                        <th className="px-6 py-4 font-semibold">Persons & Fare</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredBookings.map((b) => {
                        const customerName = b.customer?.fullName || 'Customer';
                        const customerPhone = b.customer?.phoneNumber || 'N/A';
                        const isPending = b.rideStatus === 'Pending';
                        const isConfirmed = b.rideStatus === 'Confirmed';

                        return (
                          <tr key={b._id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                              #{b.bookingId}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-white">{customerName}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <a
                                  href={`tel:${customerPhone}`}
                                  className="text-xs font-bold text-yellow-400 hover:underline flex items-center gap-1"
                                  title="Click to call customer"
                                >
                                  <Phone className="w-3 h-3" />
                                  {customerPhone}
                                </a>
                              </div>
                            </td>

                            <td className="px-6 py-4 max-w-xs">
                              <div className="font-medium text-white truncate">
                                {b.tourPackage?.title || 'Tour Package'}
                              </div>
                              {b.tourPackage?.route && (
                                <div className="text-xs text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                                  {b.tourPackage.route}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-white font-medium">
                                {new Date(b.pickupDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-zinc-400">{b.pickupTime}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-white">
                                ₹{(b.finalFare || b.estimatedFare || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-zinc-400">
                                {b.numberOfPassengers} Persons ({b.paymentMethod})
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={`text-xs capitalize font-semibold ${
                                  b.rideStatus === 'Confirmed'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : b.rideStatus === 'Driver Assigned' ||
                                      b.rideStatus === 'Driver Accepted'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : b.rideStatus === 'Pending'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {b.rideStatus}
                              </Badge>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                              {isPending && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickConfirm(b._id)}
                                  className="h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                                  title="Confirm booking after calling customer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Confirm
                                </Button>
                              )}

                              {(isConfirmed || isPending) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenAssign(b._id, b.bookingId)}
                                  className="h-8 px-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs"
                                  title="Assign an approved driver"
                                >
                                  <Car className="w-3.5 h-3.5 mr-1" />
                                  {b.driver ? 'Reassign' : 'Assign'}
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setIsDetailsOpen(true);
                                }}
                                className="h-8 px-2 border-zinc-800 text-zinc-300 hover:text-white"
                                title="View booking details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Package Details Dialog */}
      {isViewOpen && (
        <TourPackageDetailsDialog
          pkg={viewingPackage}
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewingPackage(null);
          }}
          onEdit={(pkg) => {
            setEditingPackage(pkg);
            setIsEditOpen(true);
          }}
          onDelete={handleDeletePackage}
        />
      )}

      {/* Edit Package Dialog */}
      {isEditOpen && (
        <AddEditTourPackageDialog
          packageToEdit={editingPackage}
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingPackage(null);
          }}
          onSuccess={() => {
            fetchPackages();
            setIsEditOpen(false);
            setEditingPackage(null);
          }}
        />
      )}

      {/* Booking Details Dialog */}
      {isDetailsOpen && (
        <TourBookingDetailsDialog
          booking={selectedBooking}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedBooking(null);
          }}
          onAssignDriver={(id, num) => {
            setIsDetailsOpen(false);
            handleOpenAssign(id, num);
          }}
          onRefresh={fetchBookings}
        />
      )}

      {/* Assign Driver Dialog */}
      {isAssignOpen && (
        <AssignTourDriverDialog
          bookingId={assignBookingId}
          bookingNumber={assignBookingNumber}
          isOpen={isAssignOpen}
          onClose={() => {
            setIsAssignOpen(false);
            setAssignBookingId(null);
          }}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
}

