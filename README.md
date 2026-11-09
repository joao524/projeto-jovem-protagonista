# Projeto Jovem Protagonista

Pacote inicial de especificação para desenvolvimento assistido pelo Google Antigravity.

## Objetivo
Construir uma plataforma completa de gestão e consulta de travessias ferry-boat, com:
- Portal público para passageiros.
- Painel administrativo/operacional.
- Compra de passagens com pagamento online e presencial.
- Gestão de viagens, capacidade, embarque, operações e comunicação.

## Estado deste pacote
Este material é uma especificação inicial, não uma aplicação implementada. Requisitos e decisões explicitamente confirmados estão separados das propostas e pendências.

## Stack proposta (ainda precisa de aprovação final)
- Frontend: React + TypeScript + Tailwind CSS.
- Backend: Python + FastAPI.
- Banco: PostgreSQL.
- Migrações: Alembic.
- Testes: Pytest e Vitest.
- Contrato de API: OpenAPI.

Não substitua essas tecnologias sem justificar e solicitar confirmação.

## Como começar no Antigravity
1. Abra/crie a pasta do projeto no Antigravity.
2. Extraia este pacote e mantenha a pasta `docs/` na raiz do projeto.
3. Disponibilize também as referências visuais do Figma (link e exportações/capturas das telas).
4. Cole o prompt de `docs/PROMPT_INICIAL_ANTIGRAVITY.md`.
5. Peça primeiro análise e plano; não autorize geração massiva de código antes da validação da arquitetura.

## Referência Figma
https://www.figma.com/design/NWfMkPqBuyRqLPRmYBm6YN/Projeto-Jovem-Protagonista?node-id=1669-162202&t=1LRQfU2dt9TAA7yo-1

Acesso ao conteúdo interno do Figma ainda não foi validado. O agente deve solicitar capturas/exportações ou acesso apropriado caso não consiga visualizar o arquivo.

## Documentos
- `docs/REQUISITOS.md`: escopo funcional e não funcional.
- `docs/REGRAS_DE_NEGOCIO.md`: regras confirmadas e fluxos críticos.
- `docs/MODELO_DE_DADOS.md`: modelo conceitual inicial e recomendações PostgreSQL.
- `docs/ARQUITETURA_E_SEGURANCA.md`: arquitetura proposta e controles.
- `docs/PENDENCIAS_E_DECISOES.md`: itens que não devem ser presumidos.
- `docs/PROMPT_INICIAL_ANTIGRAVITY.md`: instrução pronta para iniciar o trabalho.
