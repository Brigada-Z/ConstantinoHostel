import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmsService } from '../../core/services/pms.service';
import { Guest, DocumentType } from '../../core/models/pms.models';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="guests-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Directorio de Huéspedes</h1>
          <p class="page-subtitle">Registro filiatorio, validación de DNI/Pasaporte y búsquedas dinámicas</p>
        </div>
        <button (click)="openCreateModal()" class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Registrar Huésped</span>
        </button>
      </div>

      <!-- Búsqueda en Tiempo Real -->
      <div class="search-card">
        <div class="search-input-wrapper">
          <span class="search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            class="form-control"
            placeholder="Buscar por nombre, apellido, DNI, pasaporte, correo o teléfono..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
      </div>

      <!-- Tabla de Huéspedes -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando huéspedes...</p>
        </div>
      } @else {
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Huésped</th>
                <th>Tipo Doc.</th>
                <th>Número Documento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Nacionalidad</th>
                <th>Fecha de Alta</th>
              </tr>
            </thead>
            <tbody>
              @for (guest of guests(); track guest.id) {
                <tr>
                  <td>
                    <strong>{{ guest.full_name }}</strong>
                  </td>
                  <td>
                    <span class="doc-badge">{{ guest.document_type_display || guest.document_type }}</span>
                  </td>
                  <td>
                    <span class="doc-number">{{ guest.document_number }}</span>
                  </td>
                  <td>{{ guest.phone }}</td>
                  <td>{{ guest.email || '-' }}</td>
                  <td>{{ guest.nationality }}</td>
                  <td>{{ guest.created_at | date:'shortDate' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    No se encontraron huéspedes con el término de búsqueda ingresado.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal de Registro de Huésped -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Ficha de Huésped</h2>
              <button class="btn-close" (click)="closeModal()">✕</button>
            </div>

            <form (ngSubmit)="submitGuest()" class="modal-body">
              @if (errorMessage()) {
                <div class="alert-error">{{ errorMessage() }}</div>
              }

              <div class="grid grid-cols-2 gap-3">
                <div class="form-group">
                  <label class="form-label">Nombre *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.first_name"
                    name="first_name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Apellido *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.last_name"
                    name="last_name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Tipo de Documento</label>
                  <select
                    class="form-control"
                    [(ngModel)]="formData.document_type"
                    name="document_type"
                  >
                    <option value="DNI">DNI (Documento Nacional)</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Número de Documento *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.document_number"
                    name="document_number"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Teléfono *</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.phone"
                    name="phone"
                    required
                    placeholder="+54 9 351..."
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="formData.email"
                    name="email"
                  />
                </div>

                <div class="form-group" style="grid-column: span 2;">
                  <label class="form-label">Nacionalidad</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="formData.nationality"
                    name="nationality"
                  />
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="submitting()">
                  Guardar Huésped
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .guests-page {
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

    .search-card {
      background: white;
      border: 1px solid #E2E8F0;
      border-radius: 0.75rem;
      padding: 1rem;
    }

    .search-input-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94A3B8;
    }

    .search-input-wrapper input {
      padding-left: 2.25rem;
    }

    .doc-badge {
      background: #F1F5F9;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .doc-number {
      font-family: monospace;
      font-weight: 700;
      color: #0F172A;
    }

    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #94A3B8;
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
      color: #64748B;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .alert-error {
      background: #FEE2E2;
      border: 1px solid #FECACA;
      color: #B91C1C;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
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
export class GuestsComponent implements OnInit {
  private pmsService = inject(PmsService);

  guests = signal<Guest[]>([]);
  loading = signal(true);
  searchQuery = '';
  showModal = signal(false);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  formData: Partial<Guest> = {
    first_name: '',
    last_name: '',
    document_type: 'DNI',
    document_number: '',
    phone: '',
    email: '',
    nationality: 'Argentina'
  };

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.loading.set(true);
    this.pmsService.getGuests(this.searchQuery).subscribe({
      next: (data) => {
        this.guests.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    this.loadGuests();
  }

  openCreateModal(): void {
    this.errorMessage.set(null);
    this.formData = {
      first_name: '',
      last_name: '',
      document_type: 'DNI',
      document_number: '',
      phone: '',
      email: '',
      nationality: 'Argentina'
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitGuest(): void {
    if (!this.formData.first_name || !this.formData.last_name || !this.formData.document_number || !this.formData.phone) {
      this.errorMessage.set('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.pmsService.createGuest(this.formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadGuests();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err.error?.document_number?.[0] || 'Error al guardar huésped.');
      }
    });
  }
}
