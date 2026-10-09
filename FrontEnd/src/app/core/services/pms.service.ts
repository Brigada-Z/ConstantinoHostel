import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RackResponse,
  Reservation,
  ReservationCreatePayload,
  ReservationStatus,
  Guest,
  Room,
  Bed,
  HousekeepingRoom,
  HousekeepingUpdatePayload,
  AuditLog,
  DashboardStats
} from '../models/pms.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PmsService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // --- RACK DE OCUPACIÓN ---
  getRack(startDate?: string, days: number = 14): Observable<RackResponse> {
    let params = new HttpParams().set('days', days.toString());
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    return this.http.get<RackResponse>(`${this.API_URL}/rack/`, { params });
  }

  // --- RESERVAS ---
  getReservations(status?: string, q?: string): Observable<Reservation[]> {
    let params = new HttpParams();
    if (status && status !== 'TODAS') {
      params = params.set('status', status);
    }
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<Reservation[]>(`${this.API_URL}/reservations/`, { params });
  }

  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.API_URL}/reservations/${id}/`);
  }

  createReservation(payload: ReservationCreatePayload): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.API_URL}/reservations/`, payload);
  }

  updateReservation(id: number, payload: Partial<ReservationCreatePayload>): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.API_URL}/reservations/${id}/`, payload);
  }

  cancelReservation(id: number, reason: string): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.API_URL}/reservations/${id}/cancel/`, { reason });
  }

  changeReservationStatus(id: number, newStatus: ReservationStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.API_URL}/reservations/${id}/change_status/`, { status: newStatus });
  }

  checkAvailability(params: {
    check_in_date: string;
    check_out_date: string;
    room_id?: number;
    bed_ids?: number[];
  }): Observable<{ available: boolean; conflicts: any[] }> {
    return this.http.post<{ available: boolean; conflicts: any[] }>(
      `${this.API_URL}/reservations/check_availability/`,
      params
    );
  }

  // --- HUÉSPEDES ---
  getGuests(q?: string): Observable<Guest[]> {
    if (q) {
      return this.http.get<Guest[]>(`${this.API_URL}/guests/search/`, {
        params: new HttpParams().set('q', q)
      });
    }
    return this.http.get<Guest[]>(`${this.API_URL}/guests/`);
  }

  createGuest(guest: Partial<Guest>): Observable<Guest> {
    return this.http.post<Guest>(`${this.API_URL}/guests/`, guest);
  }

  updateGuest(id: number, guest: Partial<Guest>): Observable<Guest> {
    return this.http.patch<Guest>(`${this.API_URL}/guests/${id}/`, guest);
  }

  // --- HABITACIONES Y PLAZAS ---
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/rooms/`);
  }

  getBeds(): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.API_URL}/beds/`);
  }

  updateRoomStatus(roomId: number, status: string, notes: string = '', syncBeds: boolean = true): Observable<Room> {
    return this.http.patch<Room>(`${this.API_URL}/rooms/${roomId}/status/`, {
      physical_status: status,
      notes,
      sync_beds: syncBeds
    });
  }

  updateBedStatus(bedId: number, status: string, notes: string = ''): Observable<Bed> {
    return this.http.patch<Bed>(`${this.API_URL}/beds/${bedId}/status/`, {
      physical_status: status,
      notes
    });
  }

  // --- OPERATIVIDAD MÓVIL DE LIMPIEZA ---
  getHousekeepingRooms(): Observable<HousekeepingRoom[]> {
    return this.http.get<HousekeepingRoom[]>(`${this.API_URL}/housekeeping/`);
  }

  updateHousekeepingStatus(payload: HousekeepingUpdatePayload): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/housekeeping/`, payload);
  }

  // --- MANTENIMIENTO ---
  getMaintenanceBlocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/maintenance/`);
  }

  createMaintenanceBlock(payload: {
    room?: number;
    bed?: number;
    start_date: string;
    end_date: string;
    reason: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/maintenance/`, payload);
  }

  deleteMaintenanceBlock(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/maintenance/${id}/`);
  }

  // --- AUDITORÍA (SOLO ADMIN) ---
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.API_URL}/audit-logs/`);
  }

  // --- DASHBOARD STATS ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats/`);
  }
}
