"""Initial schema for Projeto Jovem Protagonista

Revision ID: 2026_11_05_0001
Revises: 
Create Date: 2026-11-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2026_11_05_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extensão pgcrypto
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    # 2. Roles
    op.create_table(
        'roles',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Users
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('document_number', sa.String(length=32), nullable=True),
        sa.Column('phone_number', sa.String(length=32), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('document_number')
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_document', 'users', ['document_number'])

    # 4. User Roles
    op.create_table(
        'user_roles',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('role_id', sa.String(length=32), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'role_id')
    )

    # 5. Operator Profiles
    op.create_table(
        'operator_profiles',
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('badge_number', sa.String(length=64), nullable=False),
        sa.Column('workstation_location', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('badge_number')
    )

    # 6. Vessels
    op.create_table(
        'vessels',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('code', sa.String(length=32), nullable=False),
        sa.Column('max_passenger_capacity', sa.Integer(), nullable=False),
        sa.Column('max_vehicle_capacity', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('max_passenger_capacity > 0', name='chk_vessel_passenger_cap'),
        sa.CheckConstraint('max_vehicle_capacity >= 0', name='chk_vessel_vehicle_cap'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code')
    )

    # 7. Routes
    op.create_table(
        'routes',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('origin_terminal', sa.String(length=128), nullable=False),
        sa.Column('destination_terminal', sa.String(length=128), nullable=False),
        sa.Column('estimated_duration_minutes', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('estimated_duration_minutes > 0', name='chk_route_duration'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('origin_terminal', 'destination_terminal', name='uq_route_terminals')
    )

    # 8. Vehicle Categories
    op.create_table(
        'vehicle_categories',
        sa.Column('code', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('space_factor', sa.Numeric(precision=4, scale=2), server_default=sa.text('1.00'), nullable=False),
        sa.Column('base_price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.CheckConstraint('space_factor > 0', name='chk_vehicle_space_factor'),
        sa.CheckConstraint('base_price >= 0', name='chk_vehicle_base_price'),
        sa.PrimaryKeyConstraint('code')
    )

    # 9. Trips
    op.create_table(
        'trips',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('route_id', sa.UUID(), nullable=False),
        sa.Column('vessel_id', sa.UUID(), nullable=False),
        sa.Column('departure_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('estimated_arrival_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('passenger_base_price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=32), server_default='SCHEDULED', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('estimated_arrival_time > departure_time', name='chk_trip_times'),
        sa.CheckConstraint("status IN ('SCHEDULED', 'BOARDING', 'IN_PROGRESS', 'COMPLETED', 'SUSPENDED', 'CANCELLED')", name='chk_trip_status'),
        sa.CheckConstraint('passenger_base_price >= 0', name='chk_trip_passenger_price'),
        sa.ForeignKeyConstraint(['route_id'], ['routes.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['vessel_id'], ['vessels.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_trips_route_departure', 'trips', ['route_id', 'departure_time'])
    op.create_index('idx_trips_vessel', 'trips', ['vessel_id'])

    # 10. Trip Capacities
    op.create_table(
        'trip_capacities',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('trip_id', sa.UUID(), nullable=False),
        sa.Column('max_passenger_capacity', sa.Integer(), nullable=False),
        sa.Column('max_vehicle_capacity', sa.Integer(), nullable=False),
        sa.Column('occupied_passengers', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('occupied_vehicles', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('max_passenger_capacity >= 0', name='chk_cap_max_passengers'),
        sa.CheckConstraint('max_vehicle_capacity >= 0', name='chk_cap_max_vehicles'),
        sa.CheckConstraint('occupied_passengers >= 0', name='chk_cap_occ_passengers'),
        sa.CheckConstraint('occupied_vehicles >= 0', name='chk_cap_occ_vehicles'),
        sa.CheckConstraint('occupied_passengers <= max_passenger_capacity AND occupied_vehicles <= max_vehicle_capacity', name='chk_capacity_limits'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('trip_id')
    )

    # 11. Bookings
    op.create_table(
        'bookings',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_code', sa.String(length=16), nullable=False),
        sa.Column('trip_id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=True),
        sa.Column('status', sa.String(length=32), server_default='PENDING_PAYMENT', nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('channel', sa.String(length=32), server_default='ONLINE', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'REFUNDED')", name='chk_booking_status'),
        sa.CheckConstraint("channel IN ('ONLINE', 'POS_IN_PERSON')", name='chk_booking_channel'),
        sa.CheckConstraint('total_amount >= 0', name='chk_booking_amount'),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_code')
    )
    op.create_index('idx_bookings_trip', 'bookings', ['trip_id'])
    op.create_index('idx_bookings_customer', 'bookings', ['customer_id'])

    # 12. Booking Passengers
    op.create_table(
        'booking_passengers',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_id', sa.UUID(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('document_number', sa.String(length=32), nullable=False),
        sa.Column('document_type', sa.String(length=16), server_default='CPF', nullable=False),
        sa.Column('passenger_type', sa.String(length=32), server_default='STANDARD', nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 13. Booking Vehicles
    op.create_table(
        'booking_vehicles',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_id', sa.UUID(), nullable=False),
        sa.Column('category_code', sa.String(length=32), nullable=False),
        sa.Column('plate', sa.String(length=16), nullable=False),
        sa.Column('driver_name', sa.String(length=255), nullable=True),
        sa.Column('spaces_consumed', sa.Numeric(precision=4, scale=2), server_default=sa.text('1.00'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint('spaces_consumed > 0', name='chk_booking_vehicle_spaces'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_code'], ['vehicle_categories.code'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # 14. Vehicle Plate History
    op.create_table(
        'vehicle_plate_history',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_vehicle_id', sa.UUID(), nullable=False),
        sa.Column('old_plate', sa.String(length=16), nullable=False),
        sa.Column('new_plate', sa.String(length=16), nullable=False),
        sa.Column('changed_by', sa.UUID(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['booking_vehicle_id'], ['booking_vehicles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['changed_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # 15. Payments
    op.create_table(
        'payments',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_id', sa.UUID(), nullable=False),
        sa.Column('method', sa.String(length=32), nullable=False),
        sa.Column('status', sa.String(length=32), server_default='PENDING', nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('refunded_amount', sa.Numeric(precision=12, scale=2), server_default=sa.text('0.00'), nullable=False),
        sa.Column('provider_name', sa.String(length=64), nullable=True),
        sa.Column('provider_transaction_id', sa.String(length=128), nullable=True),
        sa.Column('idempotency_key', sa.String(length=128), nullable=True),
        sa.Column('registered_by', sa.UUID(), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("method IN ('CREDIT_CARD', 'PIX', 'CASH', 'DEBIT_CARD')", name='chk_payment_method'),
        sa.CheckConstraint("status IN ('PENDING', 'AUTHORIZED', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')", name='chk_payment_status'),
        sa.CheckConstraint('amount > 0', name='chk_payment_amount'),
        sa.CheckConstraint('refunded_amount >= 0 AND refunded_amount <= amount', name='chk_refund_limit'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['registered_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider_transaction_id'),
        sa.UniqueConstraint('idempotency_key')
    )

    # 16. Payment Events
    op.create_table(
        'payment_events',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('payment_id', sa.UUID(), nullable=False),
        sa.Column('event_type', sa.String(length=64), nullable=False),
        sa.Column('external_event_id', sa.String(length=128), nullable=False),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('external_event_id')
    )

    # 17. Tickets
    op.create_table(
        'tickets',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_id', sa.UUID(), nullable=False),
        sa.Column('booking_passenger_id', sa.UUID(), nullable=False),
        sa.Column('trip_id', sa.UUID(), nullable=False),
        sa.Column('ticket_code', sa.String(length=24), nullable=False),
        sa.Column('qr_signature', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), server_default='VALID', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("status IN ('VALID', 'USED', 'CANCELLED', 'REFUNDED')", name='chk_ticket_status'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['booking_passenger_id'], ['booking_passengers.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('booking_passenger_id'),
        sa.UniqueConstraint('ticket_code')
    )
    op.create_index('idx_tickets_code', 'tickets', ['ticket_code'])
    op.create_index('idx_tickets_trip_status', 'tickets', ['trip_id', 'status'])

    # 18. Boarding Records
    op.create_table(
        'boarding_records',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('ticket_id', sa.UUID(), nullable=False),
        sa.Column('trip_id', sa.UUID(), nullable=False),
        sa.Column('validated_by', sa.UUID(), nullable=False),
        sa.Column('validation_method', sa.String(length=16), nullable=False),
        sa.Column('device_identifier', sa.String(length=128), nullable=True),
        sa.Column('boarded_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("validation_method IN ('QR_SCAN', 'MANUAL_CODE')", name='chk_boarding_method'),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['validated_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_id')
    )

    # 19. Refunds
    op.create_table(
        'refunds',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('payment_id', sa.UUID(), nullable=False),
        sa.Column('booking_id', sa.UUID(), nullable=False),
        sa.Column('requested_by', sa.UUID(), nullable=False),
        sa.Column('approved_by', sa.UUID(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), server_default='PENDING_APPROVAL', nullable=False),
        sa.Column('payout_method', sa.String(length=32), nullable=True),
        sa.Column('disbursed_by', sa.UUID(), nullable=True),
        sa.Column('receipt_reference', sa.String(length=128), nullable=True),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('amount > 0', name='chk_refund_amount'),
        sa.CheckConstraint("status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')", name='chk_refund_status'),
        sa.CheckConstraint("payout_method IS NULL OR payout_method IN ('ORIGINAL_GATEWAY', 'CASH_REGISTER', 'PIX')", name='chk_refund_payout_method'),
        sa.CheckConstraint('approved_by IS NULL OR approved_by <> requested_by', name='chk_no_self_approval'),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['disbursed_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['requested_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # 20. Trip Suspensions
    op.create_table(
        'trip_suspensions',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('trip_id', sa.UUID(), nullable=False),
        sa.Column('suspended_by', sa.UUID(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('action_type', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("action_type IN ('SUSPENDED', 'CANCELLED', 'REACTIVATED')", name='chk_suspension_action'),
        sa.ForeignKeyConstraint(['suspended_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # 21. Announcements
    op.create_table(
        'announcements',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(length=16), server_default='NORMAL', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('published_by', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')", name='chk_announcement_priority'),
        sa.ForeignKeyConstraint(['published_by'], ['users.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )

    # 22. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('action', sa.String(length=64), nullable=False),
        sa.Column('entity_name', sa.String(length=64), nullable=False),
        sa.Column('entity_id', sa.String(length=64), nullable=False),
        sa.Column('old_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_audit_logs_user', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity_name', 'entity_id'])

    # 23. Seed inicial dos Papéis Básicos e Categorias de Veículos
    op.execute("""
        INSERT INTO roles (id, description) VALUES
        ('PASSENGER', 'Passageiro que realiza consultas e compras de passagens'),
        ('OPERATOR', 'Operador de guichê e fiscal de validação de embarque'),
        ('SUPERVISOR', 'Supervisor operacional com gestão de viagens e suspensões'),
        ('ADMINISTRATOR', 'Administrador com controle total, aprovação de reembolsos e auditoria')
        ON CONFLICT (id) DO NOTHING;
    """)

    op.execute("""
        INSERT INTO vehicle_categories (code, name, space_factor, base_price, is_active) VALUES
        ('MOTORCYCLE', 'Motocicleta / Ciclomotor', 0.50, 15.00, true),
        ('STANDARD_CAR', 'Automóvel Passeio / SUV Pequeno', 1.00, 45.00, true),
        ('VAN', 'Van / Utilitário / Caminhonete', 1.50, 75.00, true),
        ('BUS', 'Ônibus / Micro-ônibus', 3.00, 150.00, true),
        ('TRUCK', 'Caminhão / Veículo Pesado', 4.00, 220.00, true)
        ON CONFLICT (code) DO NOTHING;
    """)


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('announcements')
    op.drop_table('trip_suspensions')
    op.drop_table('refunds')
    op.drop_table('boarding_records')
    op.drop_table('tickets')
    op.drop_table('payment_events')
    op.drop_table('payments')
    op.drop_table('vehicle_plate_history')
    op.drop_table('booking_vehicles')
    op.drop_table('booking_passengers')
    op.drop_table('bookings')
    op.drop_table('trip_capacities')
    op.drop_table('trips')
    op.drop_table('vehicle_categories')
    op.drop_table('routes')
    op.drop_table('vessels')
    op.drop_table('operator_profiles')
    op.drop_table('user_roles')
    op.drop_table('users')
    op.drop_table('roles')
