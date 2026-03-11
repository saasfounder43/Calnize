// ============================================
// Database Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  timezone: string;
  stripe_customer_id: string | null;
  plan: 'free' | 'pro';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingType {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  currency: string;
  buffer_minutes: number;
  minimum_notice_minutes: number;
  max_bookings_per_day: number | null;
  participation_mode: 'virtual' | 'in_person';
  meeting_link: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityRule {
  id: string;
  user_id: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

export interface Booking {
  id: string;
  booking_type_id: string;
  host_user_id: string;
  guest_name: string;
  guest_email: string;
  guest_notes: string | null;
  start_time: string; // ISO UTC
  end_time: string; // ISO UTC
  payment_status: 'free' | 'pending' | 'paid';
  stripe_payment_intent_id: string | null;
  calendar_event_id: string | null;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface OAuthToken {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

// ============================================
// API / Form Types
// ============================================

export interface BookingTypeFormData {
  title: string;
  description: string;
  duration_minutes: number;
  price: number | null;
  currency: string;
  buffer_minutes: number;
  minimum_notice_minutes: number;
  max_bookings_per_day: number | null;
  is_active: boolean;
}

export interface AvailabilityFormData {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface BookingFormData {
  guest_name: string;
  guest_email: string;
  guest_notes: string;
  start_time: string;
  end_time: string;
}

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
  available: boolean;
}

// ============================================
// Component Props Types
// ============================================

export interface DashboardStats {
  totalBookingTypes: number;
  activeBookingTypes: number;
  upcomingBookings: number;
  totalBookings: number;
}
