import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

export interface CatalogItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'DOUBLE' | 'TRIPLE' | 'SHARED';
  categoryLabel: string;
  pricePerNight: number;
  priceLabel: string;
  capacity: number;
  capacityLabel: string;
  image: string;
  description: string;
  amenities: string[];
  badges: string[];
  featured?: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="landing-page">
      <!-- =================================================================
           NAVBAR MINIMALISTA CON ACCESO AL DASHBOARD
           ================================================================= -->
      <header class="landing-navbar" [class.scrolled]="isScrolled()">
        <div class="nav-container">
          <!-- Logo & Marca -->
          <a routerLink="/" class="nav-brand">
            <div class="logo-wrapper">
              <img src="assets/logo.png" alt="Hostel Constantino" class="brand-logo" />
            </div>
            <div class="brand-info">
              <span class="brand-title">CONSTANTINO</span>
              <span class="brand-subtitle">HOSTEL BOUTIQUE • 2021</span>
            </div>
          </a>

          <!-- Enlaces de Navegación -->
          <nav class="nav-links">
            <a href="#hero" class="nav-link">Inicio</a>
            <a href="#catalogo" class="nav-link">Habitaciones</a>
            <a routerLink="/catalogo" class="nav-link highlight">Catálogo Completo</a>
            <a href="#experiencia" class="nav-link">Experiencia</a>
            <a href="#servicios" class="nav-link">Servicios</a>
            <a href="#contacto" class="nav-link">Contacto</a>
          </nav>

          <!-- Acciones de Cabecera: Acceso al Dashboard & Botón Reservar -->
          <div class="nav-actions">
            <!-- Icono directo para ingresar al Dashboard / PMS -->
            <a
              routerLink="/dashboard"
              class="dashboard-btn"
              title="Ingresar al Panel de Control / Dashboard PMS"
              aria-label="Acceso al Dashboard PMS"
            >
              <div class="icon-ring">
                <!-- Monochromatic Layout Dashboard SVG Icon -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="9" rx="1"/>
                  <rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/>
                  <rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
              </div>
              <span class="dashboard-text">Dashboard</span>
              <span class="status-indicator"></span>
            </a>

            <!-- Botón CTA Reserva -->
            <button (click)="openQuickBookingModal()" class="btn btn-primary btn-sm cta-book">
              <span>Reservar</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Botón de Menú Móvil / Toggle -->
            <button
              class="mobile-toggle-btn"
              (click)="toggleMobileMenu()"
              [attr.aria-expanded]="mobileMenuOpen()"
              aria-label="Menú de navegación"
            >
              @if (!mobileMenuOpen()) {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Menú Móvil Fullscreen para Pantallas Reducidas -->
        @if (mobileMenuOpen()) {
          <div class="mobile-fullscreen-overlay">
            <div class="fullscreen-nav-header">
              <a routerLink="/" class="fullscreen-brand" (click)="closeMobileMenu()">
                <img src="assets/logo.png" alt="Hostel Constantino" class="fullscreen-logo" />
                <div class="fullscreen-brand-text">
                  <span class="fs-title">CONSTANTINO</span>
                  <span class="fs-subtitle">HOSTEL BOUTIQUE • 2021</span>
                </div>
              </a>
              <button class="fullscreen-close-btn" (click)="closeMobileMenu()" aria-label="Cerrar menú">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="fullscreen-nav-body">
              <nav class="fullscreen-links">
                <a href="#hero" class="fullscreen-link" (click)="closeMobileMenu()">
                  <span class="fs-num">01</span>
                  <span class="fs-text">Inicio</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
                <a href="#catalogo" class="fullscreen-link" (click)="closeMobileMenu()">
                  <span class="fs-num">02</span>
                  <span class="fs-text">Habitaciones & Plazas</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
                <a routerLink="/catalogo" class="fullscreen-link highlight" (click)="closeMobileMenu()">
                  <span class="fs-num">03</span>
                  <span class="fs-text">Catálogo Completo</span>
                  <span class="fs-badge">Oficial</span>
                </a>
                <a href="#experiencia" class="fullscreen-link" (click)="closeMobileMenu()">
                  <span class="fs-num">04</span>
                  <span class="fs-text">Experiencia Boutique</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
                <a href="#servicios" class="fullscreen-link" (click)="closeMobileMenu()">
                  <span class="fs-num">05</span>
                  <span class="fs-text">Servicios & Comodidades</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
                <a href="#contacto" class="fullscreen-link" (click)="closeMobileMenu()">
                  <span class="fs-num">06</span>
                  <span class="fs-text">Ubicación & Contacto</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </a>
              </nav>

              <div class="fullscreen-actions">
                <a routerLink="/dashboard" class="fullscreen-dashboard-btn" (click)="closeMobileMenu()">
                  <div class="fs-dash-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="9" rx="1"/>
                      <rect x="14" y="3" width="7" height="5" rx="1"/>
                      <rect x="14" y="12" width="7" height="9" rx="1"/>
                      <rect x="3" y="16" width="7" height="5" rx="1"/>
                    </svg>
                  </div>
                  <span>Ingresar al Dashboard PMS</span>
                  <span class="status-indicator"></span>
                </a>

                <button (click)="openQuickBookingModal(); closeMobileMenu()" class="btn btn-gold btn-lg btn-full fs-book-btn">
                  <span>Reservar Acomodación Directa</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <div class="fullscreen-footer">
                <span>San Juan, Argentina • Hostel Boutique</span>
              </div>
            </div>
          </div>
        }
      </header>

      <!-- =================================================================
           HERO SECTION: ATMÓSFERA OSCURA BOUTIQUE
           ================================================================= -->
      <section id="hero" class="hero-section">
        <div class="hero-background-overlay"></div>
        <div class="hero-glow hero-glow-1"></div>
        <div class="hero-glow hero-glow-2"></div>

        <div class="hero-content container">
          <div class="hero-tag animate-slide-up">
            <span class="tag-line"></span>
            <span class="tag-text">CONSTANTINO BOUTIQUE HOSPITALITY • EST. 2021</span>
            <span class="tag-line"></span>
          </div>

          <h1 class="hero-title animate-slide-up">
            Elegancia Contemporánea <br />
            <span class="text-gold">& Espíritu Viajero</span>
          </h1>

          <p class="hero-description animate-slide-up">
            Un hostel boutique diseñado con precisión arquitectónica, tonalidades sobrias y privacidad absoluta.
            10 unidades exclusivas y 38 plazas concebidas para el descanso sublime y la conexión cosmopolita.
          </p>

          <!-- Barra de Búsqueda Rápida de Disponibilidad -->
          <div class="booking-query-bar animate-slide-up">
            <div class="query-col">
              <label class="query-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Check-in
              </label>
              <input type="date" [(ngModel)]="searchCheckIn" class="query-input" />
            </div>

            <div class="query-divider"></div>

            <div class="query-col">
              <label class="query-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Check-out
              </label>
              <input type="date" [(ngModel)]="searchCheckOut" class="query-input" />
            </div>

            <div class="query-divider"></div>

            <div class="query-col">
              <label class="query-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7h18M3 12h18M3 17h18"/>
                </svg>
                Acomodación
              </label>
              <select [(ngModel)]="searchCategory" class="query-select">
                <option value="ALL">Todas las opciones</option>
                <option value="DOUBLE">Dobles Privadas (4 unidades)</option>
                <option value="TRIPLE">Triples Familiares (2 unidades)</option>
                <option value="SHARED">Dormitorios Compartidos (4 unidades)</option>
              </select>
            </div>

            <button (click)="applyQuickFilter()" class="btn btn-gold query-btn">
              <span>Explorar Plazas</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          <!-- Métricas de Confianza / Pilares de Marca -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">10</span>
              <span class="stat-label">Unidades Exclusivas</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-number">38</span>
              <span class="stat-label">Plazas Seleccionadas</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-number">300<small>Mbps</small></span>
              <span class="stat-label">Wi-Fi Coworking</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Acceso & Seguridad</span>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================
           CATÁLOGO DE HABITACIONES & SUITES (INTERACTIVO)
           ================================================================= -->
      <section id="catalogo" class="catalog-section">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">COLECCIÓN DE ESPACIOS</div>
            <h2 class="section-title">Acomodaciones de Autor</h2>
            <p class="section-description">
              Diseño sobrio, materiales nobles y climatización individual. Elige entre habitaciones privadas de confort absoluto o dormitorios compartidos de máxima privacidad.
            </p>

            <!-- Filtros de Categoría Monocromáticos -->
            <div class="catalog-filters">
              <button
                class="filter-pill"
                [class.active]="selectedCategory() === 'ALL'"
                (click)="setFilter('ALL')"
              >
                Todas las Unidades (10)
              </button>
              <button
                class="filter-pill"
                [class.active]="selectedCategory() === 'DOUBLE'"
                (click)="setFilter('DOUBLE')"
              >
                Dobles Privadas (4)
              </button>
              <button
                class="filter-pill"
                [class.active]="selectedCategory() === 'TRIPLE'"
                (click)="setFilter('TRIPLE')"
              >
                Triples Privadas (2)
              </button>
              <button
                class="filter-pill"
                [class.active]="selectedCategory() === 'SHARED'"
                (click)="setFilter('SHARED')"
              >
                Compartidas 6 Plazas (4)
              </button>
            </div>
          </div>

          <!-- Grid de Habitaciones del Catálogo -->
          <div class="rooms-grid">
            @for (room of filteredRooms(); track room.id) {
              <div class="room-card" [class.featured]="room.featured">
                <!-- Imagen y Badges -->
                <div class="room-media">
                  <img [src]="room.image" [alt]="room.title" class="room-img" loading="lazy" />
                  <div class="media-overlay"></div>
                  
                  <div class="media-top-tags">
                    <span class="room-badge badge-category">{{ room.categoryLabel }}</span>
                    @if (room.featured) {
                      <span class="room-badge badge-featured">Destacada</span>
                    }
                  </div>

                  <div class="media-price-badge">
                    <span class="price-val">\${{ room.pricePerNight | number:'1.0-0' }}</span>
                    <span class="price-sub">/ {{ room.priceLabel }}</span>
                  </div>
                </div>

                <!-- Detalle de la Habitación -->
                <div class="room-content">
                  <div class="room-header-meta">
                    <span class="room-code">HAB. {{ room.number }}</span>
                    <span class="room-capacity">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {{ room.capacityLabel }}
                    </span>
                  </div>

                  <h3 class="room-title">{{ room.title }}</h3>
                  <p class="room-desc">{{ room.description }}</p>

                  <!-- Amenidades Monocromáticas en Chips -->
                  <div class="amenities-list">
                    @for (amenity of room.amenities; track amenity) {
                      <span class="amenity-chip">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {{ amenity }}
                      </span>
                    }
                  </div>

                  <!-- Acciones de la Tarjeta -->
                  <div class="room-actions">
                    <button (click)="openDetailModal(room)" class="btn btn-outline btn-sm">
                      <span>Ver Detalles</span>
                    </button>
                    <button (click)="openDirectBooking(room)" class="btn btn-primary btn-sm">
                      <span>Reservar</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="catalog-cta-wrap">
            <a routerLink="/catalogo" class="btn btn-outline btn-lg">
              <span>Explorar Todo el Catálogo & Tarifas</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- =================================================================
           EXPERIENCIA BOUTIQUE & SERVICIOS
           ================================================================= -->
      <section id="experiencia" class="experience-section">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">FILOSOFÍA CONSTANTINO</div>
            <h2 class="section-title">El Arte de la Hospitalidad Sobria</h2>
            <p class="section-description">
              Espacios pensados para armonizar la concentración profesional y el encuentro relajado.
            </p>
          </div>

          <div class="features-grid">
            <!-- Feature 1 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h4 class="feature-title">Coworking & Conectividad</h4>
              <p class="feature-text">
                Fibra simétrica de 300 Mbps, mobiliario ergonómico e iluminación neutra para nómadas y profesionales remotos.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h4 class="feature-title">Seguridad & Lockers Digitales</h4>
              <p class="feature-text">
                Control de acceso magnético, lockers individuales de gran tamaño con toma de corriente interna y circuito cerrado.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <h4 class="feature-title">Café de Especialidad & Lounge</h4>
              <p class="feature-text">
                Barra de filtrados y espresso de granos seleccionados. Áreas de lectura, terraza y música de bajo perfil.
              </p>
            </div>

            <!-- Feature 4 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M2 12h20M7 12V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7"/>
                  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
                </svg>
              </div>
              <h4 class="feature-title">Cocina Gourmet Compartida</h4>
              <p class="feature-text">
                Equipamiento integral en acero inoxidable, refrigeración zonificada y vajilla de cerámica artesanal.
              </p>
            </div>

            <!-- Feature 5 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h4 class="feature-title">Sábanas de Algodón Egipcio</h4>
              <p class="feature-text">
                Colchones de alta densidad y blanquería premium de 400 hilos para garantizar un descanso reparador.
              </p>
            </div>

            <!-- Feature 6 -->
            <div class="feature-card">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h4 class="feature-title">Recepción & Concierge 24/7</h4>
              <p class="feature-text">
                Personal capacitado para asistir con itinerarios culturales, reservas gastronómicas y logística local.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================
           UBICACIÓN & CONTACTO
           ================================================================= -->
      <section id="contacto" class="contact-section">
        <div class="container">
          <div class="contact-card">
            <div class="contact-info">
              <div class="section-tag">COORDENADAS</div>
              <h2 class="section-title">Hostel Constantino</h2>
              <p class="contact-desc">
                Ubicado estratégicamente cerca de las principales avenidas, nodos gastronómicos y transporte urbano.
              </p>

              <div class="contact-details">
                <div class="contact-item">
                  <div class="icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Dirección</strong>
                    <span>Calle Constantino 245, Distrito Histórico</span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Recepción & WhatsApp Directo</strong>
                    <span>+54 9 351 789-2021</span>
                  </div>
                </div>

                <div class="contact-item">
                  <div class="icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <strong>Email Oficial</strong>
                    <span>reservas&#64;hostelconstantino.com</span>
                  </div>
                </div>
              </div>

              <div class="contact-actions">
                <button (click)="openQuickBookingModal()" class="btn btn-primary">
                  <span>Consultar Estadía Ahora</span>
                </button>
                <a routerLink="/dashboard" class="btn btn-outline">
                  <span>Acceso PMS Staff</span>
                </a>
              </div>
            </div>

            <!-- Tarjeta visual minimalista del hostel -->
            <div class="contact-visual">
              <div class="visual-badge">
                <img src="assets/logo.png" alt="Sello Constantino" class="badge-emblem" />
                <span class="badge-text">BOUTIQUE 2021</span>
              </div>
              <div class="visual-quote">
                <p>“Un refugio de silencio y diseño en medio de la ciudad.”</p>
                <cite>— Revista de Arquitectura & Hospitalidad</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =================================================================
           FOOTER MINIMALISTA OSCURO
           ================================================================= -->
      <footer class="landing-footer">
        <div class="container footer-content">
          <div class="footer-left">
            <div class="footer-brand">
              <img src="assets/logo.png" alt="Logo Constantino" class="footer-logo" />
              <div class="brand-text">
                <span class="f-brand-name">HOSTEL CONSTANTINO</span>
                <span class="f-brand-sub">Boutique & Hotel PMS • ISPC Brigada Z</span>
              </div>
            </div>
            <p class="footer-copy">
              © 2026 Hostel Constantino Boutique. Todos los derechos reservados.
            </p>
          </div>

          <div class="footer-links">
            <a href="#hero">Inicio</a>
            <a href="#catalogo">Habitaciones</a>
            <a routerLink="/catalogo">Catálogo Completo</a>
            <a href="#experiencia">Servicios</a>
            <a routerLink="/dashboard" class="f-dashboard-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="9" rx="1"/>
                <rect x="14" y="3" width="7" height="5" rx="1"/>
                <rect x="14" y="12" width="7" height="9" rx="1"/>
                <rect x="3" y="16" width="7" height="5" rx="1"/>
              </svg>
              <span>Panel PMS</span>
            </a>
          </div>
        </div>
      </footer>

      <!-- =================================================================
           MODAL DE DETALLE DE HABITACIÓN & CONSULTA DIRECTA
           ================================================================= -->
      @if (activeModalRoom()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content room-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="modal-subtitle">{{ activeModalRoom()?.categoryLabel }} • HABITACIÓN {{ activeModalRoom()?.number }}</span>
                <h3 class="modal-title">{{ activeModalRoom()?.title }}</h3>
              </div>
              <button class="btn-close" (click)="closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="modal-media">
                <img [src]="activeModalRoom()?.image" [alt]="activeModalRoom()?.title" class="modal-img" />
                <div class="modal-price-pill">
                  <strong>\${{ activeModalRoom()?.pricePerNight | number:'1.0-0' }}</strong>
                  <small>/ {{ activeModalRoom()?.priceLabel }}</small>
                </div>
              </div>

              <div class="modal-section">
                <h4 class="modal-sec-title">Descripción</h4>
                <p class="modal-desc">{{ activeModalRoom()?.description }}</p>
              </div>

              <div class="modal-section">
                <h4 class="modal-sec-title">Amenidades & Equipamiento</h4>
                <div class="modal-amenities">
                  @for (item of activeModalRoom()?.amenities; track item) {
                    <div class="modal-amenity-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{{ item }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="modal-section booking-calc-box">
                <h4 class="modal-sec-title">Consultar Disponibilidad Directa</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Check-in</label>
                    <input type="date" [(ngModel)]="modalCheckIn" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Check-out</label>
                    <input type="date" [(ngModel)]="modalCheckOut" class="form-control" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Nombre del Huésped</label>
                  <input type="text" [(ngModel)]="guestName" placeholder="Tu nombre y apellido" class="form-control" />
                </div>

                <button (click)="submitReservationInquiry()" class="btn btn-gold btn-full">
                  <span>Enviar Consulta vía WhatsApp / Directo</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* =================================================================
       LANDING PAGE STYLES - LUXURY DARK MINIMALIST
       ================================================================= */
    .landing-page {
      background: var(--bg-deep);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Navbar */
    .landing-navbar {
      position: sticky;
      top: 0;
      z-index: 200;
      background: rgba(8, 8, 10, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      transition: all var(--transition-smooth);
      padding: 0.75rem 0;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      text-decoration: none;
    }

    .logo-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--border-medium);
      box-shadow: 0 0 15px rgba(212, 191, 142, 0.15);
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform var(--transition-fast), border-color var(--transition-fast);
    }

    .nav-brand:hover .logo-wrapper {
      transform: scale(1.05);
      border-color: var(--gold-accent);
    }

    .brand-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-main);
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      color: var(--gold-accent);
      font-weight: 500;
      text-transform: uppercase;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }

    .nav-link {
      font-family: var(--font-heading);
      font-size: 0.875rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      transition: color var(--transition-fast);
      position: relative;
    }

    .nav-link:hover {
      color: var(--text-main);
    }

    .nav-link.highlight {
      color: var(--gold-accent);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    /* Botón Directo con Icono para ingresar al Dashboard PMS */
    .dashboard-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      font-family: var(--font-heading);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: all var(--transition-fast);
      position: relative;
    }

    .dashboard-btn:hover {
      background: rgba(212, 191, 142, 0.12);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
      box-shadow: 0 0 20px rgba(212, 191, 142, 0.2);
      transform: translateY(-1px);
    }

    .icon-ring {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-accent);
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 6px var(--success);
    }

    .cta-book {
      display: inline-flex;
    }

    .mobile-toggle-btn {
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

    .mobile-toggle-btn:hover {
      background: rgba(212, 191, 142, 0.12);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
    }

    /* Mobile Fullscreen Menu */
    .mobile-fullscreen-overlay {
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

    .fullscreen-nav-header {
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

    .fullscreen-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .fullscreen-logo {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--gold-border);
      object-fit: cover;
    }

    .fullscreen-brand-text {
      display: flex;
      flex-direction: column;
    }

    .fs-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      color: var(--gold-accent);
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .fs-subtitle {
      font-size: 0.62rem;
      color: var(--text-muted);
      letter-spacing: 0.12em;
    }

    .fullscreen-close-btn {
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

    .fullscreen-close-btn:hover {
      background: rgba(212, 191, 142, 0.15);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
      transform: rotate(90deg);
    }

    .fullscreen-nav-body {
      flex: 1;
      padding: 1.75rem 1.5rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 2rem;
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    .fullscreen-links {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .fullscreen-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.95rem 1.15rem;
      border-radius: var(--radius-sm);
      text-decoration: none;
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
      position: relative;
    }

    .fullscreen-link .fs-num {
      font-family: var(--font-mono, monospace);
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .fullscreen-link .fs-text {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 500;
      flex: 1;
    }

    .fullscreen-link svg {
      color: var(--text-muted);
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .fullscreen-link:hover,
    .fullscreen-link.highlight {
      background: rgba(212, 191, 142, 0.08);
      border-color: var(--gold-border);
      color: var(--gold-accent);
      transform: translateX(4px);
    }

    .fullscreen-link:hover .fs-num,
    .fullscreen-link.highlight .fs-num {
      color: var(--gold-accent);
    }

    .fullscreen-link:hover svg {
      color: var(--gold-accent);
      transform: translateX(3px);
    }

    .fs-badge {
      font-size: 0.65rem;
      background: var(--gold-accent);
      color: #000;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .fullscreen-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .fullscreen-dashboard-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-sm);
      background: rgba(212, 191, 142, 0.08);
      border: 1px solid var(--gold-border);
      color: var(--gold-accent);
      font-family: var(--font-heading);
      font-size: 0.88rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .fullscreen-dashboard-btn:hover {
      background: rgba(212, 191, 142, 0.16);
      box-shadow: 0 0 20px rgba(212, 191, 142, 0.15);
    }

    .fs-dash-icon {
      display: flex;
      align-items: center;
      color: var(--gold-accent);
    }

    .fs-book-btn {
      padding: 0.95rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.92rem;
    }

    .fullscreen-footer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      padding-top: 0.5rem;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      padding: 5.5rem 0 4.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      min-height: 82vh;
    }

    .hero-background-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 20%, rgba(26, 28, 36, 0.7) 0%, rgba(6, 6, 8, 0.98) 80%);
      z-index: 1;
    }

    .hero-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      z-index: 1;
    }

    .hero-glow-1 {
      width: 450px;
      height: 450px;
      background: rgba(212, 191, 142, 0.08);
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
    }

    .hero-glow-2 {
      width: 350px;
      height: 350px;
      background: rgba(56, 189, 248, 0.04);
      bottom: 5%;
      right: 15%;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 1050px;
    }

    .hero-tag {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .tag-line {
      width: 32px;
      height: 1px;
      background: var(--gold-border);
    }

    .tag-text {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      color: var(--gold-accent);
      font-weight: 500;
    }

    .hero-title {
      font-size: 3.8rem;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .text-gold {
      color: var(--gold-accent);
      text-shadow: 0 0 30px rgba(212, 191, 142, 0.25);
    }

    .hero-description {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 780px;
      margin-bottom: 3rem;
      line-height: 1.7;
    }

    /* Booking Quick Query Bar */
    .booking-query-bar {
      width: 100%;
      max-width: 950px;
      background: rgba(19, 20, 26, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      padding: 0.875rem 1.25rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3.5rem;
    }

    .query-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .query-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-family: var(--font-heading);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--gold-accent);
      margin-bottom: 0.25rem;
    }

    .query-input, .query-select {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.95rem;
      font-weight: 500;
      outline: none;
      width: 100%;
    }

    .query-select option {
      background: #14151b;
      color: #fff;
    }

    .query-divider {
      width: 1px;
      height: 38px;
      background: var(--border-subtle);
    }

    .query-btn {
      padding: 0.85rem 1.75rem;
      border-radius: var(--radius-md);
      white-space: nowrap;
    }

    /* Hero Stats */
    .hero-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 2rem;
      width: 100%;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1;
    }

    .stat-number small {
      font-size: 1rem;
      color: var(--gold-accent);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 0.25rem;
    }

    .stat-sep {
      width: 1px;
      height: 32px;
      background: var(--border-subtle);
    }

    /* Section Shared */
    .section-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 3.5rem;
    }

    .section-tag {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: var(--gold-accent);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      display: block;
    }

    .section-title {
      font-size: 2.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.15;
    }

    .section-description {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.7;
    }

    /* Catalog Section */
    .catalog-section {
      padding: 6rem 0;
      background: #090a0d;
      border-top: 1px solid var(--border-subtle);
    }

    .catalog-filters {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin-top: 2rem;
    }

    .filter-pill {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.5rem 1.1rem;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-main);
      border-color: var(--border-medium);
    }

    .filter-pill.active {
      background: var(--gold-accent);
      color: var(--text-inverse);
      border-color: var(--gold-accent);
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(212, 191, 142, 0.25);
    }

    /* Rooms Grid */
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
      margin-bottom: 3.5rem;
    }

    .room-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      transition: all var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }

    .room-card:hover {
      transform: translateY(-6px);
      border-color: var(--border-medium);
      box-shadow: var(--shadow-xl), 0 0 30px rgba(212, 191, 142, 0.08);
    }

    .room-card.featured {
      border-color: var(--gold-border);
    }

    .room-media {
      position: relative;
      height: 240px;
      overflow: hidden;
      background: #14151a;
    }

    .room-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .room-card:hover .room-img {
      transform: scale(1.05);
    }

    .media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(14, 15, 20, 0.9) 0%, rgba(14, 15, 20, 0.2) 60%, transparent 100%);
    }

    .media-top-tags {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .room-badge {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-xs);
      backdrop-filter: blur(8px);
      font-weight: 500;
    }

    .badge-category {
      background: rgba(14, 15, 20, 0.8);
      border: 1px solid var(--border-medium);
      color: #fff;
    }

    .badge-featured {
      background: var(--gold-accent);
      color: #000;
      font-weight: 600;
    }

    .media-price-badge {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(14, 15, 20, 0.88);
      backdrop-filter: blur(10px);
      border: 1px solid var(--gold-border);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
    }

    .price-val {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--gold-accent);
    }

    .price-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .room-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .room-header-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .room-code {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      color: var(--gold-accent);
    }

    .room-capacity {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .room-title {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
      line-height: 1.25;
    }

    .room-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .amenities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-bottom: 1.5rem;
      margin-top: auto;
    }

    .amenity-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
    }

    .room-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1.25rem;
    }

    .catalog-cta-wrap {
      text-align: center;
    }

    /* Experience Section */
    .experience-section {
      padding: 6.5rem 0;
      background: var(--bg-deep);
      border-top: 1px solid var(--border-subtle);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      position: relative;
    }

    .feature-card:hover {
      border-color: var(--border-medium);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background: rgba(212, 191, 142, 0.08);
      border: 1px solid var(--gold-border);
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .feature-title {
      font-size: 1.15rem;
      margin-bottom: 0.5rem;
    }

    .feature-text {
      color: var(--text-muted);
      font-size: 0.875rem;
      line-height: 1.6;
    }

    /* Contact Section */
    .contact-section {
      padding: 6rem 0;
      background: #090a0e;
      border-top: 1px solid var(--border-subtle);
    }

    .contact-card {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 3rem;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-xl);
      padding: 3.5rem;
      box-shadow: var(--shadow-xl);
    }

    .contact-desc {
      color: var(--text-muted);
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .icon-box {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--gold-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .contact-item strong {
      display: block;
      font-family: var(--font-heading);
      font-size: 0.82rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-main);
    }

    .contact-item span {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .contact-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .contact-visual {
      background: #050507;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
    }

    .visual-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .badge-emblem {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      border: 1px solid var(--gold-border);
      box-shadow: 0 0 35px rgba(212, 191, 142, 0.2);
    }

    .badge-text {
      font-family: var(--font-heading);
      font-size: 0.78rem;
      letter-spacing: 0.15em;
      color: var(--gold-accent);
    }

    .visual-quote p {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-style: italic;
      color: #e4e4e8;
      margin-bottom: 0.75rem;
    }

    .visual-quote cite {
      font-size: 0.78rem;
      color: var(--text-dim);
      font-style: normal;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* Footer */
    .landing-footer {
      background: #040406;
      border-top: 1px solid var(--border-subtle);
      padding: 3rem 0;
    }

    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .footer-logo {
      width: 38px;
      height: 38px;
      border-radius: 50%;
    }

    .f-brand-name {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      letter-spacing: 0.08em;
      color: var(--text-main);
      display: block;
    }

    .f-brand-sub {
      font-size: 0.7rem;
      color: var(--text-dim);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .footer-copy {
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .footer-links a {
      font-family: var(--font-heading);
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .footer-links a:hover {
      color: var(--gold-accent);
    }

    .f-dashboard-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--gold-accent) !important;
      border: 1px solid var(--gold-border);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
    }

    /* Room Detail Modal */
    .room-modal {
      max-width: 680px;
    }

    .modal-title-wrap {
      display: flex;
      flex-direction: column;
    }

    .modal-subtitle {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      color: var(--gold-accent);
      text-transform: uppercase;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem;
      border-radius: var(--radius-sm);
    }

    .btn-close:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.06);
    }

    .modal-media {
      position: relative;
      height: 260px;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .modal-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-price-pill {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(10, 11, 15, 0.9);
      border: 1px solid var(--gold-border);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .modal-price-pill strong {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      color: var(--gold-accent);
    }

    .modal-price-pill small {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .modal-section {
      margin-bottom: 1.5rem;
    }

    .modal-sec-title {
      font-size: 0.9rem;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
    }

    .modal-desc {
      font-size: 0.92rem;
      color: #d1d1d8;
      line-height: 1.7;
    }

    .modal-amenities {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.65rem;
    }

    .modal-amenity-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .booking-calc-box {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn-full {
      width: 100%;
      margin-top: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 992px) {
      .hero-title { font-size: 2.75rem; }
      .contact-card { grid-template-columns: 1fr; padding: 2rem; }
      .booking-query-bar { flex-direction: column; align-items: stretch; }
      .query-divider { display: none; }
      .nav-links { display: none; }
      .mobile-toggle-btn { display: inline-flex; }
    }

    @media (max-width: 640px) {
      .hero-title { font-size: 2.1rem; }
      .hero-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem 0.75rem;
        width: 100%;
      }
      .stat-sep { display: none; }
      .rooms-grid { grid-template-columns: 1fr; }
      .modal-amenities { grid-template-columns: 1fr; }
      .catalog-filters {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        width: 100%;
      }
      .filter-pill {
        width: 100%;
        text-align: center;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 0.75rem;
        gap: 0.5rem;
      }
      .logo-wrapper {
        width: 36px;
        height: 36px;
      }
      .brand-title {
        font-size: 1.1rem;
      }
      .brand-subtitle {
        font-size: 0.58rem;
        letter-spacing: 0.08em;
      }
      .dashboard-text {
        display: none;
      }
      .dashboard-btn {
        padding: 0.4rem 0.5rem;
      }
      .cta-book {
        padding: 0.4rem 0.65rem;
        font-size: 0.75rem;
      }
      .mobile-toggle-btn {
        padding: 0.4rem 0.5rem;
      }
      .hero-section {
        padding: 4.5rem 0 3rem;
      }
      .hero-title {
        font-size: 1.8rem;
      }
      .contact-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
      .contact-actions .btn {
        width: 100%;
      }
      .footer-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }
      .footer-left {
        align-items: center;
      }
      .footer-brand {
        justify-content: center;
      }
      .footer-links {
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.85rem;
      }
    }

    @media (max-width: 400px) {
      .landing-navbar {
        padding: 0.5rem 0;
      }
      .nav-container {
        padding: 0 0.5rem;
        gap: 0.35rem;
      }
      .nav-brand {
        gap: 0.45rem;
      }
      .logo-wrapper {
        width: 32px;
        height: 32px;
      }
      .brand-title {
        font-size: 0.95rem;
        letter-spacing: 0.04em;
      }
      .brand-subtitle {
        display: none;
      }
      .nav-actions {
        gap: 0.3rem;
      }
      .dashboard-btn {
        padding: 0.35rem 0.45rem;
      }
      .cta-book {
        padding: 0.35rem 0.55rem;
        font-size: 0.72rem;
        gap: 0.25rem;
      }
      .cta-book svg {
        display: none;
      }
      .mobile-toggle-btn {
        padding: 0.35rem 0.45rem;
      }
      .hero-section {
        padding: 3.5rem 0 2rem;
        min-height: auto;
      }
      .hero-title {
        font-size: 1.55rem !important;
        letter-spacing: 0.02em;
        line-height: 1.2;
        word-break: break-word;
      }
      .hero-tag {
        margin-bottom: 1rem;
        gap: 0.5rem;
      }
      .tag-line {
        width: 16px;
      }
      .tag-text {
        font-size: 0.65rem;
        letter-spacing: 0.06em;
      }
      .hero-description {
        font-size: 0.82rem;
        padding: 0 0.25rem;
        margin-bottom: 1.75rem;
      }
      .booking-query-bar {
        padding: 1rem 0.75rem;
        gap: 0.85rem;
      }
      .query-label {
        font-size: 0.75rem;
      }
      .query-input, .query-select {
        padding: 0.55rem 0.7rem;
        font-size: 0.82rem;
      }
      .query-btn {
        padding: 0.65rem 1rem;
        font-size: 0.85rem;
        width: 100%;
      }
      .hero-stats {
        margin-top: 2rem;
      }
      .stat-number {
        font-size: 1.5rem;
      }
      .stat-label {
        font-size: 0.7rem;
      }
      .section-title {
        font-size: 1.4rem;
      }
      .section-description {
        font-size: 0.82rem;
        padding: 0;
      }
      .catalog-filters {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
      .filter-pill {
        font-size: 0.72rem;
        padding: 0.45rem 0.5rem;
      }
      .room-content {
        padding: 1rem 0.85rem;
      }
      .room-title {
        font-size: 1.15rem;
      }
      .room-actions {
        flex-direction: column;
        gap: 0.5rem;
      }
      .room-actions .btn {
        width: 100%;
      }
      .contact-card {
        padding: 1.25rem 0.75rem;
      }
      .contact-item {
        gap: 0.65rem;
      }
      .contact-item strong {
        font-size: 0.82rem;
      }
      .contact-item span {
        font-size: 0.78rem;
      }
      .visual-quote p {
        font-size: 0.85rem;
      }
      .f-brand-name {
        font-size: 1rem;
      }
      .f-brand-sub {
        font-size: 0.65rem;
      }
      .footer-copy {
        font-size: 0.72rem;
      }
      .room-modal {
        padding: 0;
      }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  mobileMenuOpen = signal(false);
  isScrolled = signal(false);
  selectedCategory = signal<'ALL' | 'DOUBLE' | 'TRIPLE' | 'SHARED'>('ALL');
  activeModalRoom = signal<CatalogItem | null>(null);

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

  searchCheckIn: string = '';
  searchCheckOut: string = '';
  searchCategory: string = 'ALL';

  modalCheckIn: string = '';
  modalCheckOut: string = '';
  guestName: string = '';

  // Catálogo oficial de las 10 unidades del Hostel Constantino (38 plazas)
  roomsCatalog: CatalogItem[] = [
    {
      id: '101',
      number: '101',
      title: 'Doble Privada Deluxe',
      subtitle: 'Planta Baja • Cama Matrimonial King',
      category: 'DOUBLE',
      categoryLabel: 'Doble Privada',
      pricePerNight: 45000,
      priceLabel: 'noche (habitación completa)',
      capacity: 2,
      capacityLabel: '2 Huéspedes',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: 'Espacio íntimo con sommier King de alta densidad, baño en suite de mármol, iluminación cálida de autor y escritorio de trabajo.',
      amenities: ['Baño en Suite Privado', 'Smart TV 43"', 'Wi-Fi 300 Mbps', 'Aire Frío/Calor', 'Caja Fuerte Digital', 'Cafetera Nespresso'],
      badges: ['Exclusiva', 'En Suite'],
      featured: true
    },
    {
      id: '102',
      number: '102',
      title: 'Doble Twin Estándar',
      subtitle: 'Planta Baja • Dos Camas Sommier Individuales',
      category: 'DOUBLE',
      categoryLabel: 'Doble Privada',
      pricePerNight: 45000,
      priceLabel: 'noche (habitación completa)',
      capacity: 2,
      capacityLabel: '2 Huéspedes',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      description: 'Ideal para colegas y amigos. Dos sommiers individuales, amplios placares empotrados, climatización inverter y doble acristalamiento.',
      amenities: ['Dos Camas Individuales', 'Baño Privado', 'Wi-Fi Fibra Óptica', 'Aire Inverter', 'Escritorio Funcional', 'Secador de Pelo'],
      badges: ['Confort']
    },
    {
      id: '103',
      number: '103',
      title: 'Doble Matrimonial Balcón',
      subtitle: 'Planta Baja • Terraza Privada',
      category: 'DOUBLE',
      categoryLabel: 'Doble Privada',
      pricePerNight: 48000,
      priceLabel: 'noche (habitación completa)',
      capacity: 2,
      capacityLabel: '2 Huéspedes',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      description: 'Nuestra suite doble más luminosa con acceso a terraza arbolada privada. Cama King sommier, frigobar y ducha escocesa.',
      amenities: ['Balcón / Terraza Privada', 'Frigobar Silencioso', 'Ducha Escocesa', 'Cama King Size', 'Smart TV 50"', 'Ropa de Cama 400 Hilos'],
      badges: ['Balcón Privado', 'Top Rated'],
      featured: true
    },
    {
      id: '104',
      number: '104',
      title: 'Doble Twin Serena',
      subtitle: 'Planta Baja • Silencio Absoluto',
      category: 'DOUBLE',
      categoryLabel: 'Doble Privada',
      pricePerNight: 45000,
      priceLabel: 'noche (habitación completa)',
      capacity: 2,
      capacityLabel: '2 Huéspedes',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      description: 'Orientada hacia el patio interior de lectura, ofrece máxima calma y aislamiento acústico para un descanso ininterrumpido.',
      amenities: ['Aislamiento Acústico', 'Baño en Suite', 'Wi-Fi 300 Mbps', 'Climatización Individual', 'Luz de Lectura LED'],
      badges: ['Ultra Silenciosa']
    },
    {
      id: '201',
      number: '201',
      title: 'Triple Familiar',
      subtitle: 'Primer Piso • Cama Matrimonial + Sommier Single',
      category: 'TRIPLE',
      categoryLabel: 'Triple Privada',
      pricePerNight: 60000,
      priceLabel: 'noche (habitación completa)',
      capacity: 3,
      capacityLabel: '3 Huéspedes',
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      description: 'Amplia habitación configurada con una cama matrimonial y una individual. Excelente iluminación natural y baño amplio.',
      amenities: ['1 Matrimonial + 1 Individual', 'Baño Privado Amplio', 'Frigobar', 'Espacio para Equipaje', 'Smart TV 43"', 'Calefacción & A/A'],
      badges: ['Familiar', '3 Plazas']
    },
    {
      id: '202',
      number: '202',
      title: 'Triple Tres Camas Individuales',
      subtitle: 'Primer Piso • Tres Sommiers Singles',
      category: 'TRIPLE',
      categoryLabel: 'Triple Privada',
      pricePerNight: 60000,
      priceLabel: 'noche (habitación completa)',
      capacity: 3,
      capacityLabel: '3 Huéspedes',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      description: 'Diseñada para grupos reducidos o amigos viajeros. Tres camas individuales independientes con enchufes dedicados y lockers.',
      amenities: ['3 Camas Individuales', 'Baño en Suite', 'Lockers Individuales', 'Aire Frío/Calor', 'Wi-Fi Simétrico'],
      badges: ['Grupo Amigos']
    },
    {
      id: '301',
      number: '301',
      title: 'Compartida Mixta A (6 Plazas)',
      subtitle: 'Segundo Piso • 3 Cuchetas Ergonómicas de Madera',
      category: 'SHARED',
      categoryLabel: 'Dormitorio Compartido',
      pricePerNight: 18000,
      priceLabel: 'cama / noche',
      capacity: 6,
      capacityLabel: '6 Plazas Totales',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      description: 'Cuchetas de madera maciza diseñadas a medida sin chirridos. Cada cama cuenta con cortina blackout de privacidad, luz de lectura, enchufe y locker digital.',
      amenities: ['Cortina Blackout por Cama', 'Locker Individual con Tarjeta', 'Toma 220V + USB en Cama', 'Luz de Lectura', 'Baño Compartido Zonificado', 'Ropa de Cama Incluida'],
      badges: ['Privacidad en Dorm', '6 Plazas'],
      featured: true
    },
    {
      id: '302',
      number: '302',
      title: 'Compartida Mixta B (6 Plazas)',
      subtitle: 'Segundo Piso • Ambiente Coworking Integrado',
      category: 'SHARED',
      categoryLabel: 'Dormitorio Compartido',
      pricePerNight: 18000,
      priceLabel: 'cama / noche',
      capacity: 6,
      capacityLabel: '6 Plazas Totales',
      image: 'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?auto=format&fit=crop&w=800&q=80',
      description: '6 plazas mixtas de descanso con lockers XXL para mochilas de expedición y valijas rígidas. Ventanales con luz natural suave.',
      amenities: ['Lockers XXL', 'Cortinas Blackout', 'Climatización Central Silenciosa', 'Conexión USB-C', 'Limpieza Diaria Profunda'],
      badges: ['Mixta', '6 Plazas']
    },
    {
      id: '303',
      number: '303',
      title: 'Compartida Exclusiva Femenina (6 Plazas)',
      subtitle: 'Segundo Piso • Dormitorio Solo Mujeres',
      category: 'SHARED',
      categoryLabel: 'Dormitorio Femenino',
      pricePerNight: 18000,
      priceLabel: 'cama / noche',
      capacity: 6,
      capacityLabel: '6 Plazas Femeninas',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      description: 'Espacio concebido exclusivamente para viajeras solas o en grupo. Espejos de cuerpo entero, tocador con iluminación suave, secador de pelo y máxima privacidad.',
      amenities: ['Solo Mujeres', 'Tocador con Espejo Hollywood', 'Secador y Planchita de Pelo', 'Cortinas de Máxima Privacidad', 'Lockers de Seguridad'],
      badges: ['Exclusivo Mujeres', 'Boutique Dorm'],
      featured: true
    },
    {
      id: '304',
      number: '304',
      title: 'Compartida Masculina (6 Plazas)',
      subtitle: 'Segundo Piso • Dormitorio Solo Hombres',
      category: 'SHARED',
      categoryLabel: 'Dormitorio Masculino',
      pricePerNight: 18000,
      priceLabel: 'cama / noche',
      capacity: 6,
      capacityLabel: '6 Plazas Masculinas',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      description: 'Dormitorio masculino confortable con estructura reforzada de cuchetas, lockers amplios y baño sectorizado con múltiples duchas.',
      amenities: ['Solo Hombres', 'Cuchetas Reforzadas', 'Lockers Individuales', 'Climatización Frío/Calor', 'Enchufes Dedicados'],
      badges: ['Exclusivo Hombres']
    }
  ];

  filteredRooms() {
    const cat = this.selectedCategory();
    if (cat === 'ALL') return this.roomsCatalog;
    return this.roomsCatalog.filter(r => r.category === cat);
  }

  setFilter(category: 'ALL' | 'DOUBLE' | 'TRIPLE' | 'SHARED') {
    this.selectedCategory.set(category);
  }

  applyQuickFilter() {
    if (this.searchCategory !== 'ALL') {
      this.selectedCategory.set(this.searchCategory as any);
    }
    const elem = document.getElementById('catalogo');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openDetailModal(room: CatalogItem) {
    this.activeModalRoom.set(room);
    this.modalCheckIn = this.searchCheckIn || new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.modalCheckOut = this.searchCheckOut || tomorrow.toISOString().split('T')[0];
  }

  openDirectBooking(room: CatalogItem) {
    this.openDetailModal(room);
  }

  openQuickBookingModal() {
    this.openDetailModal(this.roomsCatalog[0]);
  }

  closeModal() {
    this.activeModalRoom.set(null);
  }

  submitReservationInquiry() {
    const room = this.activeModalRoom();
    if (!room) return;

    const text = `Hola Hostel Constantino! Quisiera consultar disponibilidad y reservar en ${room.title} (Hab ${room.number}) para las fechas ${this.modalCheckIn || 'A coordinar'} hasta ${this.modalCheckOut || 'A coordinar'}. Nombre: ${this.guestName || 'Huésped'}. Muchas gracias!`;
    const whatsappUrl = `https://wa.me/5493517892021?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    this.closeModal();
  }
}
