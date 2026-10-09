import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from pms.models import (
    User, UserRole, Room, RoomType, PhysicalStatus,
    Bed, BedType, Guest, DocumentType, Reservation,
    ReservationStatus, MaintenanceBlock, AuditLog, AuditAction
)

class Command(BaseCommand):
    help = 'Carga inicial de datos para Hostel Constantino (10 unidades, 38 plazas, roles y reservas de ejemplo)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando carga de datos de Hostel Constantino...'))

        # 1. Crear Usuarios con Roles RBAC
        users_data = [
            {
                'username': 'victor',
                'first_name': 'Víctor',
                'last_name': 'Gerente General',
                'email': 'victor@hostelconstantino.com',
                'role': UserRole.ADMIN,
                'password': 'admin123',
                'is_staff': True,
                'is_superuser': True
            },
            {
                'username': 'recepcion',
                'first_name': 'Camila',
                'last_name': 'Recepcionista',
                'email': 'recepcion@hostelconstantino.com',
                'role': UserRole.RECEPCION,
                'password': 'recepcion123',
                'is_staff': False,
                'is_superuser': False
            },
            {
                'username': 'limpieza',
                'first_name': 'Marta',
                'last_name': 'Operaciones Limpieza',
                'email': 'limpieza@hostelconstantino.com',
                'role': UserRole.LIMPIEZA,
                'password': 'limpieza123',
                'is_staff': False,
                'is_superuser': False
            }
        ]

        created_users = {}
        for udata in users_data:
            user, created = User.objects.get_or_create(
                username=udata['username'],
                defaults={
                    'first_name': udata['first_name'],
                    'last_name': udata['last_name'],
                    'email': udata['email'],
                    'role': udata['role'],
                    'is_staff': udata['is_staff'],
                    'is_superuser': udata['is_superuser']
                }
            )
            if created or not user.check_password(udata['password']):
                user.set_password(udata['password'])
                user.role = udata['role']
                user.save()
            created_users[user.username] = user
            self.stdout.write(f"Usuario verificado: {user.username} ({user.get_role_display()})")

        admin_user = created_users['victor']

        # 2. Configuración de 10 Habitaciones y 38 Plazas (Hostel Constantino)
        # 4 Dobles Privadas (Capacidad 2 cada una = 8 plazas)
        # 2 Triples (Capacidad 3 cada una = 6 plazas)
        # 4 Compartidas de 6 plazas (Capacidad 6 cada una = 24 plazas)
        # Total = 10 habitaciones, 38 camas
        rooms_specs = [
            # 4 Dobles Privadas (Piso 1)
            {
                'number': '101', 'name': 'Doble Privada Deluxe', 'type': RoomType.DOUBLE_PRIVATE,
                'capacity': 2, 'floor': 1, 'price': 45000.00,
                'beds': [
                    {'number': 'Cama Matrimonial', 'type': BedType.MATRIMONIAL, 'price': 45000.00}
                ]
            },
            {
                'number': '102', 'name': 'Doble Twin', 'type': RoomType.DOUBLE_PRIVATE,
                'capacity': 2, 'floor': 1, 'price': 45000.00,
                'beds': [
                    {'number': 'Cama 1 Individual', 'type': BedType.INDIVIDUAL, 'price': 22500.00},
                    {'number': 'Cama 2 Individual', 'type': BedType.INDIVIDUAL, 'price': 22500.00}
                ]
            },
            {
                'number': '103', 'name': 'Doble Matrimonial Balcón', 'type': RoomType.DOUBLE_PRIVATE,
                'capacity': 2, 'floor': 1, 'price': 48000.00,
                'beds': [
                    {'number': 'Cama Matrimonial', 'type': BedType.MATRIMONIAL, 'price': 48000.00}
                ]
            },
            {
                'number': '104', 'name': 'Doble Twin Estándar', 'type': RoomType.DOUBLE_PRIVATE,
                'capacity': 2, 'floor': 1, 'price': 45000.00,
                'beds': [
                    {'number': 'Cama 1 Individual', 'type': BedType.INDIVIDUAL, 'price': 22500.00},
                    {'number': 'Cama 2 Individual', 'type': BedType.INDIVIDUAL, 'price': 22500.00}
                ]
            },
            # 2 Triples (Piso 2)
            {
                'number': '201', 'name': 'Triple Familiar', 'type': RoomType.TRIPLE_PRIVATE,
                'capacity': 3, 'floor': 2, 'price': 60000.00,
                'beds': [
                    {'number': 'Cama Matrimonial', 'type': BedType.MATRIMONIAL, 'price': 40000.00},
                    {'number': 'Cama Individual', 'type': BedType.INDIVIDUAL, 'price': 20000.00}
                ]
            },
            {
                'number': '202', 'name': 'Triple Tres Camas', 'type': RoomType.TRIPLE_PRIVATE,
                'capacity': 3, 'floor': 2, 'price': 60000.00,
                'beds': [
                    {'number': 'Cama 1', 'type': BedType.INDIVIDUAL, 'price': 20000.00},
                    {'number': 'Cama 2', 'type': BedType.INDIVIDUAL, 'price': 20000.00},
                    {'number': 'Cama 3', 'type': BedType.INDIVIDUAL, 'price': 20000.00}
                ]
            },
            # 4 Compartidas de 6 plazas (Piso 3)
            {
                'number': '301', 'name': 'Compartida Mixta A (6 Plazas)', 'type': RoomType.SHARED_DORM,
                'capacity': 6, 'floor': 3, 'price': 108000.00,
                'beds': [
                    {'number': 'Cucheta 1 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 1 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                ]
            },
            {
                'number': '302', 'name': 'Compartida Mixta B (6 Plazas)', 'type': RoomType.SHARED_DORM,
                'capacity': 6, 'floor': 3, 'price': 108000.00,
                'beds': [
                    {'number': 'Cucheta 1 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 1 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                ]
            },
            {
                'number': '303', 'name': 'Compartida Femenina (6 Plazas)', 'type': RoomType.SHARED_DORM,
                'capacity': 6, 'floor': 3, 'price': 108000.00,
                'beds': [
                    {'number': 'Cucheta 1 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 1 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                ]
            },
            {
                'number': '304', 'name': 'Compartida Masculina (6 Plazas)', 'type': RoomType.SHARED_DORM,
                'capacity': 6, 'floor': 3, 'price': 108000.00,
                'beds': [
                    {'number': 'Cucheta 1 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 1 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 2 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Alta', 'type': BedType.BUNK_TOP, 'price': 18000.00},
                    {'number': 'Cucheta 3 - Baja', 'type': BedType.BUNK_BOTTOM, 'price': 18000.00},
                ]
            },
        ]

        all_beds_count = 0
        all_rooms_objs = {}
        all_beds_objs = {}

        for rspec in rooms_specs:
            room, _ = Room.objects.update_or_create(
                number=rspec['number'],
                defaults={
                    'name': rspec['name'],
                    'room_type': rspec['type'],
                    'capacity': rspec['capacity'],
                    'floor': rspec['floor'],
                    'base_price_per_night': rspec['price'],
                    'physical_status': PhysicalStatus.CLEAN
                }
            )
            all_rooms_objs[room.number] = room

            for bspec in rspec['beds']:
                bed, _ = Bed.objects.update_or_create(
                    room=room,
                    number=bspec['number'],
                    defaults={
                        'bed_type': bspec['type'],
                        'price_per_night': bspec['price'],
                        'physical_status': PhysicalStatus.CLEAN,
                        'is_active': True
                    }
                )
                all_beds_objs[f"{room.number}-{bed.number}"] = bed
                all_beds_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Configuradas {Room.objects.count()} habitaciones y {Bed.objects.count()} camas/plazas (Total esperado: 10 habs, 38 plazas)."
        ))

        # 3. Huéspedes de Demostración
        guests_data = [
            {
                'first_name': 'Lucas', 'last_name': 'Benítez',
                'document_type': DocumentType.DNI, 'document_number': '38123456',
                'email': 'lucas.benitez@example.com', 'phone': '+54 351 555-1234',
                'nationality': 'Argentina'
            },
            {
                'first_name': 'Sofía', 'last_name': 'Morales',
                'document_type': DocumentType.DNI, 'document_number': '40987654',
                'email': 'sofia.morales@example.com', 'phone': '+54 351 555-5678',
                'nationality': 'Argentina'
            },
            {
                'first_name': 'John', 'last_name': 'Smith',
                'document_type': DocumentType.PASSPORT, 'document_number': 'US987654321',
                'email': 'john.smith@example.com', 'phone': '+1 202 555-0192',
                'nationality': 'Estados Unidos'
            },
            {
                'first_name': 'Martina', 'last_name': 'Rossi',
                'document_type': DocumentType.PASSPORT, 'document_number': 'IT123456789',
                'email': 'martina.rossi@example.com', 'phone': '+39 06 6987-1234',
                'nationality': 'Italia'
            },
            {
                'first_name': 'Federico', 'last_name': 'Gómez',
                'document_type': DocumentType.DNI, 'document_number': '35667788',
                'email': 'fede.gomez@example.com', 'phone': '+54 351 555-9012',
                'nationality': 'Argentina'
            }
        ]

        created_guests = {}
        for gdata in guests_data:
            guest, _ = Guest.objects.update_or_create(
                document_number=gdata['document_number'],
                defaults=gdata
            )
            created_guests[guest.document_number] = guest

        # 4. Reservas de Muestra para Visualización en Rack
        today = timezone.localdate()
        
        # Reserva 1: Doble 101 ocupada (Check-in) por Lucas Benítez
        res1, _ = Reservation.objects.update_or_create(
            code='RES-2026-0001',
            defaults={
                'guest': created_guests['38123456'],
                'room': all_rooms_objs['101'],
                'check_in_date': today,
                'check_out_date': today + datetime.timedelta(days=3),
                'status': ReservationStatus.CHECK_IN,
                'total_amount': 135000.00,
                'deposit_paid': 135000.00,
                'created_by': created_users['recepcion'],
                'notes': 'Huésped llegó a las 14:00. Pago completo realizado.'
            }
        )
        res1.beds.set(all_rooms_objs['101'].beds.all())

        # Reserva 2: Compartida 301 Cama 1 Confirmada para John Smith
        bed_301_1 = all_beds_objs['301-Cucheta 1 - Alta']
        res2, _ = Reservation.objects.update_or_create(
            code='RES-2026-0002',
            defaults={
                'guest': created_guests['US987654321'],
                'room': all_rooms_objs['301'],
                'check_in_date': today + datetime.timedelta(days=1),
                'check_out_date': today + datetime.timedelta(days=5),
                'status': ReservationStatus.CONFIRMADA,
                'total_amount': 72000.00,
                'deposit_paid': 36000.00,
                'created_by': created_users['recepcion'],
                'notes': 'Seña del 50% recibida por transferencia bancaria.'
            }
        )
        res2.beds.set([bed_301_1])

        # Reserva 3: Triple 201 Pendiente de Seña para Sofía Morales
        res3, _ = Reservation.objects.update_or_create(
            code='RES-2026-0003',
            defaults={
                'guest': created_guests['40987654'],
                'room': all_rooms_objs['201'],
                'check_in_date': today + datetime.timedelta(days=2),
                'check_out_date': today + datetime.timedelta(days=6),
                'status': ReservationStatus.PENDIENTE_SENA,
                'total_amount': 240000.00,
                'deposit_paid': 0.00,
                'created_by': created_users['recepcion'],
                'notes': 'Esperando comprobante de seña antes de 24hs.'
            }
        )
        res3.beds.set(all_rooms_objs['201'].beds.all())

        # Reserva 4: Compartida 303 Cama 2 para Martina Rossi (Check-in hoy)
        bed_303_2 = all_beds_objs['303-Cucheta 1 - Baja']
        res4, _ = Reservation.objects.update_or_create(
            code='RES-2026-0004',
            defaults={
                'guest': created_guests['IT123456789'],
                'room': all_rooms_objs['303'],
                'check_in_date': today,
                'check_out_date': today + datetime.timedelta(days=4),
                'status': ReservationStatus.CHECK_IN,
                'total_amount': 72000.00,
                'deposit_paid': 72000.00,
                'created_by': created_users['recepcion'],
                'notes': 'Check-in realizado. Mochilera italiana.'
            }
        )
        res4.beds.set([bed_303_2])

        # 5. Bloqueo de Mantenimiento Algorítmico de Demostración
        # Habitación 104 con mantenimiento programado
        MaintenanceBlock.objects.update_or_create(
            room=all_rooms_objs['104'],
            start_date=today + datetime.timedelta(days=3),
            end_date=today + datetime.timedelta(days=6),
            defaults={
                'reason': 'Reparación de grifería y pintura en baño privado',
                'created_by': admin_user,
                'is_active': True
            }
        )

        # Cama específica de compartida 302 con mantenimiento
        bed_302_cucheta = all_beds_objs['302-Cucheta 3 - Alta']
        MaintenanceBlock.objects.update_or_create(
            bed=bed_302_cucheta,
            start_date=today,
            end_date=today + datetime.timedelta(days=2),
            defaults={
                'reason': 'Ajuste de escalera y baranda de seguridad',
                'created_by': admin_user,
                'is_active': True
            }
        )

        # 6. Estados de Limpieza Iniciales
        all_rooms_objs['102'].physical_status = PhysicalStatus.DIRTY
        all_rooms_objs['102'].save()

        all_rooms_objs['103'].physical_status = PhysicalStatus.CLEANING
        all_rooms_objs['103'].save()

        # 7. Registros de Auditoría
        AuditLog.objects.create(
            user=admin_user,
            action=AuditAction.CREATE,
            entity_type='SYSTEM',
            entity_id='SEED',
            description='Inicialización del PMS Hostel Constantino con 10 habitaciones y 38 camas.'
        )

        self.stdout.write(self.style.SUCCESS('¡Datos iniciales cargados con éxito!'))
        self.stdout.write(self.style.NOTICE(
            "Credenciales disponibles:\n"
            " - Administrador (Víctor): victor / admin123\n"
            " - Recepción (Camila): recepcion / recepcion123\n"
            " - Limpieza (Marta): limpieza / limpieza123\n"
        ))
