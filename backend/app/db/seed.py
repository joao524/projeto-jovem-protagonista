import asyncio
import uuid
from datetime import datetime, time, date, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.modules.identity.models import User, Role, OperatorProfile, user_roles
from app.modules.vessels.models import Vessel
from app.modules.routes.models import Route
from app.modules.trips.models import Trip, TripCapacity, VehicleCategory
from app.modules.announcements.models import Announcement
from app.shared.enums import VesselType, TripStatus, AnnouncementSeverity, OperatorType

async def seed_database():
    print("🌱 Iniciando o povoamento (seed) do PostgreSQL...")

    # Garante que todas as tabelas estejam criadas no banco
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. ROLES
        roles_data = [
            ("ADMINISTRATOR", "Administrador com controle total, aprovação de reembolsos e auditoria"),
            ("SUPERVISOR", "Supervisor operacional com gestão de viagens e suspensões"),
            ("OPERATOR", "Operador de guichê e fiscal de validação de embarque"),
            ("PASSENGER", "Passageiro que realiza consultas e compras de passagens")
        ]
        for role_id, desc in roles_data:
            existing = await session.get(Role, role_id)
            if not existing:
                session.add(Role(id=role_id, description=desc))
        await session.commit()
        print("✅ Papéis (Roles) sincronizados.")

        # 2. USUÁRIOS PADRÃO
        default_users = [
            {
                "email": "admin@ttnb.ba.gov.br",
                "full_name": "Administrador TTNB",
                "role": "ADMINISTRATOR",
                "doc": "000.000.000-01",
                "phone": "(71) 98888-0001"
            },
            {
                "email": "operador@ttnb.ba.gov.br",
                "full_name": "Marcos Fiscal de Cais",
                "role": "OPERATOR",
                "doc": "000.000.000-02",
                "phone": "(71) 98888-0002"
            },
            {
                "email": "ana.costa@email.com",
                "full_name": "Ana Costa",
                "role": "PASSENGER",
                "doc": "123.456.789-00",
                "phone": "(71) 99999-1234"
            }
        ]

        for u in default_users:
            stmt = select(User).where(User.email == u["email"])
            res = await session.execute(stmt)
            user_obj = res.scalar_one_or_none()
            if not user_obj:
                new_user = User(
                    email=u["email"],
                    password_hash=get_password_hash("Senha@Ferry2026"),
                    full_name=u["full_name"],
                    document_number=u["doc"],
                    phone_number=u["phone"],
                    is_active=True
                )
                session.add(new_user)
                await session.flush()
                
                # Associa papel
                role_obj = await session.get(Role, u["role"])
                if role_obj:
                    new_user.roles.append(role_obj)
                
                # Se for operador, cria OperatorProfile
                if u["role"] == "OPERATOR":
                    profile = OperatorProfile(
                        user_id=new_user.id,
                        employee_code="OP-7701",
                        operator_type=OperatorType.BOTH,
                        is_active=True
                    )
                    session.add(profile)
        await session.commit()
        print("✅ Usuários e perfis operacionais criados.")

        # 3. EMBARCAÇÕES (VESSELS)
        vessels_data = [
            ("Ferry Anna Nery", VesselType.FERRY, 800, 60, "Internacional Travessias"),
            ("Ferry Maria Bethânia", VesselType.FERRY, 750, 55, "Internacional Travessias"),
            ("Ferry Pinheiro", VesselType.FERRY, 600, 40, "Internacional Travessias"),
            ("Catamarã Morro Express I", VesselType.CATAMARAN, 130, 0, "Biotur"),
            ("Lancha Vera Cruz", VesselType.SPEEDBOAT, 150, 0, "Socicam Náutica")
        ]
        vessel_map = {}
        for name, vtype, pass_cap, veh_cap, op_name in vessels_data:
            stmt = select(Vessel).where(Vessel.name == name)
            res = await session.execute(stmt)
            v = res.scalar_one_or_none()
            if not v:
                v = Vessel(
                    name=name,
                    vessel_type=vtype,
                    passenger_capacity=pass_cap,
                    vehicle_capacity=veh_cap,
                    operator_name=op_name,
                    is_active=True
                )
                session.add(v)
                await session.flush()
            vessel_map[name] = v
        await session.commit()
        print("✅ Frotas de embarcações sincronizadas.")

        # 4. ROTAS (ROUTES)
        routes_data = [
            ("Salvador", "Mar Grande", 7.5, 45, 8.00, 10.50),
            ("Mar Grande", "Salvador", 7.5, 45, 8.00, 10.50),
            ("Salvador", "Morro de São Paulo", 32.0, 150, 152.00, 152.00),
            ("Morro de São Paulo", "Salvador", 32.0, 150, 152.00, 152.00),
        ]
        route_map = {}
        for orig, dest, dist, dur, base_p, peak_p in routes_data:
            stmt = select(Route).where((Route.origin == orig) & (Route.destination == dest))
            res = await session.execute(stmt)
            r = res.scalar_one_or_none()
            if not r:
                r = Route(
                    origin=orig,
                    destination=dest,
                    distance_nautical_miles=dist,
                    estimated_duration_minutes=dur,
                    base_passenger_fare=base_p,
                    peak_passenger_fare=peak_p,
                    is_active=True
                )
                session.add(r)
                await session.flush()
            route_map[f"{orig}->{dest}"] = r
        await session.commit()
        print("✅ Rotas oficiais cadastradas.")

        # 5. CATEGORIAS DE VEÍCULOS
        categories_data = [
            ("MOTORCYCLE", "Motocicleta / Ciclomotor", 0.50, 15.00),
            ("STANDARD_CAR", "Automóvel Passeio / SUV Pequeno", 1.00, 45.00),
            ("VAN", "Van / Utilitário / Caminhonete", 1.50, 75.00),
            ("BUS", "Ônibus / Micro-ônibus", 3.00, 150.00),
            ("TRUCK", "Caminhão / Veículo Pesado", 4.00, 220.00),
        ]
        for code, name, factor, price in categories_data:
            c = await session.get(VehicleCategory, code)
            if not c:
                session.add(VehicleCategory(
                    code=code,
                    name=name,
                    space_factor=factor,
                    base_price=price,
                    is_active=True
                ))
        await session.commit()
        print("✅ Categorias de veículos sincronizadas.")

        # 6. VIAGENS REGULARES DO DIA COM CAPACIDADE
        today = date.today()
        times_mg = [time(6, 0), time(7, 0), time(8, 0), time(9, 30), time(11, 0), time(14, 0), time(17, 30)]
        times_morro = [time(9, 0), time(14, 30)]

        r_mg = route_map.get("Salvador->Mar Grande")
        v_anna = vessel_map.get("Ferry Anna Nery")

        if r_mg and v_anna:
            for t in times_mg:
                stmt = select(Trip).where(
                    (Trip.route_id == r_mg.id) & 
                    (Trip.scheduled_date == today) & 
                    (Trip.scheduled_departure_time == t)
                )
                res = await session.execute(stmt)
                trip = res.scalar_one_or_none()
                if not trip:
                    trip = Trip(
                        route_id=r_mg.id,
                        vessel_id=v_anna.id,
                        scheduled_date=today,
                        scheduled_departure_time=t,
                        scheduled_arrival_time=time(t.hour + 1, (t.minute + 45) % 60),
                        status=TripStatus.SCHEDULED,
                        passenger_price=r_mg.base_passenger_fare,
                        vehicle_base_price=45.00
                    )
                    session.add(trip)
                    await session.flush()

                    cap = TripCapacity(
                        trip_id=trip.id,
                        max_passengers=v_anna.passenger_capacity,
                        reserved_passengers=12,
                        boarded_passengers=0,
                        max_vehicles=v_anna.vehicle_capacity,
                        reserved_vehicles=4,
                        boarded_vehicles=0
                    )
                    session.add(cap)

        await session.commit()
        print("✅ Viagens regulares e controle de capacidade do dia inseridos.")

        # 7. AVISOS E NOTÍCIAS OPERACIONAIS
        announcements_data = [
            (
                "Aviso Operacional: Maré Alta e Vento Moderado",
                "Condições favoráveis de navegação na Baía de Todos-os-Santos. Travessia Salvador-Mar Grande com saídas a cada 30 minutos.",
                AnnouncementSeverity.INFO
            ),
            (
                "Manutenção Programada do Atracadouro de Bom Despacho",
                "A gaveta 2 passará por vistoria preventiva entre 22:00 e 05:00. O fluxo normal de passageiros e veículos permanece inalterado.",
                AnnouncementSeverity.WARNING
            )
        ]
        for title, content, sev in announcements_data:
            stmt = select(Announcement).where(Announcement.title == title)
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                session.add(Announcement(
                    title=title,
                    content=content,
                    severity=sev,
                    is_published=True,
                    published_at=datetime.now(timezone.utc)
                ))
        await session.commit()
        print("✅ Comunicados operacionais e avisos cadastrados.")

    print("🎉 Povoamento do PostgreSQL concluído com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_database())
