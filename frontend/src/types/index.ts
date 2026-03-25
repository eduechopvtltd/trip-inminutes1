// src/types/index.ts

// ─── Auth ────────────────────────────────────────────────
export type Role = 'USER' | 'ADMIN' | 'AGENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  firstName: string; lastName: string;
  email: string; phone?: string; password: string;
}
export interface AuthResponse { user: User; accessToken: string; }

// ─── Packages ────────────────────────────────────────────
export type PackageType =
  | 'INTERNATIONAL' | 'DOMESTIC' | 'HONEYMOON'
  | 'ADVENTURE' | 'CORPORATE' | 'PILGRIMAGE' | 'CRUISE' | 'WILDLIFE';

export interface Destination {
  id: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  coverImage: string;
  images: string[];
  isPopular: boolean;
  isDomestic: boolean;
  slug: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  highlights: string[];
  type: PackageType;
  destinationId: string;
  destination: Pick<Destination, 'id' | 'name' | 'country' | 'continent'>;
  duration: number;
  minGroupSize: number;
  maxGroupSize: number;
  basePrice: number;
  discountedPrice?: number;
  currency: string;
  coverImage: string;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  isFeatured: boolean;
  isActive: boolean;
  totalBookings: number;
  averageRating: number;
  reviewCount: number;
  badge?: string;
  createdAt: string;
}

export interface PackageFilters {
  page?: number;
  limit?: number;
  type?: PackageType;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  destinationId?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'bookings' | 'newest';
  featured?: boolean;
}

// ─── Bookings ────────────────────────────────────────────
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface Traveler {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  packageId?: string;
  package?: Pick<Package, 'title' | 'coverImage' | 'duration'>;
  bookingType: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  travelers: Traveler[];
  travelDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  specialRequests?: string;
  createdAt: string;
}

export interface CreateBookingPayload {
  packageId?: string;
  bookingType: string;
  travelDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  travelers: Traveler[];
  specialRequests?: string;
}

// ─── Reviews ─────────────────────────────────────────────
export interface Review {
  id: string;
  packageId: string;
  userId: string;
  user: { firstName: string; lastName: string; avatar?: string };
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ─── Deals ───────────────────────────────────────────────
export interface Deal {
  id: string;
  title: string;
  description: string;
  code?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  validTo: string;
}

// ─── Notifications ───────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── API Response ────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

// ─── Search ──────────────────────────────────────────────
export interface FlightSearch {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
  tripType: 'one-way' | 'round-trip';
}

export interface HotelSearch {
  city: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
}
