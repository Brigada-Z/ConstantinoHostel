import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PmsService } from '../../core/services/pms.service';
import { RackResponse, RackRoom, RackBed, RackCell, ReservationStatus } from '../../core/models/pms.models';

@Component({
  selector: 'app-rack',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="rack-container">
      <!-- Encabezado y Controles -->
      <div class="rack-header">
        <div class="header-titles">
          <h1 class="page-title">Rack de Ocupación Interactivo</h1>
          <p class="page-subtitle">Disponibilidad en tiempo real por habitaciones y camas individuales (38 plazas)</p>
        </div>

        <div class="rack-controls">
          <div class="nav-date-group">
            <button (click)="changeDaysOffset(-7)" class="btn btn-outline btn-sm" title="7 días atrás">◀</button>
            <button (click)="goToday()" class="btn btn-outline btn-sm">Hoy</button>
            <button (click)="changeDaysOffset(7)" class="btn btn-outline btn-sm" title="7 días adelante">▶</button>
            <input
              type="date"
              class="form-control date-picker"
              [(ngModel)]="selectedStartDate"
              (change)="loadRack()"
            />
          </div>

          <div class="days-selector">
            <span class="selector-label">Rango:</span>
            @for (d of [7, 14, 21, 30]; track d) {
              <button
                class="btn btn-sm"
                [class.btn-primary]="selectedDays === d"
                [class.btn-outline]="selectedDays !== d"
                (click)="setDays(d)"
              >
                {{ d }}d
              </button>
            }
          </div>

          <button (click)="loadRack()" class="btn btn-outline btn-sm" title="Recargar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Leyenda de Colores Normalizados -->
      <div class="legend-bar">
        <span class="legend-title">Estados:</span>
        <div class="legend-items">
          <span class="legend-item"><span class="color-dot" style="background: #10B981"></span> Disponible</span>
          <span class="legend-item"><span class="color-dot" style="background: #2563EB"></span> Confirmada</span>
          <span class="legend-item"><span class="color-dot" style="background: #F59E0B"></span> Seña Pendiente</span>
          <span class="legend-item"><span class="color-dot" style="background: #8B5CF6"></span> Ocupada (Check-in)</span>
          <span class="legend-item"><span class="color-dot" style="background: #64748B"></span> Mantenimiento</span>
          <span class="legend-item"><span class="color-dot" style="background: #EF4444"></span> Sucia</span>
          <span class="legend-item"><span class="color-dot" style="background: #F97316"></span> En Limpieza</span>
        </div>
      </div>

      <!-- Matriz del Rack -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Calculando matriz de ocupación reactiva...</p>
        </div>
      } @else if (rackData()) {
        <div class="matrix-card">
          <div class="matrix-scroll-wrapper">
            <table class="matrix-table">
              <thead>
                <tr class="header-days-row">
                  <th class="col-sticky-unit">Habitación / Cama</th>
                  <th class="col-sticky-price">Tarifa</th>
                  @for (day of rackData()?.dates; track day.date) {
                    <th
                      class="col-day"
                      [class.day-today]="day.is_today"
                      [class.day-weekend]="day.is_weekend"
                    >
                      <div class="day-head-content">
                        <span class="day-name">{{ day.day_short }}</span>
                        <span class="day-number">{{ day.day_number }}</span>
                        <span class="day-month">{{ day.month_name }}</span>
                      </div>
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (room of rackData()?.rooms; track room.id) {
                  <!-- Fila Cabecera de Habitación -->
                  <tr class="row-room-header">
                    <td class="col-sticky-unit room-title-cell" colspan="2">
                      <div class="room-info-badge">
                        <strong class="room-number">Hab {{ room.number }}</strong>
                        <span class="room-name">{{ room.name }}</span>
                        <span class="room-badge" [ngClass]="getRoomTypeClass(room.room_type)">
                          {{ room.room_type_display }}
                        </span>
                        <span class="room-capacity">({{ room.capacity }} plazas)</span>
                      </div>
                    </td>
                    <td [attr.colspan]="rackData()?.dates?.length" class="room-header-filler"></td>
                  </tr>

                  <!-- Filas de Camas / Plazas Individuales -->
                  @for (bed of room.beds; track bed.id) {
                    <tr class="row-bed">
                      <td class="col-sticky-unit bed-name-cell">
                        <div class="bed-meta">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="bed-icon">
                            <path d="M2 4v16M2 8h20v12M22 4v16"/>
                            <path d="M6 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
                            <line x1="2" y1="14" x2="22" y2="14"/>
                          </svg>
                          <span class="bed-number">{{ bed.number }}</span>
                          <span class="bed-type-tag">{{ bed.bed_type_display }}</span>
                        </div>
                      </td>
                      <td class="col-sticky-price bed-price-cell">
                        \${{ bed.price | number:'1.0-0' }}
                      </td>

                      @for (cell of bed.cells; track cell.date) {
                        <td
                          class="matrix-cell"
                          [style.background-color]="cell.color"
                          [title]="getCellTooltip(room, bed, cell)"
                          (click)="onCellClick(room, bed, cell)"
                        >
                          <div class="cell-content">
                            @if (cell.reservation) {
                              <span class="res-text">
                                {{ cell.reservation.guest_name }}
                              </span>
                            } @else if (cell.maintenance) {
                              <span class="maint-text">Mantenimiento</span>
                            }
                          </div>
                        </td>
                      }
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Modal de Detalle de Reserva / Celda -->
      @if (selectedReservation()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="badge" [ngClass]="getBadgeClass(selectedReservation()!.status)">
                  {{ selectedReservation()!.status_display }}
                </span>
                <h2 class="modal-code">Reserva {{ selectedReservation()!.code }}</h2>
              </div>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Huésped</span>
                  <strong class="detail-value">{{ selectedReservation()!.guest_name }}</strong>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Teléfono de Contacto</span>
                  <strong class="detail-value">{{ selectedReservation()!.guest_phone || 'No registrado' }}</strong>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Check-in</span>
                  <strong class="detail-value">{{ selectedReservation()!.check_in }}</strong>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Check-out</span>
                  <strong class="detail-value">{{ selectedReservation()!.check_out }}</strong>
                </div>

                <div class="detail-item">
                  <span class="detail-label">Unidad Seleccionada</span>
                  <strong class="detail-value">Hab {{ activeRoom()?.number }} • {{ activeBed()?.number }}</strong>
                </div>
              </div>

              <!-- Acciones Rápidas de Recepción -->
              <div class="modal-actions-bar">
                @if (selectedReservation()!.status === 'CONFIRMADA' || selectedReservation()!.status === 'PENDIENTE_SENA') {
                  <button
                    class="btn btn-success"
                    (click)="changeStatus(selectedReservation()!.id, 'CHECK_IN')"
                    [disabled]="actionLoading()"
                  >
                    <span>Realizar Check-in</span>
                  </button>
                }

                @if (selectedReservation()!.status === 'CHECK_IN') {
                  <button
                    class="btn btn-warning"
                    (click)="changeStatus(selectedReservation()!.id, 'CHECK_OUT')"
                    [disabled]="actionLoading()"
                  >
                    <span>Realizar Check-out (Pasa a Sucia)</span>
                  </button>
                }

                @if (selectedReservation()!.status !== 'CANCELADA' && selectedReservation()!.status !== 'CHECK_OUT') {
                  <button
                    class="btn btn-danger-outline"
                    (click)="promptCancel(selectedReservation()!.id)"
                    [disabled]="actionLoading()"
                  >
                    <span>Cancelar Reserva (Trazable)</span>
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .rack-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .rack-header {
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

    .rack-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .nav-date-group {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      background: white;
      padding: 0.25rem;
      border-radius: 0.5rem;
      border: 1px solid #E2E8F0;
    }

    .date-picker {
      padding: 0.25rem 0.5rem;
      font-size: 0.8125rem;
      border: none;
      outline: none;
    }

    .days-selector {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: white;
      padding: 0.25rem;
      border-radius: 0.5rem;
      border: 1px solid #E2E8F0;
    }

    .selector-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748B;
      padding: 0 0.375rem;
    }

    .legend-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 0.625rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid #E2E8F0;
      overflow-x: auto;
    }

    .legend-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .legend-items {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #475569;
      white-space: nowrap;
    }

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* Tabla Matriz */
    .matrix-card {
      background: white;
      border-radius: 1rem;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .matrix-scroll-wrapper {
      overflow-x: auto;
      max-height: 75vh;
    }

    .matrix-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.8125rem;
    }

    /* Columnas fijas (sticky) */
    .col-sticky-unit {
      position: sticky;
      left: 0;
      z-index: 20;
      background: white;
      width: 240px;
      min-width: 240px;
      max-width: 240px;
      border-right: 2px solid #E2E8F0;
      padding: 0.625rem 0.875rem;
    }

    .col-sticky-price {
      position: sticky;
      left: 240px;
      z-index: 19;
      background: #F8FAFC;
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      border-right: 2px solid #E2E8F0;
      text-align: right;
      padding: 0.625rem 0.75rem;
      font-weight: 600;
      color: #0F172A;
    }

    .header-days-row th {
      position: sticky;
      top: 0;
      z-index: 30;
      background: #0F172A;
      color: white;
      padding: 0.5rem 0.25rem;
      font-weight: 600;
      text-align: center;
      border-bottom: 2px solid #334155;
    }

    .header-days-row th.col-sticky-unit,
    .header-days-row th.col-sticky-price {
      z-index: 40;
      background: #0F172A;
      color: white;
      border-right-color: #334155;
    }

    .col-day {
      width: 54px;
      min-width: 54px;
      max-width: 54px;
      border-right: 1px solid #334155;
    }

    .col-day.day-today {
      background: #1E3A8A !important;
      border-bottom: 3px solid #60A5FA;
    }

    .col-day.day-weekend {
      background: #1E293B;
    }

    .day-head-content {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .day-name {
      font-size: 0.625rem;
      text-transform: uppercase;
      opacity: 0.8;
    }

    .day-number {
      font-size: 0.875rem;
      font-weight: 700;
    }

    .day-month {
      font-size: 0.5625rem;
      opacity: 0.7;
    }

    /* Filas de la habitación */
    .row-room-header td {
      background: #F1F5F9;
      border-top: 2px solid #CBD5E1;
      border-bottom: 1px solid #E2E8F0;
    }

    .room-title-cell {
      background: #F1F5F9 !important;
    }

    .room-info-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .room-number {
      font-size: 0.875rem;
      color: #0F172A;
      font-weight: 800;
    }

    .room-name {
      font-size: 0.75rem;
      color: #475569;
    }

    .room-badge {
      font-size: 0.625rem;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .room-double { background: #DBEAFE; color: #1E40AF; }
    .room-triple { background: #E0E7FF; color: #3730A3; }
    .room-shared { background: #FEF3C7; color: #92400E; }

    .room-capacity {
      font-size: 0.6875rem;
      color: #64748B;
    }

    /* Filas de camas */
    .row-bed td {
      border-bottom: 1px solid #F1F5F9;
      height: 40px;
    }

    .bed-name-cell {
      background: white;
    }

    .bed-meta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bed-icon { font-size: 0.875rem; }
    .bed-number { font-weight: 600; color: #0F172A; font-size: 0.8125rem; }
    .bed-type-tag { font-size: 0.625rem; color: #64748B; background: #F1F5F9; padding: 0.125rem 0.25rem; border-radius: 0.25rem; }

    /* Celdas interactivas */
    .matrix-cell {
      padding: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      position: relative;
      transition: filter 0.1s ease;
      text-align: center;
      user-select: none;
    }

    .matrix-cell:hover {
      filter: brightness(0.9);
      box-shadow: inset 0 0 0 2px #0F172A;
    }

    .cell-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.125rem;
      overflow: hidden;
    }

    .res-text {
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      padding: 0 2px;
    }

    .maint-text {
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
    }

    /* Modal de detalle */
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-code {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #64748B;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      background: #F8FAFC;
      padding: 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid #E2E8F0;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .detail-value {
      font-size: 0.9375rem;
      color: #0F172A;
      margin-top: 0.125rem;
    }

    .modal-actions-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
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
export class RackComponent implements OnInit {
  private pmsService = inject(PmsService);

  rackData = signal<RackResponse | null>(null);
  loading = signal(true);
  actionLoading = signal(false);

  selectedStartDate = new Date().toISOString().substring(0, 10);
  selectedDays = 14;

  // Modal de detalle
  selectedReservation = signal<any | null>(null);
  activeRoom = signal<RackRoom | null>(null);
  activeBed = signal<RackBed | null>(null);

  ngOnInit(): void {
    this.loadRack();
  }

  loadRack(): void {
    this.loading.set(true);
    this.pmsService.getRack(this.selectedStartDate, this.selectedDays).subscribe({
      next: (data) => {
        this.rackData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setDays(days: number): void {
    this.selectedDays = days;
    this.loadRack();
  }

  goToday(): void {
    this.selectedStartDate = new Date().toISOString().substring(0, 10);
    this.loadRack();
  }

  changeDaysOffset(offset: number): void {
    const cur = new Date(this.selectedStartDate);
    cur.setDate(cur.getDate() + offset);
    this.selectedStartDate = cur.toISOString().substring(0, 10);
    this.loadRack();
  }

  onCellClick(room: RackRoom, bed: RackBed, cell: RackCell): void {
    if (cell.reservation) {
      this.selectedReservation.set(cell.reservation);
      this.activeRoom.set(room);
      this.activeBed.set(bed);
    } else if (cell.maintenance) {
      alert(`Bloqueo de Mantenimiento en Habitación ${room.number} (${bed.number})\nMotivo: ${cell.maintenance.reason}`);
    } else {
      // Disponible: Informar o redirigir
      const action = confirm(
        `La plaza ${bed.number} de la Habitación ${room.number} está DISPONIBLE para el día ${cell.date}.\n¿Deseas crear una reserva para esta fecha?`
      );
      if (action) {
        // Redirigir a reservas
        window.location.href = `#/reservations?date=${cell.date}&bed=${bed.id}`;
      }
    }
  }

  closeModal(): void {
    this.selectedReservation.set(null);
    this.activeRoom.set(null);
    this.activeBed.set(null);
  }

  changeStatus(reservationId: number, status: ReservationStatus): void {
    this.actionLoading.set(true);
    this.pmsService.changeReservationStatus(reservationId, status).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeModal();
        this.loadRack();
      },
      error: (err) => {
        this.actionLoading.set(false);
        alert('Error al actualizar estado: ' + (err.error?.error || 'Error en servidor'));
      }
    });
  }

  promptCancel(reservationId: number): void {
    const reason = prompt('Ingrese el motivo de la cancelación (Requerido para auditoría y trazabilidad):');
    if (!reason || !reason.trim()) {
      alert('Debe especificar un motivo para registrar la cancelación.');
      return;
    }

    this.actionLoading.set(true);
    this.pmsService.cancelReservation(reservationId, reason.trim()).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.closeModal();
        this.loadRack();
      },
      error: (err) => {
        this.actionLoading.set(false);
        alert('Error al cancelar: ' + (err.error?.error || 'Error en servidor'));
      }
    });
  }

  getCellTooltip(room: RackRoom, bed: RackBed, cell: RackCell): string {
    if (cell.reservation) {
      return `${cell.reservation.guest_name} • ${cell.label} (Hab ${room.number} - ${bed.number})`;
    }
    if (cell.maintenance) {
      return `Mantenimiento: ${cell.maintenance.reason}`;
    }
    return `${cell.label} (Hab ${room.number} - ${bed.number}) • $${bed.price}`;
  }

  getRoomTypeClass(type: string): string {
    if (type === 'DOUBLE_PRIVATE') return 'room-double';
    if (type === 'TRIPLE_PRIVATE') return 'room-triple';
    return 'room-shared';
  }

  getBadgeClass(status: string): string {
    if (status === 'CONFIRMADA') return 'badge-confirmada';
    if (status === 'PENDIENTE_SENA') return 'badge-sena';
    if (status === 'CHECK_IN') return 'badge-ocupada';
    if (status === 'CANCELADA') return 'badge-cancelada';
    return 'badge-disponible';
  }
}
