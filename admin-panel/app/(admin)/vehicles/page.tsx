'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddVehicleDialog } from '@/components/vehicles/AddVehicleDialog';
import { EditVehicleDialog } from '@/components/vehicles/EditVehicleDialog';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';

// Types
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
  isActive: boolean;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/admin/vehicles');
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle type?')) return;
    try {
      await apiClient.delete(`/admin/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v._id !== id));
      toast.success('Vehicle deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error);
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Vehicle Pricing</h1>
          <p className="text-zinc-400 mt-1">Manage car types, base fares, and price per km.</p>
        </div>
        <AddVehicleDialog onSuccess={fetchVehicles} />
      </div>

      <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-900/50 pb-4">
          <CardTitle className="text-lg text-white">Active Vehicle Categories</CardTitle>
          <CardDescription className="text-zinc-400">Configure the pricing rules used to calculate fares in the user app.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Base Fare (₹)</th>
                  <th className="px-6 py-4 font-semibold">Price/KM (₹)</th>
                  <th className="px-6 py-4 font-semibold">Adv. Amount (₹)</th>
                  <th className="px-6 py-4 font-semibold">Seats</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">Loading vehicles...</td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                      No vehicles found. Add one to start pricing rides.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-12 shrink-0 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
                            {vehicle.iconUrl ? (
                              <img src={vehicle.iconUrl} alt={vehicle.name} className="h-full w-full object-cover" />
                            ) : (
                              <Car className="h-5 w-5 text-zinc-500" />
                            )}
                          </div>
                          <span>{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{vehicle.category}</td>
                      <td className="px-6 py-4 font-mono">₹{vehicle.baseFare}</td>
                      <td className="px-6 py-4 font-mono text-yellow-400">₹{vehicle.pricePerKm}/km</td>
                      <td className="px-6 py-4 font-mono">₹{vehicle.advanceAmount}</td>
                      <td className="px-6 py-4">{vehicle.seatingCapacity}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <EditVehicleDialog vehicle={vehicle} onSuccess={fetchVehicles} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVehicle(vehicle._id)}
                            className="h-8 w-8 p-0 border-zinc-700 bg-zinc-800 hover:bg-red-500/20 hover:border-red-500/50 text-zinc-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
