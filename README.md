# Hostel Constantino • PMS & Boutique Web

Sistema integral de gestión hotelera (PMS) y plataforma web boutique para **Hostel Constantino** (10 habitaciones, 38 plazas).
Desarrollado para el Instituto Superior Politécnico Córdoba (ISPC) por el equipo de **Brigada Z**.

---

## 🌟 Características Principales

### 🏨 Portal Público & Catálogo Boutique
- **Landing Page de Autor:** Diseño minimalista en paleta oscura con tipografía **Oswald**, acentos champagne/dorado y animaciones fluidas.
- **Catálogo de Acomodaciones:** Showcase de las 10 unidades habitacionales (Dobles Privadas Deluxe, Triples Familiares y Dormitorios Compartidos de 6 plazas).
- **Acceso Directo al Dashboard:** Icono integrado en la barra de navegación para acceso inmediato del staff al sistema PMS.
- **Cotizador & Reservas Directas:** Validación de estadías y contacto directo vía WhatsApp sin comisiones intermediarias.

### 📊 Sistema PMS (Property Management System)
- **Dashboard Operativo:** Métricas en tiempo real de ocupación, check-ins, check-outs y unidades sucias con iconografía 100% vectorial monocromática.
- **Rack Matricial de Ocupación:** Visualización de plazas en matriz interactiva de 7, 14 o 30 días con estados por código de color.
- **Control Anti-Overbooking:** Algoritmo transaccional en backend con bloqueo preventivo y validación estricta de solapamiento de fechas.
- **Operatividad Móvil de Limpieza:** Módulo mobile-first para camareras y personal de aseo con actualización en un toque (Limpia, Limpiando, Sucia, Mantenimiento).
- **Directorio de Huéspedes:** Búsqueda en tiempo real por DNI, Pasaporte o datos filiatorios.
- **Auditoría & Trazabilidad:** Bitácora inmutable de acciones críticas con usuario responsable y marca temporal.
- **Control de Acceso Basado en Roles (RBAC):** Perfiles diferenciados para Administrador (`victor`), Recepción (`recepcion`) y Limpieza (`limpieza`).

---

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 21 (Standalone Components, Signals, Router, Oswald & Plus Jakarta Sans typography, Vanilla CSS Design System).
- **Backend:** Django 5 & Django REST Framework (DRF), JWT Authentication (`djangorestframework-simplejwt`), CORS Headers.
- **Base de Datos:** SQLite con transacciones ACID e integridad relacional.

---

## 🚀 Puesta en Marcha Local

### 1. Backend (Django)
```bash
cd BackEnd
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # o django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py seed_data  # Carga las 10 unidades, 38 plazas y usuarios demo
python manage.py runserver 8000
```

### 2. Frontend (Angular)
```bash
cd FrontEnd
npm install
npm start # o ng serve
```
Abrir navegador en `http://localhost:4200/`.

---

## 👥 Credenciales de Demostración (RBAC)

| Usuario | Contraseña | Rol | Accesos |
|---|---|---|---|
| `victor` | `admin123` | Administrador / Gerente | Acceso total, Auditoría y Configuración |
| `recepcion` | `recepcion123` | Recepcionista | Rack, Reservas, Huéspedes y Dashboard |
| `limpieza` | `limpieza123` | Personal de Limpieza | Módulo móvil de aseo y estados físicos |

---

© 2026 Hostel Constantino Boutique • ISPC Brigada Z
