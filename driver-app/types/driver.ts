export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profileImage?: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  totalRides: number;
  createdAt: string;
}
