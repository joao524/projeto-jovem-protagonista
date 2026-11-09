# Arquitetura e segurança — proposta inicial

## 1. Stack proposta (pendente de aprovação)
- Frontend: React + TypeScript + Tailwind CSS.
- Backend: Python + FastAPI.
- Banco: PostgreSQL.
- Migrações: Alembic.
- Testes: Pytest e Vitest.
- Contrato/documentação: OpenAPI.

Não trocar a stack sem explicar benefícios, custos e obter aprovação.

## 2. Organização sugerida
Monorepo:
- `frontend/`: aplicação web.
- `backend/`: API e domínio.
- `docs/`: documentação do produto e decisões.
- `infra/`: configuração de desenvolvimento/deploy, se necessário.

Frontend pode separar portal do passageiro e painel administrativo, compartilhando componentes e design tokens quando adequado.

Backend deve organizar módulos de domínio, por exemplo:
- identity
- passengers
- routes
- vessels
- trips
- bookings
- payments
- tickets
- boarding
- operations
- refunds
- announcements
- notifications
- audit

## 3. Segurança
- Senhas com algoritmo apropriado de hashing; nunca texto puro.
- Autorização no backend, com RBAC/permissões.
- Validar toda entrada no backend.
- Segredos em variáveis de ambiente/secret manager, nunca commitados.
- Não armazenar dados completos de cartão.
- Webhooks assinados/autenticados e idempotentes.
- Proteção contra duplicidade de pagamentos e confirmação.
- Auditoria de ações administrativas e financeiras.
- Minimização de dados pessoais e controles compatíveis com LGPD.
- Rate limiting e proteção de autenticação conforme risco.
- Política de sessão, expiração e recuperação de senha a definir.

## 4. Qualidade
- Testes unitários de regras de domínio.
- Testes de integração com PostgreSQL.
- Testes de concorrência para última vaga de passageiro e última vaga de veículo.
- Testes de webhook duplicado/fora de ordem.
- Testes de dupla validação de bilhete.
- Testes de permissão: operador não aprova reembolso.
- Testes ponta a ponta dos fluxos essenciais.
- Migrações revisáveis e reversibilidade avaliada.

## 5. Fidelidade visual
O Figma é a referência visual prioritária. Antes de implementar:
1. Inspecionar todas as telas e variantes disponíveis.
2. Identificar tokens, tipografia, cores, espaçamentos, componentes e breakpoints.
3. Mapear telas a rotas e estados da aplicação.
4. Registrar dúvidas e inconsistências.
5. Implementar componentes compartilhados antes de replicar telas.

Se o link do Figma não estiver acessível, solicitar exportações PNG/PDF ou capturas de tela. Não inventar detalhes visuais e não declarar fidelidade validada sem comparar com as referências.
