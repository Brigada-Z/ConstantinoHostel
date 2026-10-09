import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PmsService } from '../../core/services/pms.service';
import { DashboardStats } from '../../core/models/pms.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade">
      <!-- Encabezado de Página -->
      <div class="page-header">
        <div class="header-text">
          <div class="header-tag">
            <span class="tag-dot"></span>
            <span>PMS OPERATIVO EN TIEMPO REAL • HOSTEL CONSTANTINO</span>
          </div>
          <h1 class="page-title">Panel de Control & Indicadores</h1>
          <p class="page-subtitle">Monitoreo operacional instantáneo: 10 unidades habitacionales, 38 plazas totales</p>
        </div>

        <div class="header-actions">
          <a routerLink="/rack" class="btn btn-outline">
            <!-- Monochromatic Rack Icon -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            <span>Ver Rack de Ocupación</span>
          </a>

          <a routerLink="/reservations" class="btn btn-primary">
            <!-- Monochromatic Plus Icon -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nueva Reserva</span>
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Sincronizando métricas operacionales del hostel...</p>
        </div>
      } @else if (stats()) {
        <!-- Fila de Tarjetas KPI Ultra-Estilísticas -->
        <div class="kpi-grid">
          <!-- KPI 1: Ocupación Hoy -->
          <div class="kpi-card">
            <div class="kpi-glow"></div>
            <div class="kpi-top">
              <span class="kpi-label">Ocupación Actual</span>
              <div class="kpi-icon-wrapper">
                <!-- Monochromatic Trend SVG -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats()?.occupancy_rate }}%</span>
              <span class="kpi-sub">{{ stats()?.occupied_beds_today }} / {{ stats()?.total_beds }} plazas</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" [style.width.%]="stats()?.occupancy_rate"></div>
            </div>
            <div class="kpi-footer">
              <span class="footer-note">{{ stats()?.available_beds_today }} plazas disponibles para venta directa</span>
            </div>
          </div>

          <!-- KPI 2: Check-ins Hoy -->
          <div class="kpi-card">
            <div class="kpi-glow"></div>
            <div class="kpi-top">
              <span class="kpi-label">Check-ins Hoy</span>
              <div class="kpi-icon-wrapper icon-info">
                <!-- Monochromatic Inbound SVG -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v12"/>
                  <polyline points="19 10 12 17 5 10"/>
                  <path d="M5 21h14"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats()?.check_ins_today }}</span>
              <span class="kpi-sub">Ingresos programados</span>
            </div>
            <div class="kpi-status-badge status-info">
              <span class="pulse-indicator"></span>
              <span>Recepción & Asignación de Plazas</span>
            </div>
          </div>

          <!-- KPI 3: Check-outs Hoy -->
          <div class="kpi-card">
            <div class="kpi-glow"></div>
            <div class="kpi-top">
              <span class="kpi-label">Check-outs Hoy</span>
              <div class="kpi-icon-wrapper icon-warning">
                <!-- Monochromatic Outbound SVG -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 17V5"/>
                  <polyline points="5 10 12 3 19 10"/>
                  <path d="M5 21h14"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats()?.check_outs_today }}</span>
              <span class="kpi-sub">Salidas previstas</span>
            </div>
            <div class="kpi-status-badge status-warning">
              <span class="pulse-indicator warning"></span>
              <span>Pasan a circuito de sanitización</span>
            </div>
          </div>

          <!-- KPI 4: Unidades Sucias / Limpieza -->
          <div class="kpi-card">
            <div class="kpi-glow"></div>
            <div class="kpi-top">
              <span class="kpi-label">Unidades Sucias</span>
              <div class="kpi-icon-wrapper icon-danger">
                <!-- Monochromatic Broom / Sparkle SVG -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ stats()?.dirty_units_count }}</span>
              <span class="kpi-sub">Habitaciones / Camas</span>
            </div>
            <div class="kpi-footer">
              <a routerLink="/housekeeping" class="link-clean">
                <span>Ver Módulo de Limpieza</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Sección de Operatividad y Plazas del Hostel -->
        <div class="summary-section">
          <!-- Tarjeta 1: Distribución Arquitectónica -->
          <div class="card summary-card">
            <div class="card-header">
              <div class="card-header-titles">
                <span class="header-micro">ESTRUCTURA INVENTARIO</span>
                <h3 class="card-title">Distribución de Capacidad</h3>
              </div>
              <span class="badge badge-gold">38 Plazas Habilitadas</span>
            </div>
            <div class="card-body">
              <div class="units-breakdown">
                <!-- Grupo 1: Dobles Privadas -->
                <div class="unit-group">
                  <div class="unit-icon-box">
                    <!-- Monochromatic Double Bed SVG -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 4v16M2 8h20v12M22 4v16"/>
                      <path d="M6 8v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
                      <line x1="2" y1="14" x2="22" y2="14"/>
                    </svg>
                  </div>
                  <div class="unit-detail">
                    <div class="unit-title-row">
                      <strong>4 Dobles Privadas Deluxe & Twin</strong>
                      <span class="unit-pills">8 plazas</span>
                    </div>
                    <span class="unit-sub">Habitaciones 101, 102, 103 (Balcón), 104 • Sommier King & Twins</span>
                  </div>
                </div>

                <!-- Grupo 2: Triples Privadas -->
                <div class="unit-group">
                  <div class="unit-icon-box">
                    <!-- Monochromatic Triple / Users SVG -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div class="unit-detail">
                    <div class="unit-title-row">
                      <strong>2 Triples Familiares & Amigos</strong>
                      <span class="unit-pills">6 plazas</span>
                    </div>
                    <span class="unit-sub">Habitaciones 201 (Familiar), 202 (Tres Singles) • Baños en Suite</span>
                  </div>
                </div>

                <!-- Grupo 3: Compartidas 6 Plazas -->
                <div class="unit-group">
                  <div class="unit-icon-box">
                    <!-- Monochromatic Bunk Dorm SVG -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="3" x2="8" y2="21"/>
                    </svg>
                  </div>
                  <div class="unit-detail">
                    <div class="unit-title-row">
                      <strong>4 Dormitorios Compartidos (6 Plazas c/u)</strong>
                      <span class="unit-pills">24 plazas</span>
                    </div>
                    <span class="unit-sub">Habitaciones 301 (Mixta A), 302 (Mixta B), 303 (Femenina), 304 (Masculina)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Alertas Operacionales -->
          <div class="card summary-card">
            <div class="card-header">
              <div class="card-header-titles">
                <span class="header-micro">ALERTAS DE GESTIÓN</span>
                <h3 class="card-title">Auditoría & Operaciones</h3>
              </div>
              <span class="badge badge-confirmada">Protocolo Activo</span>
            </div>
            <div class="card-body">
              <ul class="alerts-list">
                @if (stats()?.pending_deposits_count! > 0) {
                  <li class="alert-item warning">
                    <div class="alert-icon-ring warn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div class="alert-text">
                      <strong>{{ stats()?.pending_deposits_count }} Reserva(s) con seña bancaria pendiente</strong>
                      <p>Validar comprobantes de transferencia antes del vencimiento del plazo preventivo.</p>
                    </div>
                  </li>
                }

                @if (stats()?.dirty_units_count! > 0) {
                  <li class="alert-item danger">
                    <div class="alert-icon-ring dang">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <div class="alert-text">
                      <strong>{{ stats()?.dirty_units_count }} Unidad(es) pendientes de aseo / sanitización</strong>
                      <p>El personal de campo debe actualizar su estado físico en la app móvil de limpieza.</p>
                    </div>
                  </li>
                }

                <li class="alert-item success">
                  <div class="alert-icon-ring succ">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div class="alert-text">
                    <strong>Algoritmo Anti-Overbooking En Ejecución</strong>
                    <p>Integridad transaccional y validación estricta de solapamiento de fechas operando en tiempo real.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      color: var(--text-main);
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 1.5rem;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .header-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      color: var(--gold-accent);
      text-transform: uppercase;
    }

    .tag-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold-accent);
      box-shadow: 0 0 8px var(--gold-accent);
    }

    .page-title {
      font-size: 2.2rem;
      margin: 0;
      letter-spacing: 0.03em;
    }

    .page-subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .header-actions {
      display: flex;
      gap: 0.85rem;
      align-items: center;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5rem 2rem;
      gap: 1.25rem;
      color: var(--text-muted);
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(255, 255, 255, 0.08);
      border-top-color: var(--gold-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      box-shadow: 0 0 20px rgba(212, 191, 142, 0.2);
    }

    .loading-text {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .kpi-card {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: all var(--transition-fast);
    }

    .kpi-card:hover {
      border-color: var(--border-medium);
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg), 0 0 25px rgba(0, 0, 0, 0.8);
    }

    .kpi-glow {
      position: absolute;
      top: -40px;
      right: -40px;
      width: 90px;
      height: 90px;
      background: rgba(212, 191, 142, 0.04);
      border-radius: 50%;
      filter: blur(25px);
      pointer-events: none;
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }

    .kpi-label {
      font-family: var(--font-heading);
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .kpi-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .kpi-card:hover .kpi-icon-wrapper {
      border-color: var(--gold-border);
      box-shadow: 0 0 15px rgba(212, 191, 142, 0.15);
    }

    .icon-info { color: var(--info); }
    .icon-warning { color: var(--warning); }
    .icon-danger { color: var(--danger); }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 0.65rem;
      margin-bottom: 1rem;
    }

    .kpi-value {
      font-family: var(--font-heading);
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1;
      letter-spacing: -0.01em;
    }

    .kpi-sub {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--gold-accent), #f3ebda);
      box-shadow: 0 0 10px rgba(212, 191, 142, 0.4);
      border-radius: var(--radius-full);
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .kpi-footer {
      font-size: 0.78rem;
      color: var(--text-dim);
      margin-top: 0.25rem;
    }

    .footer-note {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .kpi-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.75rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-xs);
      font-weight: 500;
    }

    .status-info {
      background: var(--info-bg);
      border: 1px solid var(--info-border);
      color: var(--info);
    }

    .status-warning {
      background: var(--warning-bg);
      border: 1px solid var(--warning-border);
      color: var(--warning);
    }

    .pulse-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
    }

    .link-clean {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--font-heading);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--danger);
      font-weight: 500;
      transition: gap var(--transition-fast);
    }

    .link-clean:hover {
      gap: 0.6rem;
      color: #fca5a5;
    }

    /* Summary Section */
    .summary-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .summary-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    .card-header-titles {
      display: flex;
      flex-direction: column;
    }

    .header-micro {
      font-family: var(--font-heading);
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      color: var(--gold-accent);
      text-transform: uppercase;
    }

    .units-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .unit-group {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
    }

    .unit-group:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--border-medium);
      transform: translateX(3px);
    }

    .unit-icon-box {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .unit-detail {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      flex: 1;
    }

    .unit-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .unit-title-row strong {
      font-size: 0.9rem;
      color: var(--text-main);
    }

    .unit-pills {
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--gold-accent);
    }

    .unit-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    /* Alerts List */
    .alerts-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .alert-item {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
      padding: 1rem 1.15rem;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      transition: all var(--transition-fast);
    }

    .alert-item.warning {
      background: var(--warning-bg);
      border-color: var(--warning-border);
    }

    .alert-item.danger {
      background: var(--danger-bg);
      border-color: var(--danger-border);
    }

    .alert-item.success {
      background: var(--success-bg);
      border-color: var(--success-border);
    }

    .alert-icon-ring {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 0.15rem;
    }

    .alert-icon-ring.warn {
      background: rgba(251, 191, 36, 0.2);
      color: var(--warning);
    }

    .alert-icon-ring.dang {
      background: rgba(248, 113, 113, 0.2);
      color: var(--danger);
    }

    .alert-icon-ring.succ {
      background: rgba(52, 211, 153, 0.2);
      color: var(--success);
    }

    .alert-text strong {
      font-size: 0.85rem;
      color: var(--text-main);
      display: block;
      margin-bottom: 0.2rem;
    }

    .alert-text p {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private pmsService = inject(PmsService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.pmsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
