import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsService } from '../../core/services/pms.service';
import { HousekeepingRoom, PhysicalStatus } from '../../core/models/pms.models';

@Component({
  selector: 'app-housekeeping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="housekeeping-container">
      <!-- Encabezado Mobile-First -->
      <div class="hk-header">
        <div class="hk-title-group">
          <div class="hk-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <div>
            <h1 class="hk-title">Operatividad de Limpieza</h1>
            <p class="hk-subtitle">Actualización rápida de estados físicos (Móvil)</p>
          </div>
        </div>
        <button (click)="loadRooms()" class="btn btn-outline btn-sm" [disabled]="loading()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      <!-- Filtros Rápidos -->
      <div class="filter-pills">
        <button
          class="pill-btn"
          [class.active]="filterStatus === 'ALL'"
          (click)="setFilter('ALL')"
        >
          Todas ({{ rooms().length }})
        </button>
        <button
          class="pill-btn pill-dirty"
          [class.active]="filterStatus === 'DIRTY'"
          (click)="setFilter('DIRTY')"
        >
          Requieren Aseo ({{ dirtyCount() }})
        </button>
        <button
          class="pill-btn pill-clean"
          [class.active]="filterStatus === 'CLEAN'"
          (click)="setFilter('CLEAN')"
        >
          Limpias ({{ cleanCount() }})
        </button>
      </div>

      <!-- Mensaje de Éxito / Feedback táctil -->
      @if (lastUpdatedMessage()) {
        <div class="toast-feedback">
          {{ lastUpdatedMessage() }}
        </div>
      }

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando unidades de limpieza...</p>
        </div>
      } @else {
        <!-- Tarjetas de Habitaciones y Camas -->
        <div class="rooms-grid">
          @for (room of filteredRooms(); track room.id) {
            <div class="room-card" [class.needs-clean]="room.physical_status === 'DIRTY'">
              <div class="card-top">
                <div class="room-title">
                  <span class="room-num">Hab {{ room.number }}</span>
                  <span class="room-type-tag">{{ room.room_type_display }} • Piso {{ room.floor }}</span>
                </div>
                <span class="status-badge" [ngClass]="getStatusClass(room.physical_status)">
                  {{ room.physical_status_display }}
                </span>
              </div>

              <!-- Controles de 1 Toque para la Habitación Completa -->
              <div class="action-buttons-group">
                <span class="btn-group-label">Acción de Habitación:</span>
                <div class="touch-buttons">
                  <button
                    class="touch-btn btn-clean"
                    [class.active]="room.physical_status === 'CLEAN'"
                    (click)="updateStatus('room', room.id, 'CLEAN')"
                  >
                    Limpia
                  </button>
                  <button
                    class="touch-btn btn-cleaning"
                    [class.active]="room.physical_status === 'CLEANING'"
                    (click)="updateStatus('room', room.id, 'CLEANING')"
                  >
                    Limpiando
                  </button>
                  <button
                    class="touch-btn btn-dirty"
                    [class.active]="room.physical_status === 'DIRTY'"
                    (click)="updateStatus('room', room.id, 'DIRTY')"
                  >
                    Sucia
                  </button>
                  <button
                    class="touch-btn btn-maint"
                    [class.active]="room.physical_status === 'MAINTENANCE'"
                    (click)="updateStatus('room', room.id, 'MAINTENANCE')"
                  >
                    Mant.
                  </button>
                </div>
              </div>

              <!-- Si tiene camas individuales (especialmente compartidas de 6) -->
              @if (room.beds && room.beds.length > 0) {
                <div class="beds-section">
                  <span class="beds-title">Camas individuales:</span>
                  <div class="beds-list">
                    @for (bed of room.beds; track bed.id) {
                      <div class="bed-item">
                        <div class="bed-item-info">
                          <span class="bed-item-num">{{ bed.number }}</span>
                          <span class="bed-item-status" [ngClass]="getStatusClass(bed.physical_status)">
                            {{ bed.physical_status_display }}
                          </span>
                        </div>
                        <div class="bed-touch-actions">
                          <button
                            class="micro-btn micro-clean"
                            (click)="updateStatus('bed', bed.id, 'CLEAN')"
                            title="Marcar Cama Limpia"
                          >
                            ✓
                          </button>
                          <button
                            class="micro-btn micro-dirty"
                            (click)="updateStatus('bed', bed.id, 'DIRTY')"
                            title="Marcar Cama Sucia"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .housekeeping-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .hk-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .hk-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .hk-icon {
      font-size: 2rem;
    }

    .hk-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0F172A;
      margin: 0;
    }

    .hk-subtitle {
      font-size: 0.8125rem;
      color: #64748B;
      margin: 0;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .pill-btn {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 700;
      border: 1px solid #CBD5E1;
      background: white;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .pill-btn.active {
      background: #0F172A;
      color: white;
      border-color: #0F172A;
    }

    .pill-dirty.active {
      background: #DC2626;
      border-color: #DC2626;
      color: white;
    }

    .pill-clean.active {
      background: #059669;
      border-color: #059669;
      color: white;
    }

    .toast-feedback {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #065F46;
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .room-card {
      background: white;
      border-radius: 1rem;
      border: 2px solid #E2E8F0;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: border-color 0.2s ease;
    }

    .room-card.needs-clean {
      border-color: #FCA5A5;
      background: #FFFDFD;
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .room-title {
      display: flex;
      flex-direction: column;
    }

    .room-num {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0F172A;
    }

    .room-type-tag {
      font-size: 0.75rem;
      color: #64748B;
    }

    .status-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .status-clean { background: #D1FAE5; color: #065F46; }
    .status-cleaning { background: #FFEDD5; color: #9A3412; }
    .status-dirty { background: #FEE2E2; color: #991B1B; }
    .status-maint { background: #F1F5F9; color: #475569; }

    .action-buttons-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .btn-group-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
    }

    .touch-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.375rem;
    }

    .touch-btn {
      padding: 0.625rem 0.25rem;
      border-radius: 0.5rem;
      font-size: 0.6875rem;
      font-weight: 700;
      border: 1px solid #CBD5E1;
      background: #F8FAFC;
      color: #334155;
      cursor: pointer;
      text-align: center;
      transition: all 0.1s ease;
      touch-action: manipulation;
    }

    .touch-btn:active {
      transform: scale(0.96);
    }

    .touch-btn.btn-clean:hover, .touch-btn.btn-clean.active {
      background: #10B981;
      color: white;
      border-color: #10B981;
    }

    .touch-btn.btn-cleaning:hover, .touch-btn.btn-cleaning.active {
      background: #F97316;
      color: white;
      border-color: #F97316;
    }

    .touch-btn.btn-dirty:hover, .touch-btn.btn-dirty.active {
      background: #EF4444;
      color: white;
      border-color: #EF4444;
    }

    .touch-btn.btn-maint:hover, .touch-btn.btn-maint.active {
      background: #64748B;
      color: white;
      border-color: #64748B;
    }

    /* Camas individuales */
    .beds-section {
      background: #F8FAFC;
      border-radius: 0.5rem;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .beds-title {
      font-size: 0.6875rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
    }

    .beds-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .bed-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      padding: 0.375rem 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid #E2E8F0;
    }

    .bed-item-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .bed-item-num {
      font-size: 0.75rem;
      font-weight: 600;
      color: #0F172A;
    }

    .bed-item-status {
      font-size: 0.625rem;
      font-weight: 700;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
    }

    .bed-touch-actions {
      display: flex;
      gap: 0.25rem;
    }

    .micro-btn {
      width: 28px;
      height: 28px;
      border-radius: 0.25rem;
      border: none;
      font-weight: 800;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .micro-clean { background: #D1FAE5; color: #065F46; }
    .micro-clean:hover { background: #10B981; color: white; }

    .micro-dirty { background: #FEE2E2; color: #991B1B; }
    .micro-dirty:hover { background: #EF4444; color: white; }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #64748B;
      gap: 1rem;
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
export class HousekeepingComponent implements OnInit {
  private pmsService = inject(PmsService);

  rooms = signal<HousekeepingRoom[]>([]);
  loading = signal(true);
  filterStatus = 'ALL';
  lastUpdatedMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.pmsService.getHousekeepingRooms().subscribe({
      next: (data) => {
        this.rooms.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus = status;
  }

  filteredRooms(): HousekeepingRoom[] {
    const r = this.rooms();
    if (this.filterStatus === 'DIRTY') {
      return r.filter(x => x.physical_status === 'DIRTY' || x.physical_status === 'CLEANING');
    }
    if (this.filterStatus === 'CLEAN') {
      return r.filter(x => x.physical_status === 'CLEAN');
    }
    return r;
  }

  dirtyCount(): number {
    return this.rooms().filter(x => x.physical_status === 'DIRTY' || x.physical_status === 'CLEANING').length;
  }

  cleanCount(): number {
    return this.rooms().filter(x => x.physical_status === 'CLEAN').length;
  }

  updateStatus(targetType: 'room' | 'bed', targetId: number, status: PhysicalStatus): void {
    this.pmsService.updateHousekeepingStatus({
      target_type: targetType,
      target_id: targetId,
      status
    }).subscribe({
      next: (res) => {
        this.lastUpdatedMessage.set(res.message || 'Estado físico actualizado.');
        setTimeout(() => this.lastUpdatedMessage.set(null), 3500);
        this.loadRooms();
      },
      error: (err) => {
        alert('Error: ' + JSON.stringify(err.error));
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'CLEAN') return 'status-clean';
    if (status === 'CLEANING') return 'status-cleaning';
    if (status === 'DIRTY') return 'status-dirty';
    return 'status-maint';
  }
}
