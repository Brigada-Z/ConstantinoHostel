import datetime
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from pms.models import (
    Room, Bed, Guest, Reservation, MaintenanceBlock,
    ReservationStatus, PhysicalStatus, RoomType, BedType, UserRole
)

User = get_user_model()

class PMSTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Usuarios
        self.admin = User.objects.create_user(
            username='admin_test', password='password123',
            role=UserRole.ADMIN, email='admin@test.com'
        )
        self.recepcion = User.objects.create_user(
            username='recep_test', password='password123',
            role=UserRole.RECEPCION, email='recep@test.com'
        )
        self.limpieza = User.objects.create_user(
            username='limp_test', password='password123',
            role=UserRole.LIMPIEZA, email='limp@test.com'
        )

        # Habitación y Cama
        self.room_shared = Room.objects.create(
            number='301', name='Compartida 6 Plazas', room_type=RoomType.SHARED_DORM,
            capacity=6, floor=3, base_price_per_night=108000, physical_status=PhysicalStatus.CLEAN
        )
        self.bed1 = Bed.objects.create(
            room=self.room_shared, number='Cama 1', bed_type=BedType.BUNK_TOP,
            price_per_night=18000, physical_status=PhysicalStatus.CLEAN
        )
        self.bed2 = Bed.objects.create(
            room=self.room_shared, number='Cama 2', bed_type=BedType.BUNK_BOTTOM,
            price_per_night=18000, physical_status=PhysicalStatus.CLEAN
        )

        # Huéspedes
        self.guest1 = Guest.objects.create(
            first_name='Juan', last_name='Pérez', document_number='12345678',
            email='juan@test.com', phone='351111111'
        )
        self.guest2 = Guest.objects.create(
            first_name='Ana', last_name='López', document_number='87654321',
            email='ana@test.com', phone='351222222'
        )

    def test_anti_overbooking_validation(self):
        """Valida que DRF impida reservar la misma cama en fechas superpuestas."""
        self.client.force_authenticate(user=self.recepcion)

        today = timezone.localdate()
        # 1. Crear primera reserva para bed1: hoy al hoy+3
        res1_data = {
            'guest_id': self.guest1.id,
            'bed_ids': [self.bed1.id],
            'check_in_date': today.isoformat(),
            'check_out_date': (today + datetime.timedelta(days=3)).isoformat(),
            'status': ReservationStatus.CONFIRMADA,
            'total_amount': 54000.00,
            'deposit_paid': 27000.00
        }
        res1 = self.client.post('/api/reservations/', res1_data, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # 2. Intentar superponer reserva en bed1: hoy+1 al hoy+4
        conflict_data = {
            'guest_id': self.guest2.id,
            'bed_ids': [self.bed1.id],
            'check_in_date': (today + datetime.timedelta(days=1)).isoformat(),
            'check_out_date': (today + datetime.timedelta(days=4)).isoformat(),
            'status': ReservationStatus.PENDIENTE_SENA,
            'total_amount': 54000.00,
            'deposit_paid': 0.00
        }
        res2 = self.client.post('/api/reservations/', conflict_data, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('SUPERPOSICIÓN DETECTADA', str(res2.data))

        # 3. Reservar bed2 (otra cama distinta en misma fecha) DEBE ser exitoso
        success_data = {
            'guest_id': self.guest2.id,
            'bed_ids': [self.bed2.id],
            'check_in_date': (today + datetime.timedelta(days=1)).isoformat(),
            'check_out_date': (today + datetime.timedelta(days=4)).isoformat(),
            'status': ReservationStatus.CONFIRMADA,
            'total_amount': 54000.00,
            'deposit_paid': 27000.00
        }
        res3 = self.client.post('/api/reservations/', success_data, format='json')
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)

    def test_traceable_cancellation_no_hard_delete(self):
        """Valida que las reservas no se eliminan físicamente sino que se cancelan con auditoría."""
        self.client.force_authenticate(user=self.recepcion)
        today = timezone.localdate()

        res = Reservation.objects.create(
            code='HC-TEST-001', guest=self.guest1,
            check_in_date=today, check_out_date=today + datetime.timedelta(days=2),
            status=ReservationStatus.CONFIRMADA, total_amount=36000, deposit_paid=18000
        )
        res.beds.set([self.bed1])

        # Cancelación mediante endpoint trazable
        cancel_response = self.client.post(
            f'/api/reservations/{res.id}/cancel/',
            {'reason': 'Cancelación por motivos de viaje'},
            format='json'
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)

        # Comprobar que sigue existiendo en BD con estado CANCELADA
        res.refresh_from_db()
        self.assertEqual(res.status, ReservationStatus.CANCELADA)
        self.assertIn('Cancelación por motivos de viaje', res.notes)

    def test_rack_endpoint_performance(self):
        """Valida que el endpoint del Rack responda adecuadamente y con la estructura esperada."""
        self.client.force_authenticate(user=self.recepcion)
        response = self.client.get('/api/rack/?days=14')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('rooms', response.data)
        self.assertIn('dates', response.data)
        self.assertEqual(len(response.data['dates']), 14)
