import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmsService } from '../../core/services/pms.service';
import { AuditLog } from '../../core/models/pms.models';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Bitácora de Auditoría & Trazabilidad</h1>
          <p class="page-subtitle">Acceso exclusivo de Gerencia General (Víctor) • Historial inmutable de acciones críticas</p>
        </div>
        <button (click)="loadLogs()" class="btn btn-outline btn-sm" [disabled]="loading()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          <span>Actualizar Logs</span>
        </button>
      </div>

      <div class="security-banner">
        <span class="shield-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </span>
        <div class="banner-text">
          <strong>Registro Concurrente y Transaccional Activo</strong>
          <span>Todas las operaciones de altas, cancelaciones, check-ins y cambios de estado físico quedan grabadas automáticamente con marca temporal y usuario responsable.</span>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Consultando bitácora de auditoría...</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario Responsable</th>
                <th>Tipo de Acción</th>
                <th>Entidad Afectada</th>
                <th>Descripción del Evento</th>
              </tr>
            </thead>
            <tbody>
              @for (log of logs(); track log.id) {
                <tr>
                  <td class="timestamp-cell">
                    {{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                  </td>
                  <td>
                    <div class="user-cell">
                      <span class="user-avatar-small">{{ (log.user_name || 'S')[0].toUpperCase() }}</span>
                      <strong>{{ log.user_name || 'Sistema Automático' }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getActionClass(log.action)">
                      {{ log.action_display || log.action }}
                    </span>
                  </td>
                  <td>
                    <span class="entity-pill">{{ log.entity_type }} #{{ log.entity_id }}</span>
                  </td>
                  <td class="desc-cell">
                    {{ log.description }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-state">
                    No hay registros de auditoría aún.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .audit-page {
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

    .security-banner {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .shield-icon {
      font-size: 2rem;
    }

    .banner-text {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
    }

    .banner-text strong {
      color: #1E3A8A;
      font-size: 0.9375rem;
    }

    .banner-text span {
      color: #475569;
      font-size: 0.8125rem;
    }

    .timestamp-cell {
      font-family: monospace;
      color: #64748B;
      font-size: 0.8125rem;
      white-space: nowrap;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-avatar-small {
      width: 24px;
      height: 24px;
      background: #334155;
      color: white;
      border-radius: 50%;
      font-size: 0.6875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .entity-pill {
      font-family: monospace;
      background: #F1F5F9;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      color: #334155;
      font-weight: 600;
    }

    .desc-cell {
      color: #1E293B;
      font-size: 0.8125rem;
    }

    .badge-create { background: #D1FAE5; color: #065F46; }
    .badge-update { background: #DBEAFE; color: #1E40AF; }
    .badge-cancel { background: #FEE2E2; color: #991B1B; font-weight: 800; }
    .badge-status { background: #FFEDD5; color: #9A3412; }
    .badge-auth { background: #EDE9FE; color: #5B21B6; }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #94A3B8;
    }

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
export class AuditLogsComponent implements OnInit {
  private pmsService = inject(PmsService);

  logs = signal<AuditLog[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.pmsService.getAuditLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getActionClass(action: string): string {
    if (action === 'CREATE') return 'badge-create';
    if (action === 'CANCEL') return 'badge-cancel';
    if (action === 'STATUS_CHANGE') return 'badge-status';
    if (action === 'AUTH') return 'badge-auth';
    return 'badge-update';
  }
}
