import { Component, inject, signal } from '@angular/core';
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

          <div class="user-pill" [title]="(user()?.first_name || user()?.username || 'Usuario') + ' (' + userRoleLabel() + ')'">
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

          <!-- Botón de Menú Móvil / Toggle para PMS -->
          <button
            class="dashboard-mobile-toggle"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Menú de navegación del sistema"
          >
            @if (!mobileMenuOpen()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            }
          </button>
        </div>
      </header>

      <!-- Fullscreen Menú Móvil del Dashboard PMS -->
      @if (mobileMenuOpen()) {
        <div class="dashboard-fullscreen-overlay">
          <div class="fs-overlay-header">
            <div class="fs-overlay-brand">
              <img src="assets/logo.png" alt="Hostel Constantino" class="fs-brand-logo" />
              <div>
                <span class="fs-brand-title">Hostel Constantino</span>
                <span class="fs-brand-subtitle">PMS • SISTEMA INTEGRAL</span>
              </div>
            </div>
            <button class="fs-close-btn" (click)="closeMobileMenu()" aria-label="Cerrar menú">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="fs-overlay-body">
            <!-- Tarjeta de Usuario Activo -->
            <div class="fs-user-card">
              <div class="fs-avatar">{{ userInitial() }}</div>
              <div class="fs-user-details">
                <span class="fs-name">{{ user()?.first_name || user()?.username || 'Usuario' }}</span>
                <div class="fs-user-badges">
                  <span class="user-role" [ngClass]="'role-' + (user()?.role?.toLowerCase() || '')">
                    {{ userRoleLabel() }}
                  </span>
                  <span class="fs-status-online">
                    <span class="status-dot"></span> Sesión activa
                  </span>
                </div>
              </div>
            </div>

            <!-- Navegación del PMS -->
            <nav class="fs-nav-list">
              @if (!authService.isHousekeeping() || authService.isReception()) {
                <a routerLink="/dashboard" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                  <div class="fs-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="9" rx="1"/>
                      <rect x="14" y="3" width="7" height="5" rx="1"/>
                      <rect x="14" y="12" width="7" height="9" rx="1"/>
                      <rect x="3" y="16" width="7" height="5" rx="1"/>
                    </svg>
                  </div>
                  <div class="fs-item-text">
                    <span class="fs-item-title">Dashboard</span>
                    <span class="fs-item-desc">Métricas clave y estado general</span>
                  </div>
                  <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>

                <a routerLink="/rack" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                  <div class="fs-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="3" y1="15" x2="21" y2="15"/>
                      <line x1="9" y1="3" x2="9" y2="21"/>
                      <line x1="15" y1="3" x2="15" y2="21"/>
                    </svg>
                  </div>
                  <div class="fs-item-text">
                    <span class="fs-item-title">Rack de Ocupación</span>
                    <span class="fs-item-desc">Matriz de 10 habitaciones y 38 plazas</span>
                  </div>
                  <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>

                <a routerLink="/reservations" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                  <div class="fs-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                  </div>
                  <div class="fs-item-text">
                    <span class="fs-item-title">Reservas</span>
                    <span class="fs-item-desc">Check-in, Check-out y pagos</span>
                  </div>
                  <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>

                <a routerLink="/guests" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                  <div class="fs-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div class="fs-item-text">
                    <span class="fs-item-title">Huéspedes</span>
                    <span class="fs-item-desc">Padrón de pasajeros y registros</span>
                  </div>
                  <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
              }

              <a routerLink="/housekeeping" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                <div class="fs-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                <div class="fs-item-text">
                  <span class="fs-item-title">Limpieza & Housekeeping</span>
                  <span class="fs-item-desc">Estado de plazas, sábanas y toallas</span>
                </div>
                <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>

              @if (authService.isAdmin()) {
                <a routerLink="/audit" routerLinkActive="active" class="fs-nav-item" (click)="closeMobileMenu()">
                  <div class="fs-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div class="fs-item-text">
                    <span class="fs-item-title">Auditoría del Sistema</span>
                    <span class="fs-item-desc">Registros de actividad inmutables</span>
                  </div>
                  <svg class="fs-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
              }
            </nav>

            <!-- Acciones Rápidas Inferiores -->
            <div class="fs-overlay-actions">
              <a routerLink="/" class="btn btn-outline btn-full fs-action-web" (click)="closeMobileMenu()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                <span>Ver Landing Page / Web Pública</span>
              </a>

              <button (click)="logout(); closeMobileMenu()" class="btn btn-danger btn-full fs-action-logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>

            <div class="fs-overlay-footer">
              <span>HOSTEL CONSTANTINO PMS • v1.0</span>
            </div>
          </div>
        </div>
      }

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

    .dashboard-mobile-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      padding: 0.45rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .dashboard-mobile-toggle:hover {
      background: rgba(212, 191, 142, 0.12);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
    }

    /* Fullscreen Overlay para Dashboard PMS */
    .dashboard-fullscreen-overlay {
      position: fixed;
      inset: 0;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: linear-gradient(180deg, #07070a 0%, #0d0e13 100%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      animation: fsMenuFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fsMenuFade {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .fs-overlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      background: rgba(10, 11, 14, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .fs-overlay-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .fs-brand-logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--gold-border);
      object-fit: cover;
    }

    .fs-brand-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      color: var(--gold-accent);
      letter-spacing: 0.04em;
      font-weight: 700;
      display: block;
    }

    .fs-brand-subtitle {
      font-size: 0.62rem;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      display: block;
    }

    .fs-close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .fs-close-btn:hover {
      background: rgba(212, 191, 142, 0.15);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
      transform: rotate(90deg);
    }

    .fs-overlay-body {
      flex: 1;
      padding: 1.5rem 1.25rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    .fs-user-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.15rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-medium);
    }

    .fs-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold-accent), #9b844b);
      color: #000;
      font-weight: 700;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(212, 191, 142, 0.3);
      flex-shrink: 0;
    }

    .fs-user-details {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
    }

    .fs-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fs-user-badges {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .fs-status-online {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 6px var(--success);
    }

    .fs-nav-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .fs-nav-item {
      display: flex;
      align-items: center;
      gap: 0.95rem;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
    }

    .fs-item-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-xs);
      background: rgba(212, 191, 142, 0.08);
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fs-item-text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .fs-item-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-main);
    }

    .fs-item-desc {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .fs-chevron {
      color: var(--text-muted);
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .fs-nav-item:hover,
    .fs-nav-item.active {
      background: rgba(212, 191, 142, 0.08);
      border-color: var(--gold-border);
      color: var(--gold-accent);
      transform: translateX(3px);
    }

    .fs-nav-item:hover .fs-item-title,
    .fs-nav-item.active .fs-item-title {
      color: var(--gold-accent);
    }

    .fs-nav-item:hover .fs-chevron,
    .fs-nav-item.active .fs-chevron {
      color: var(--gold-accent);
      transform: translateX(2px);
    }

    .fs-overlay-actions {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }

    .fs-action-web,
    .fs-action-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 1rem;
      font-family: var(--font-heading);
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .fs-overlay-footer {
      text-align: center;
      font-size: 0.72rem;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      padding-top: 0.5rem;
    }

    @media (max-width: 960px) {
      .app-header {
        padding: 0.65rem 1rem;
        gap: 0.75rem;
      }
      .header-nav {
        display: none !important;
      }
      .dashboard-mobile-toggle {
        display: inline-flex !important;
      }
      .logout-text, .web-text {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .app-header {
        padding: 0.5rem 0.65rem;
        gap: 0.5rem;
      }
      .hotel-logo {
        gap: 0.5rem;
      }
      .logo-circle {
        width: 32px;
        height: 32px;
      }
      .brand-name {
        font-size: 0.95rem;
      }
      .header-right {
        gap: 0.4rem;
      }
      .btn-public-web, .btn-logout {
        padding: 0.35rem 0.5rem;
      }
      .user-pill {
        padding: 0.15rem;
        border-radius: var(--radius-full);
      }
      .user-meta {
        display: none;
      }
      .user-avatar {
        width: 28px;
        height: 28px;
        font-size: 0.78rem;
      }
      .dashboard-mobile-toggle {
        padding: 0.35rem 0.45rem;
      }
      .app-main {
        padding: 1.25rem 0.75rem;
      }
    }

    @media (max-width: 400px) {
      .app-header {
        padding: 0.45rem 0.5rem;
        gap: 0.35rem;
      }
      .brand-tag {
        display: none;
      }
      .brand-name {
        font-size: 0.9rem;
        letter-spacing: 0.02em;
      }
      .logo-circle {
        width: 28px;
        height: 28px;
      }
      .header-right {
        gap: 0.3rem;
      }
      .btn-public-web, .btn-logout {
        display: none;
      }
      .dashboard-mobile-toggle {
        padding: 0.35rem 0.4rem;
      }
      .app-main {
        padding: 0.85rem 0.5rem;
      }
    }
  `]
})
export class LayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);

  user = this.authService.currentUser;

  toggleMobileMenu(): void {
    const next = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(next);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = next ? 'hidden' : '';
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

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
