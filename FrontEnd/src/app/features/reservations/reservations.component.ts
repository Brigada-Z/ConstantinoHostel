import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsService } from '../../core/services/pms.service';
import {
  Reservation,
  ReservationStatus,
  Room,
  Bed,
  Guest
} from '../../core/models/pms.models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reservations-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Reservas</h1>
          <p class="page-subtitle">Control anti-overbooking, check-in, check-out y trazabilidad</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Nueva Reserva</span>
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filter-card">
        <div class="search-input-group">
          <span class="search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="Buscar por código, nombre de huésped o documento..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>

        <div class="status-tabs">
          @for (st of statusFilters; track st.value) {
            <button
              class="status-tab-btn"
              [class.active]="selectedStatus === st.value"
              (click)="filterByStatus(st.value)"
            >
              {{ st.label }}
            </button>
          }
        </div>
      </div>

      <!-- Tabla de Reservas -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando reservas...</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Huésped</th>
                <th>Documento</th>
                <th>Unidad / Plazas</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Estado</th>
                <th>Total / Seña</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (res of reservations(); track res.id) {
                <tr>
                  <td>
                    <strong class="res-code">{{ res.code }}</strong>
                  </td>
                  <td>
                    <div class="guest-info">
                      <strong>{{ res.guest.full_name }}</strong>
                      <small>{{ res.guest.phone }}</small>
                    </div>
                  </td>
                  <td>
                    {{ res.guest.document_number }}
                  </td>
                  <td>
                    @if (res.room_number) {
                      <span class="room-pill">Hab {{ res.room_number }}</span>
                    }
                    <div class="beds-list">
                      @for (b of res.beds_detail; track b.id) {
                        <span class="bed-pill">{{ b.number }}</span>
                      }
                    </div>
                  </td>
                  <td>{{ res.check_in_date }}</td>
                  <td>{{ res.check_out_date }}</td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(res.status)">
                      {{ res.status_display }}
                    </span>
                  </td>
                  <td>
                    <div class="amount-info">
                      <strong>\${{ res.total_amount | number:'1.0-0' }}</strong>
                      <small class="deposit-text">Seña: \${{ res.deposit_paid | number:'1.0-0' }}</small>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div class="action-buttons">
                      @if (res.status === 'CONFIRMADA' || res.status === 'PENDIENTE_SENA') {
                        <button
                          class="btn btn-sm btn-success"
                          (click)="changeStatus(res.id, 'CHECK_IN')"
                          title="Realizar Check-in"
                        >
                          Check-in
                        </button>
                      }

                      @if (res.status === 'CHECK_IN') {
                        <button
                          class="btn btn-sm btn-warning"
                          (click)="changeStatus(res.id, 'CHECK_OUT')"
                          title="Realizar Check-out (Habitación pasa a Sucia)"
                        >
                          Check-out
                        </button>
                      }

                      @if (res.status !== 'CANCELADA' && res.status !== 'CHECK_OUT') {
                        <button
                          class="btn btn-sm btn-danger-outline"
                          (click)="cancelReservation(res.id)"
                          title="Cancelar con motivo"
                        >
                          Cancelar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="text-center empty-cell">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal de Creación de Reserva -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-content modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Nueva Reserva (Validación Anti-Overbooking)</h2>
              <button class="btn-close" (click)="closeCreateModal()">✕</button>
            </div>

            <form (ngSubmit)="submitReservation()" class="modal-body">
              @if (createError()) {
                <div class="alert-error">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <strong>Conflicto detectado:</strong>
                    <p>{{ createError() }}</p>
                  </div>
                </div>
              }

              <!-- 1. Huésped -->
              <div class="form-section">
                <h3 class="section-title">1. Datos del Huésped</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group">
                    <label class="form-label">Nombre *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newGuest.first_name"
                      name="first_name"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Apellido *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newGuest.last_name"
                      name="last_name"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">DNI / Pasaporte *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newGuest.document_number"
                      name="document_number"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Teléfono de Contacto *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newGuest.phone"
                      name="phone"
                      required
                    />
                  </div>
                  <div class="form-group" style="grid-column: span 2;">
                    <label class="form-label">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      [(ngModel)]="newGuest.email"
                      name="email"
                    />
                  </div>
                </div>
              </div>

              <!-- 2. Fechas -->
              <div class="form-section">
                <h3 class="section-title">2. Fechas de Estadía</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group">
                    <label class="form-label">Fecha de Check-in *</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="checkInDate"
                      name="checkInDate"
                      required
                      (change)="calculateTotals()"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Fecha de Check-out *</label>
                    <input
                      type="date"
                      class="form-control"
                      [(ngModel)]="checkOutDate"
                      name="checkOutDate"
                      required
                      (change)="calculateTotals()"
                    />
                  </div>
                </div>
              </div>

              <!-- 3. Selección de Habitación y Camas -->
              <div class="form-section">
                <h3 class="section-title">3. Selección de Habitación o Plazas Individuales</h3>
                <div class="form-group">
                  <label class="form-label">Habitación</label>
                  <select
                    class="form-control"
                    [(ngModel)]="selectedRoomId"
                    name="selectedRoomId"
                    (change)="onRoomChange()"
                  >
                    <option [ngValue]="null">Selecciona una habitación...</option>
                    @for (r of rooms(); track r.id) {
                      <option [ngValue]="r.id">
                        Hab {{ r.number }} - {{ r.name }} ({{ r.room_type_display }})
                      </option>
                    }
                  </select>
                </div>

                @if (selectedRoom()?.room_type === 'SHARED_DORM') {
                  <div class="form-group">
                    <label class="form-label">Seleccionar Cama(s) en Habitación Compartida (Cada cama es reservable):</label>
                    <div class="beds-checkbox-grid">
                      @for (bed of selectedRoom()?.beds; track bed.id) {
                        <label class="bed-check-label">
                          <input
                            type="checkbox"
                            [checked]="isBedSelected(bed.id)"
                            (change)="toggleBed(bed.id)"
                          />
                          <span>{{ bed.number }} - {{ bed.bed_type_display }} (\${{ bed.price_per_night || 18000 }}/noche)</span>
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- 4. Importes y Seña -->
              <div class="form-section">
                <h3 class="section-title">4. Importes Financieros</h3>
                <div class="grid grid-cols-3 gap-3">
                  <div class="form-group">
                    <label class="form-label">Monto Total ($)</label>
                    <input
                      type="number"
                      class="form-control"
                      [(ngModel)]="totalAmount"
                      name="totalAmount"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Seña Cobrada ($)</label>
                    <input
                      type="number"
                      class="form-control"
                      [(ngModel)]="depositPaid"
                      name="depositPaid"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Estado Inicial</label>
                    <select
                      class="form-control"
                      [(ngModel)]="initialStatus"
                      name="initialStatus"
                    >
                      <option value="CONFIRMADA">Confirmada (Seña Recibida)</option>
                      <option value="PENDIENTE_SENA">Pendiente de Seña</option>
                      <option value="CHECK_IN">Check-in Inmediato</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeCreateModal()">Cancelar</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="submitting()"
                >
                  @if (submitting()) {
                    <span>Validando disponibilidad...</span>
                  } @else {
                    <span>Confirmar y Guardar Reserva</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .reservations-page {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .page-subtitle {
      color: #64748B;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .filter-card {
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 0.75rem;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-input-group {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94A3B8;
    }

    .search-input-group input {
      padding-left: 2.25rem;
    }

    .status-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .status-tab-btn {
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      border: 1px solid #E2E8F0;
      background: #F8FAFC;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .status-tab-btn:hover {
      background: #EFF6FF;
      border-color: #BFDBFE;
    }

    .status-tab-btn.active {
      background: #1E3A8A;
      color: white;
      border-color: #1E3A8A;
    }

    .res-code {
      font-family: monospace;
      color: #1E3A8A;
      font-size: 0.875rem;
    }

    .guest-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .guest-info small {
      color: #64748B;
      font-size: 0.75rem;
    }

    .room-pill {
      display: inline-block;
      background: #EFF6FF;
      color: #1D4ED8;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 0.25rem;
    }

    .beds-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .bed-pill {
      background: #F1F5F9;
      color: #475569;
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
    }

    .amount-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .deposit-text {
      color: #059669;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 0.375rem;
      justify-content: flex-end;
    }

    .empty-cell {
      padding: 3rem !important;
      color: #94A3B8;
    }

    /* Modal */
    .modal-lg {
      max-width: 700px;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748B;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-section {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 0.75rem;
      padding: 1rem;
    }

    .section-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #1E3A8A;
      margin-top: 0;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .alert-error {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #B91C1C;
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .alert-error strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .beds-checkbox-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      background: white;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid #E2E8F0;
    }

    .bed-check-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      cursor: pointer;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: #64748B;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #E2E8F0;
      border-top-color: #1E3A8A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ReservationsComponent implements OnInit {
  private pmsService = inject(PmsService);

  reservations = signal<Reservation[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(true);
  submitting = signal(false);

  searchQuery = '';
  selectedStatus = 'TODAS';

  statusFilters = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Confirmadas', value: 'CONFIRMADA' },
    { label: 'Seña Pendiente', value: 'PENDIENTE_SENA' },
    { label: 'Check-in Realizado', value: 'CHECK_IN' },
    { label: 'Check-out Realizado', value: 'CHECK_OUT' },
    { label: 'Canceladas', value: 'CANCELADA' }
  ];

  // Modal nueva reserva
  showCreateModal = signal(false);
  createError = signal<string | null>(null);

  newGuest = {
    first_name: '',
    last_name: '',
    document_number: '',
    email: '',
    phone: '',
    nationality: 'Argentina'
  };

  checkInDate = new Date().toISOString().substring(0, 10);
  checkOutDate = new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10);
  selectedRoomId: number | null = null;
  selectedRoom = signal<Room | null>(null);
  selectedBedIds: number[] = [];
  totalAmount = 0;
  depositPaid = 0;
  initialStatus: ReservationStatus = 'CONFIRMADA';

  ngOnInit(): void {
    this.loadReservations();
    this.loadRooms();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.pmsService.getReservations(this.selectedStatus, this.searchQuery).subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadRooms(): void {
    this.pmsService.getRooms().subscribe({
      next: (data) => this.rooms.set(data)
    });
  }

  onSearch(): void {
    this.loadReservations();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.loadReservations();
  }

  openCreateModal(): void {
    this.createError.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createError.set(null);
  }

  onRoomChange(): void {
    if (!this.selectedRoomId) {
      this.selectedRoom.set(null);
      this.selectedBedIds = [];
      return;
    }
    const r = this.rooms().find(x => x.id === this.selectedRoomId) || null;
    this.selectedRoom.set(r);
    this.selectedBedIds = [];
    this.calculateTotals();
  }

  isBedSelected(bedId: number): boolean {
    return this.selectedBedIds.includes(bedId);
  }

  toggleBed(bedId: number): void {
    if (this.isBedSelected(bedId)) {
      this.selectedBedIds = this.selectedBedIds.filter(id => id !== bedId);
    } else {
      this.selectedBedIds.push(bedId);
    }
    this.calculateTotals();
  }

  calculateTotals(): void {
    const r = this.selectedRoom();
    if (!r) return;

    const start = new Date(this.checkInDate);
    const end = new Date(this.checkOutDate);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    if (r.room_type === 'SHARED_DORM') {
      const bedPrice = 18000;
      this.totalAmount = this.selectedBedIds.length * bedPrice * nights;
    } else {
      const roomBase = Number(r.base_price_per_night) || 45000;
      this.totalAmount = roomBase * nights;
    }
    this.depositPaid = Math.round(this.totalAmount * 0.5); // 50% de seña por defecto
  }

  submitReservation(): void {
    if (!this.selectedRoomId) {
      this.createError.set('Debes seleccionar una habitación.');
      return;
    }

    if (this.selectedRoom()?.room_type === 'SHARED_DORM' && this.selectedBedIds.length === 0) {
      this.createError.set('En habitación compartida, debes seleccionar al menos una cama.');
      return;
    }

    this.submitting.set(true);
    this.createError.set(null);

    const payload = {
      guest_data: this.newGuest,
      room: this.selectedRoomId,
      bed_ids: this.selectedBedIds,
      check_in_date: this.checkInDate,
      check_out_date: this.checkOutDate,
      status: this.initialStatus,
      total_amount: this.totalAmount,
      deposit_paid: this.depositPaid
    };

    this.pmsService.createReservation(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCreateModal();
        this.loadReservations();
        alert('¡Reserva creada exitosamente! Se validó disponibilidad anti-overbooking.');
      },
      error: (err) => {
        this.submitting.set(false);
        const errDetail = err.error?.non_field_errors?.[0] || err.error?.error || JSON.stringify(err.error);
        this.createError.set(errDetail);
      }
    });
  }

  changeStatus(id: number, status: ReservationStatus): void {
    this.pmsService.changeReservationStatus(id, status).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (err) => alert('Error: ' + JSON.stringify(err.error))
    });
  }

  cancelReservation(id: number): void {
    const reason = prompt('Ingrese el motivo de cancelación obligatorio:');
    if (!reason || !reason.trim()) {
      alert('Se requiere un motivo para cancelar y auditar.');
      return;
    }
    this.pmsService.cancelReservation(id, reason.trim()).subscribe({
      next: () => this.loadReservations(),
      error: (err) => alert('Error: ' + JSON.stringify(err.error))
    });
  }

  getBadgeClass(status: string): string {
    if (status === 'CONFIRMADA') return 'badge-confirmada';
    if (status === 'PENDIENTE_SENA') return 'badge-sena';
    if (status === 'CHECK_IN') return 'badge-ocupada';
    if (status === 'CANCELADA') return 'badge-cancelada';
    return 'badge-disponible';
  }
}
