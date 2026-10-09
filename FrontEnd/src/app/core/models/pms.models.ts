export type UserRole = 'ADMIN' | 'RECEPCION' | 'LIMPIEZA';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_superuser?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type PhysicalStatus = 'CLEAN' | 'DIRTY' | 'CLEANING' | 'MAINTENANCE';

export type RoomType = 'DOUBLE_PRIVATE' | 'TRIPLE_PRIVATE' | 'SHARED_DORM';

export type BedType = 'INDIVIDUAL' | 'MATRIMONIAL' | 'BUNK_TOP' | 'BUNK_BOTTOM';

export interface Bed {
  id: number;
  room: number;
  number: string;
  bed_type: BedType;
  bed_type_display: string;
  physical_status: PhysicalStatus;
  physical_status_display: string;
  is_active: boolean;
  price_per_night?: string | number;
  effective_price?: string | number;
  notes?: string;
  last_status_change?: string;
}

export interface Room {
  id: number;
  number: string;
  name: string;
  room_type: RoomType;
  room_type_display: string;
  capacity: number;
  floor: number;
  base_price_per_night: string | number;
  physical_status: PhysicalStatus;
  physical_status_display: string;
  notes?: string;
  last_status_change?: string;
  beds: Bed[];
}

export type DocumentType = 'DNI' | 'PASSPORT' | 'OTHER';

export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  document_type: DocumentType;
  document_type_display?: string;
  document_number: string;
  email: string;
  phone: string;
  nationality: string;
  notes?: string;
  created_at?: string;
}

export type ReservationStatus = 'PENDIENTE_SENA' | 'CONFIRMADA' | 'CHECK_IN' | 'CHECK_OUT' | 'CANCELADA';

export interface Reservation {
  id: number;
  code: string;
  guest: Guest;
  room?: number;
  room_number?: string;
  beds_detail: Array<{ id: number; number: string; room_number: string }>;
  check_in_date: string;
  check_out_date: string;
  status: ReservationStatus;
  status_display: string;
  total_amount: string | number;
  deposit_paid: string | number;
  notes?: string;
  created_at: string;
}

export interface ReservationCreatePayload {
  guest_id?: number;
  guest_data?: Partial<Guest>;
  room?: number;
  bed_ids: number[];
  check_in_date: string;
  check_out_date: string;
  status: ReservationStatus;
  total_amount: number;
  deposit_paid: number;
  notes?: string;
}

export interface DayInfo {
  date: string;
  day_name: string;
  day_short: string;
  day_number: number;
  month_name: string;
  is_today: boolean;
  is_weekend: boolean;
}

export interface RackCell {
  date: string;
  status: 'AVAILABLE' | 'PENDIENTE_SENA' | 'CONFIRMADA' | 'CHECK_IN' | 'MAINTENANCE' | 'DIRTY' | 'CLEANING';
  color: string;
  label: string;
  reservation?: {
    id: number;
    code: string;
    guest_name: string;
    guest_phone: string;
    status: ReservationStatus;
    status_display: string;
    check_in: string;
    check_out: string;
    is_check_in_day: boolean;
    is_check_out_day: boolean;
  } | null;
  maintenance?: {
    id: number;
    reason: string;
  } | null;
}

export interface RackBed {
  id: number;
  number: string;
  bed_type: BedType;
  bed_type_display: string;
  physical_status: PhysicalStatus;
  price: string;
  cells: RackCell[];
}

export interface RackRoom {
  id: number;
  number: string;
  name: string;
  room_type: RoomType;
  room_type_display: string;
  capacity: number;
  floor: number;
  physical_status: PhysicalStatus;
  base_price: string;
  beds: RackBed[];
}

export interface ColorLegend {
  status: string;
  label: string;
  color: string;
}

export interface RackResponse {
  start_date: string;
  end_date: string;
  days_count: number;
  dates: DayInfo[];
  rooms: RackRoom[];
  color_legend: ColorLegend[];
}

export interface HousekeepingRoom {
  id: number;
  number: string;
  name: string;
  floor: number;
  room_type: RoomType;
  room_type_display: string;
  physical_status: PhysicalStatus;
  physical_status_display: string;
  notes?: string;
  last_status_change?: string;
  beds: Array<{
    id: number;
    number: string;
    bed_type: BedType;
    physical_status: PhysicalStatus;
    physical_status_display: string;
    notes?: string;
  }>;
}

export interface HousekeepingUpdatePayload {
  target_type: 'room' | 'bed';
  target_id: number;
  status: PhysicalStatus;
  notes?: string;
}

export interface AuditLog {
  id: number;
  user?: number;
  user_name: string;
  action: string;
  action_display: string;
  entity_type: string;
  entity_id: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface DashboardStats {
  total_rooms: number;
  total_beds: number;
  occupied_beds_today: number;
  available_beds_today: number;
  occupancy_rate: number;
  check_ins_today: number;
  check_outs_today: number;
  dirty_units_count: number;
  pending_deposits_count: number;
}
