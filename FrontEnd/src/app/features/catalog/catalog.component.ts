import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogItem } from '../landing/landing.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="catalog-page">
      <!-- Navbar Minimalista Superior -->
      <header class="catalog-nav">
        <div class="nav-container">
          <a routerLink="/" class="nav-brand">
            <div class="logo-wrapper">
              <img src="assets/logo.png" alt="Logo Hostel Constantino" class="brand-logo" />
            </div>
            <div class="brand-info">
              <span class="brand-title">CONSTANTINO</span>
              <span class="brand-subtitle">CATÁLOGO OFICIAL DE PLAZAS</span>
            </div>
          </a>

          <div class="nav-actions">
            <a routerLink="/" class="btn btn-outline btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              <span>Volver a la Web</span>
            </a>

            <!-- Icono directo para ingresar al Dashboard -->
            <a routerLink="/dashboard" class="dashboard-btn" title="Ingresar al Dashboard PMS">
              <div class="icon-ring">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="9" rx="1"/>
                  <rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/>
                  <rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
              </div>
              <span class="dashboard-text">Dashboard</span>
              <span class="status-indicator"></span>
            </a>
          </div>
        </div>
      </header>

      <!-- Banner de Cabecera del Catálogo -->
      <section class="catalog-hero">
        <div class="container">
          <div class="hero-tag">CATÁLOGO COMPLETO • TEMPORADA 2026</div>
          <h1 class="hero-title">Espacios Diseñados al Milímetro</h1>
          <p class="hero-sub">
            Explora las 10 unidades exclusivas y 38 plazas del Hostel Constantino. Tarifas oficiales transparentes, equipamiento detallado y reservas directas sin comisiones intermediarias.
          </p>

          <!-- Barra de Filtros y Ordenamiento -->
          <div class="filter-controls-bar">
            <!-- Selector de Categoría -->
            <div class="control-group">
              <label class="control-label">Acomodación</label>
              <select [(ngModel)]="categoryFilter" (change)="applyFilters()" class="control-select">
                <option value="ALL">Todas las Categorías (10)</option>
                <option value="DOUBLE">Dobles Privadas (4)</option>
                <option value="TRIPLE">Triples Familiares (2)</option>
                <option value="SHARED">Dormitorios Compartidos (4)</option>
              </select>
            </div>

            <!-- Selector de Piso -->
            <div class="control-group">
              <label class="control-label">Nivel / Planta</label>
              <select [(ngModel)]="floorFilter" (change)="applyFilters()" class="control-select">
                <option value="ALL">Todos los Niveles</option>
                <option value="PB">Planta Baja (Hab 101 - 104)</option>
                <option value="1">Piso 1 (Hab 201 - 202)</option>
                <option value="2">Piso 2 (Hab 301 - 304)</option>
              </select>
            </div>

            <!-- Ordenamiento de Precio -->
            <div class="control-group">
              <label class="control-label">Tarifa</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="control-select">
                <option value="default">Orden Habitual</option>
                <option value="price-asc">Menor Tarifa Primero</option>
                <option value="price-desc">Mayor Tarifa Primero</option>
                <option value="capacity-desc">Mayor Capacidad</option>
              </select>
            </div>

            <!-- Resumen de Resultados -->
            <div class="results-badge">
              <strong>{{ displayedRooms().length }}</strong>
              <span>unidades encontradas</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Listado Principal del Catálogo -->
      <main class="catalog-main container">
        <div class="cards-grid">
          @for (room of displayedRooms(); track room.id) {
            <article class="catalog-card">
              <div class="card-image-box">
                <img [src]="room.image" [alt]="room.title" class="card-img" />
                <div class="img-badge-overlay">
                  <span class="badge-tag">{{ room.categoryLabel }}</span>
                  <span class="badge-num">Hab {{ room.number }}</span>
                </div>
                <div class="price-overlay">
                  <span class="price-val">\${{ room.pricePerNight | number:'1.0-0' }}</span>
                  <span class="price-suf">/ {{ room.priceLabel }}</span>
                </div>
              </div>

              <div class="card-details">
                <div class="card-top">
                  <span class="sub-floor">{{ room.subtitle }}</span>
                  <h3 class="room-heading">{{ room.title }}</h3>
                  <p class="room-desc">{{ room.description }}</p>
                </div>

                <!-- Desglose de Plazas y Camas -->
                <div class="beds-spec-box">
                  <div class="spec-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span>Capacidad: <strong>{{ room.capacityLabel }}</strong></span>
                  </div>
                  <div class="spec-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <span>Seguridad: <strong>Lockers con tarjeta</strong></span>
                  </div>
                </div>

                <!-- Chips de Amenidades -->
                <div class="amenity-chips">
                  @for (amenity of room.amenities; track amenity) {
                    <span class="chip">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {{ amenity }}
                    </span>
                  }
                </div>

                <!-- Acciones -->
                <div class="card-footer-actions">
                  <button (click)="openDetail(room)" class="btn btn-outline btn-sm">
                    <span>Ficha Completa</span>
                  </button>
                  <button (click)="openBooking(room)" class="btn btn-primary btn-sm">
                    <span>Consultar Fechas</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          }
        </div>
      </main>

      <!-- Modal de Detalle Completo -->
      @if (selectedRoom()) {
        <div class="modal-overlay" (click)="closeDetail()">
          <div class="modal-content modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <span class="sub-floor">HABITACIÓN {{ selectedRoom()?.number }} • {{ selectedRoom()?.categoryLabel }}</span>
                <h3 class="modal-title">{{ selectedRoom()?.title }}</h3>
              </div>
              <button class="btn-close" (click)="closeDetail()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="modal-hero-img">
                <img [src]="selectedRoom()?.image" [alt]="selectedRoom()?.title" />
                <div class="modal-tag-price">
                  <span>\${{ selectedRoom()?.pricePerNight | number:'1.0-0' }}</span>
                  <small>/ {{ selectedRoom()?.priceLabel }}</small>
                </div>
              </div>

              <div class="modal-info-grid">
                <div>
                  <h4 class="info-title">Detalle Arquitectónico</h4>
                  <p class="info-p">{{ selectedRoom()?.description }}</p>

                  <h4 class="info-title mt-4">Políticas & Servicios Incluidos</h4>
                  <ul class="policies-list">
                    <li>Check-in a partir de las 14:00 hs / Check-out hasta las 11:00 hs.</li>
                    <li>Ropa de cama y toallas de algodón egipcio incluidas en la tarifa.</li>
                    <li>Desayuno artesanal y café de especialidad de 07:30 a 10:30 hs.</li>
                    <li>Guarda equipaje disponible sin cargo pre y post estadía.</li>
                    <li>Wi-Fi simétrico de alta velocidad en toda la propiedad.</li>
                  </ul>
                </div>

                <div class="booking-inquiry-box">
                  <h4 class="info-title">Cotizar Estadía Directa</h4>
                  <div class="form-group">
                    <label class="form-label">Fecha de Llegada</label>
                    <input type="date" [(ngModel)]="inquiryIn" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Fecha de Salida</label>
                    <input type="date" [(ngModel)]="inquiryOut" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nombre del Titular</label>
                    <input type="text" [(ngModel)]="inquiryName" placeholder="Tu nombre y apellido" class="form-control" />
                  </div>

                  <button (click)="sendWhatsAppInquiry()" class="btn btn-gold btn-full mt-3">
                    <span>Contactar Recepción por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog-page {
      background: var(--bg-deep);
      min-height: 100vh;
      color: var(--text-main);
      padding-bottom: 5rem;
    }

    .catalog-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(8, 8, 10, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0.85rem 0;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .logo-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid var(--border-medium);
      background: #000;
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
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-main);
    }

    .brand-subtitle {
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      color: var(--gold-accent);
      text-transform: uppercase;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Icono de acceso al dashboard */
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
    }

    .dashboard-btn:hover {
      background: rgba(212, 191, 142, 0.12);
      border-color: var(--gold-accent);
      color: var(--gold-accent);
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

    /* Catalog Hero */
    .catalog-hero {
      padding: 4.5rem 0 3rem;
      background: radial-gradient(circle at 50% 0%, rgba(212, 191, 142, 0.06) 0%, transparent 60%);
      border-bottom: 1px solid var(--border-subtle);
    }

    .hero-tag {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: var(--gold-accent);
      margin-bottom: 0.5rem;
    }

    .hero-title {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hero-sub {
      color: var(--text-muted);
      max-width: 800px;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }

    /* Filter Bar */
    .filter-controls-bar {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 180px;
    }

    .control-label {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--gold-accent);
    }

    .control-select {
      background: #0d0e12;
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      outline: none;
    }

    .control-select:focus {
      border-color: var(--gold-accent);
    }

    .results-badge {
      margin-left: auto;
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .results-badge strong {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      color: var(--gold-accent);
    }

    /* Cards Grid */
    .catalog-main {
      padding-top: 3.5rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2rem;
    }

    .catalog-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      transition: all var(--transition-fast);
    }

    .catalog-card:hover {
      border-color: var(--border-medium);
      transform: translateY(-5px);
      box-shadow: var(--shadow-xl);
    }

    .card-image-box {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: #111216;
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    .catalog-card:hover .card-img {
      transform: scale(1.05);
    }

    .img-badge-overlay {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .badge-tag, .badge-num {
      background: rgba(8, 8, 10, 0.85);
      border: 1px solid var(--border-medium);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
      font-family: var(--font-heading);
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #fff;
    }

    .badge-num {
      border-color: var(--gold-border);
      color: var(--gold-accent);
    }

    .price-overlay {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(10, 11, 15, 0.9);
      border: 1px solid var(--gold-border);
      padding: 0.35rem 0.75rem;
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

    .price-suf {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .card-details {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .sub-floor {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      color: var(--gold-accent);
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.25rem;
    }

    .room-heading {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }

    .room-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    .beds-spec-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.65rem 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .spec-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .spec-item strong {
      color: var(--text-main);
    }

    .amenity-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1.5rem;
      margin-top: auto;
    }

    .chip {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
      font-size: 0.72rem;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .card-footer-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 1rem;
    }

    /* Modal */
    .modal-large {
      max-width: 800px;
    }

    .modal-hero-img {
      position: relative;
      height: 280px;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .modal-hero-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-tag-price {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(10, 11, 15, 0.92);
      border: 1px solid var(--gold-border);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
    }

    .modal-tag-price span {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gold-accent);
    }

    .modal-info-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
    }

    .info-title {
      font-size: 0.95rem;
      letter-spacing: 0.06em;
      color: var(--gold-accent);
      margin-bottom: 0.5rem;
    }

    .info-p {
      font-size: 0.9rem;
      color: #d1d1d8;
      line-height: 1.6;
    }

    .mt-4 { margin-top: 1.25rem; }

    .policies-list {
      list-style: square;
      padding-left: 1.25rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .booking-inquiry-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem;
      border-radius: var(--radius-sm);
    }

    .btn-close:hover {
      color: #fff;
    }

    .btn-full {
      width: 100%;
    }

    .mt-3 {
      margin-top: 0.75rem;
    }

    @media (max-width: 768px) {
      .modal-info-grid { grid-template-columns: 1fr; }
      .filter-controls-bar { flex-direction: column; align-items: stretch; }
      .results-badge { margin-left: 0; }
    }
  `]
})
export class CatalogComponent {
  categoryFilter = 'ALL';
  floorFilter = 'ALL';
  sortBy = 'default';

  selectedRoom = signal<CatalogItem | null>(null);

  inquiryIn = '';
  inquiryOut = '';
  inquiryName = '';

  allRooms: CatalogItem[] = [
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

  displayedRooms = signal<CatalogItem[]>(this.allRooms);

  applyFilters() {
    let result = [...this.allRooms];

    if (this.categoryFilter !== 'ALL') {
      result = result.filter(r => r.category === this.categoryFilter);
    }

    if (this.floorFilter !== 'ALL') {
      if (this.floorFilter === 'PB') {
        result = result.filter(r => r.number.startsWith('10'));
      } else if (this.floorFilter === '1') {
        result = result.filter(r => r.number.startsWith('20'));
      } else if (this.floorFilter === '2') {
        result = result.filter(r => r.number.startsWith('30'));
      }
    }

    if (this.sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (this.sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (this.sortBy === 'capacity-desc') {
      result.sort((a, b) => b.capacity - a.capacity);
    }

    this.displayedRooms.set(result);
  }

  openDetail(room: CatalogItem) {
    this.selectedRoom.set(room);
  }

  openBooking(room: CatalogItem) {
    this.openDetail(room);
  }

  closeDetail() {
    this.selectedRoom.set(null);
  }

  sendWhatsAppInquiry() {
    const room = this.selectedRoom();
    if (!room) return;
    const msg = `Hola Hostel Constantino! Quisiera consultar la tarifa y disponibilidad en ${room.title} (Habitación ${room.number}) desde ${this.inquiryIn || 'A definir'} hasta ${this.inquiryOut || 'A definir'}. Nombre: ${this.inquiryName || 'Huésped'}.`;
    const url = `https://wa.me/5493517892021?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}
