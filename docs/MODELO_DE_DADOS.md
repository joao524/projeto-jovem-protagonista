# Modelo de dados — versão conceitual inicial

## 1. Princípios
- PostgreSQL.
- UUID como identificador primário, salvo justificativa técnica.
- Valores monetários em `NUMERIC(12,2)` ou precisão definida após validação.
- Datas e horários em `TIMESTAMPTZ`.
- Chaves estrangeiras e constraints no banco, não apenas validações no frontend.
- Migrações versionadas com Alembic.
- Não duplicar dados derivados sem estratégia de consistência.

## 2. Entidades propostas

### Identidade e autorização
- `users`: credenciais e identidade de acesso.
- `roles`: papéis.
- `user_roles`: associação usuário-papel.
- `passengers`: dados específicos do passageiro.
- `operator_profiles`: dados funcionais do operador.

### Transporte
- `vessels`: embarcações.
- `routes`: percursos/origem/destino.
- `trips`: execução programada de uma travessia, vinculada à rota e embarcação.
- `trip_capacities`: capacidade de passageiros e veículos por viagem.

### Reserva e venda
- `bookings`: reserva/compra.
- `booking_passengers`: passageiros vinculados à reserva.
- `booking_vehicles`: veículos vinculados à reserva.
- `payments`: pagamentos e estados financeiros.
- `payment_events`: eventos recebidos do provedor/caixa.
- `tickets`: bilhetes individuais.
- `boarding_records`: validações de embarque.

### Operação e governança
- `operations`: ações operacionais.
- `suspensions`: suspensões/cancelamentos e motivos.
- `announcements`: avisos e notícias.
- `notifications`: notificações.
- `refunds`: solicitações e processamento de reembolso.
- `audit_logs`: trilha de auditoria.

## 3. Campos mínimos conceituais

### `trip_capacities`
- `id UUID PK`
- `trip_id UUID FK UNIQUE`
- `passenger_capacity INTEGER NOT NULL`
- `vehicle_capacity INTEGER NOT NULL`
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

Constraints: capacidades não negativas; uma configuração por viagem, se a regra de negócio confirmar esse desenho.

### `booking_vehicles`
- `id UUID PK`
- `booking_id UUID FK`
- `vehicle_type` (domínio/tabela de categorias a definir)
- `plate` (nullable conforme regra operacional)
- `quantity INTEGER`
- `status`

Não assumir que todos os tipos de veículo consomem uma vaga idêntica. Avaliar tabela `vehicle_categories` com fator/unidades de capacidade, caso a operação real exija.

### `boarding_records`
- `id UUID PK`
- `ticket_id UUID FK`
- `validated_by UUID FK -> users`
- `validation_method` (`QR` ou `MANUAL`)
- `boarded_at TIMESTAMPTZ`
- `status`/resultado

Adicionar constraint/controle transacional que impeça dupla utilização do mesmo bilhete.

### `refunds`
- `id UUID PK`
- `payment_id UUID FK`
- `requested_by UUID FK -> users`
- `approved_by UUID FK -> users`, nullable até decisão
- `amount NUMERIC(12,2)`
- `reason TEXT`
- `status`
- `requested_at TIMESTAMPTZ`
- `approved_at TIMESTAMPTZ`, nullable

### `bookings` (campos a considerar)
- `id UUID PK`
- `trip_id UUID FK`
- `created_by UUID FK`
- `status`
- `total_amount NUMERIC(12,2)`
- `created_at TIMESTAMPTZ`
- `confirmed_at TIMESTAMPTZ`, nullable
- `cancelled_at TIMESTAMPTZ`, nullable

### `payments` (campos a considerar)
- `id UUID PK`
- `booking_id UUID FK`
- `method` (online/presencial e modalidade específica)
- `status`
- `amount NUMERIC(12,2)`
- `provider_reference`, nullable
- `confirmed_at TIMESTAMPTZ`, nullable

## 4. Relações conceituais
- Uma rota possui muitas viagens.
- Uma embarcação pode operar muitas viagens ao longo do tempo.
- Uma viagem possui uma configuração de capacidade.
- Uma viagem possui muitas reservas.
- Uma reserva possui um ou mais passageiros.
- Uma reserva pode possuir zero ou mais veículos.
- Uma reserva possui pagamentos/eventos conforme o desenho financeiro.
- Uma reserva confirmada gera bilhetes individuais.
- Um bilhete pode ter no máximo um embarque efetivo.
- Um pagamento pode ter solicitações/eventos de reembolso, respeitando o saldo reembolsável.

## 5. Observação crítica de concorrência
Não calcular disponibilidade apenas no frontend. A confirmação deve executar no backend, em transação PostgreSQL com estratégia explícita de concorrência (por exemplo, bloqueio da linha de capacidade/viagem com `SELECT ... FOR UPDATE`, ou mecanismo equivalente devidamente testado). A operação deve validar simultaneamente passageiros e veículos e gravar a confirmação de modo atômico.

Este documento ainda não é um DER físico definitivo. O agente deve propor o esquema completo, constraints, índices e estratégia de concorrência para revisão antes de gerar migrations.
