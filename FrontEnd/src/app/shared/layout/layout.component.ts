import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell">
      <!-- Navbar Superior Minimalista Oscuro -->
      <header class="app-header">
        <div class="header-left">
          <a routerLink="/dashboard" class="hotel-logo">
            <div class="logo-circle">
              <img src="assets/logo.png" alt="Hostel Constantino" class="header-logo-img" />
            </div>
            <div class="logo-text">
              <span class="brand-name">Hostel Constantino</span>
              <span class="brand-tag">PMS • SISTEMA INTEGRAL</span>
            </div>
          </a>
        </div>

        <nav class="header-nav">
          @if (!authService.isHousekeeping() || authService.isReception()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <!-- Dashboard SVG -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
              <span>Dashboard</span>
            </a>

            <a routerLink="/rack" routerLinkActive="active" class="nav-item">
              <!-- Rack Grid SVG -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              <span>Rack</span>
            </a>

            <a routerLink="/reservations" routerLinkActive="active" class="nav-item">
              <!-- Reservations Clipboard SVG -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              <span>Reservas</span>
            </a>

            <a routerLink="/guests" routerLinkActive="active" class="nav-item">
              <!-- Guests Users SVG -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Huéspedes</span>
            </a>
          }

          <a routerLink="/housekeeping" routerLinkActive="active" class="nav-item">
            <!-- Housekeeping Sparkle SVG -->
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Limpieza</span>
          </a>

          @if (authService.isAdmin()) {
            <a routerLink="/audit" routerLinkActive="active" class="nav-item">
              <!-- Audit Shield SVG -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Auditoría</span>
            </a>
          }
        </nav>

        <div class="header-right">
          <!-- Botón de acceso a la Landing / Catálogo público -->
          <a routerLink="/" class="btn-public-web" title="Ver Landing Page y Catálogo Público">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span class="web-text">Ver Web</span>
          </a>

          <div class="user-pill">
            <div class="user-avatar">{{ userInitial() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ user()?.first_name || user()?.username }}</span>
              <span class="user-role" [ngClass]="'role-' + (user()?.role?.toLowerCase() || '')">
                {{ userRoleLabel() }}
              </span>
            </div>
          </div>

          <button (click)="logout()" class="btn-logout" title="Cerrar sesión">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="logout-text">Salir</span>
          </button>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-deep);
    }

    .app-header {
      background: rgba(10, 11, 14, 0.95);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.65rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      gap: 1.5rem;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .hotel-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .logo-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--gold-border);
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(212, 191, 142, 0.15);
    }

    .header-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--text-main);
      line-height: 1.1;
      letter-spacing: 0.05em;
    }

    .brand-tag {
      font-size: 0.65rem;
      color: var(--gold-accent);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-sm);
      font-family: var(--font-heading);
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 500;
      color: var(--text-muted);
      border: 1px solid transparent;
      transition: all var(--transition-fast);
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-main);
    }

    .nav-item.active {
      background: rgba(212, 191, 142, 0.1);
      border-color: var(--gold-border);
      color: var(--gold-accent);
      box-shadow: 0 0 15px rgba(212, 191, 142, 0.15);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-public-web {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.75rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-medium);
      color: var(--text-muted);
      font-family: var(--font-heading);
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: all var(--transition-fast);
    }

    .btn-public-web:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.25rem 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
    }

    .user-avatar {
      width: 30px;
      height: 30px;
      background: var(--gold-accent);
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.85rem;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      padding-right: 0.4rem;
    }

    .user-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .user-role {
      font-family: var(--font-heading);
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .role-admin { color: var(--gold-accent); }
    .role-recepcion { color: var(--info); }
    .role-limpieza { color: var(--warning); }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.75rem;
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid var(--danger-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: var(--font-heading);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .btn-logout:hover {
      background: rgba(248, 113, 113, 0.22);
      transform: translateY(-1px);
    }

    .app-main {
      flex: 1;
      padding: 2rem 1.75rem;
      max-width: 1550px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 960px) {
      .app-header {
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
      }
      .header-nav {
        order: 3;
        width: 100%;
        overflow-x: auto;
        padding-top: 0.6rem;
        border-top: 1px solid var(--border-subtle);
      }
      .logout-text, .web-text {
        display: none;
      }
    }
  `]
})
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  userInitial(): string {
    const u = this.user();
    if (!u) return 'U';
    return (u.first_name?.[0] || u.username?.[0] || 'U').toUpperCase();
  }

  userRoleLabel(): string {
    const role = this.authService.userRole();
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'RECEPCION') return 'Recepción';
    if (role === 'LIMPIEZA') return 'Limpieza';
    return '';
  }

  logout(): void {
    this.authService.logout();
  }
}
