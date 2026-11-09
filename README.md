# Projeto Jovem Protagonista — TTNB Ferry Booking System

Plataforma completa de gestão e bilhetagem eletrônica para travessias marítimas de ferry-boat (Salvador ↔ Mar Grande / Morro de São Paulo), desenvolvida com máxima fidelidade visual ao protótipo do Figma.

---

## 🚀 Tecnologias

### **Backend**
- **Python 3.11+ / FastAPI**: API REST assíncrona de alta performance.
- **SQLAlchemy 2.0 (Async) + Alembic**: ORM com 22 tabelas e migrações versionadas.
- **Pydantic v2**: Validação estrita de contratos e schemas de entrada/saída.
- **Segurança**: HMAC-SHA256 para assinatura anti-fraude de bilhetes QR Code, JWT para autenticação e RBAC (Passageiro, Operador, Administrador) e hashing bcrypt.
- **Testes**: Pytest + pytest-asyncio com cobertura unitária e de integração E2E.

### **Frontend**
- **React 18 + TypeScript + Vite**: SPA moderna, rápida e tipada.
- **Tailwind CSS**: Tokens de cores e tipografia extraídos com precisão pixel-perfect do Figma (`#07395c`, `#ed7837`, `#318a91`, `#ecf5f0`, `#aa752d`).
- **React Router DOM v6**: 17 rotas completas cobrindo todos os fluxos de passageiro, guichê e operação.
- **Lucide React & QRCode**: Ícones consistentes e renderização nativa de passagens QR Code SVG.

---

## 📁 Estrutura do Repositório

```
Projeto_Jovem_Protagonista_Antigravity/
├── backend/
│   ├── alembic/                # Migrações do banco (schema completo 22 tabelas)
│   ├── app/
│   │   ├── core/               # Configurações, banco assíncrono e segurança (HMAC, JWT, bcrypt)
│   │   ├── db/                 # Base agregada dos modelos SQLAlchemy
│   │   ├── modules/
│   │   │   ├── identity/       # Autenticação, usuários, papéis e perfis
│   │   │   ├── vessels/        # Embarcações e frotas
│   │   │   ├── routes/         # Rotas marítimas (Salvador - Mar Grande / Morro)
│   │   │   ├── trips/          # Viagens, capacidades e suspensões operacionais
│   │   │   ├── bookings/       # Reservas, passageiros e histórico de placas de veículos
│   │   │   ├── payments/       # Sessões PIX, cartão e registro de caixa (POS)
│   │   │   ├── tickets/        # Bilhetes com assinatura digital HMAC-SHA256
│   │   │   ├── boarding/       # Validação de embarque por QR Code e código manual
│   │   │   ├── refunds/        # Ciclo de reembolso (solicitação -> aprovação admin -> estorno)
│   │   │   ├── announcements/  # Avisos e notícias operacionais
│   │   │   ├── operations/     # Status do terminal (filômetro) e clima marítimo
│   │   │   └── public/         # Endpoints públicos de consulta
│   │   └── main.py             # Instância FastAPI e registro de rotas
│   ├── tests/                  # Testes unitários de segurança e integração E2E
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, NavigationDrawer e componentes compartilhados
│   │   ├── pages/              # 16 páginas implementadas conforme o Figma
│   │   ├── services/           # Cliente Axios configurado com interceptor JWT
│   │   ├── App.tsx             # Roteador com 17 telas
│   │   └── main.tsx
│   ├── tailwind.config.js      # Paleta TTNB extraída do Figma
│   └── package.json
│
└── docs/                       # Documentação técnica e regras de negócio
    ├── REQUISITOS.md
    ├── REGRAS_DE_NEGOCIO.md
    ├── MODELO_DE_DADOS.md
    ├── ARQUITETURA_E_SEGURANCA.md
    └── PENDENCIAS_E_DECISOES.md
```

---

## 🛠️ Como Executar

### 1. Backend

```bash
cd backend
python -m venv .venv
# Ativar venv:
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

pip install -e .
uvicorn app.main:app --reload --port 8000
```
- Documentação interativa Swagger: `http://localhost:8000/docs`
- Documentação ReDoc: `http://localhost:8000/redoc`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
- Acesse a aplicação em: `http://localhost:5173`

### 3. Rodar os Testes

```bash
cd backend
pytest -v
```

---

## 🚢 Regras de Negócio Implementadas

1. **Placa de Veículo Obrigatória**: Exigida no momento da reserva para viagens com veículo e editável pelo passageiro até o embarque (com histórico de auditoria).
2. **Capacidade Dupla Independente**: Controle atômico por viagem para passageiros e metros lineares/vagas de veículos.
3. **Validação de Embarque Dupla**: Suporte a leitura de QR Code assinado criptograficamente (HMAC-SHA256) e inserção manual de código de 6 caracteres. Prevenção estrita de embarque duplicado.
4. **Fluxo de Reembolso Auditável**: Solicitação pelo operador ou passageiro → Revisão e aprovação pelo Administrador → Efetivação do pagamento em dinheiro no guichê ou via PIX com comprovante (sem auto-aprovação).
5. **Modo Demo com In-Memory Stores**: O sistema roda imediatamente com dados mockados em memória para demonstração sem necessidade de configurar banco PostgreSQL previamente, enquanto os modelos SQLAlchemy e migrações Alembic estão prontos para produção.

---

## 🎨 Referência de Design

- **Protótipo Figma**: [Figma Link](https://www.figma.com/design/OJTCfYEnqh8sKj9w5QLFC9/Projeto-Jovem-Protagonista--c%C3%B3pia-?node-id=1669-162202)
- Formato: Mobile-first (402px de largura base, responsivo).
