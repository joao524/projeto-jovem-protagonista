# Requisitos — Projeto Jovem Protagonista

## 1. Objetivo
Disponibilizar uma plataforma para passageiros e operadores de um serviço de travessia ferry-boat. O produto deverá ter portal público e painel administrativo/operacional.

## 2. Escopo do portal do passageiro
- Consultar travessias por origem, destino e data.
- Consultar horários, situação operacional e disponibilidade.
- Criar conta, autenticar-se e recuperar acesso.
- Comprar passagens.
- Efetuar pagamento online.
- Consultar bilhetes e histórico.
- Apresentar bilhete individual com QR Code e código consultável manualmente.
- Consultar avisos, notícias e informações operacionais.
- Gerenciar dados de perfil.

## 3. Escopo do painel administrativo/operacional
- Dashboard operacional.
- Gerenciar rotas e viagens.
- Gerenciar horários e embarcações.
- Definir capacidade por viagem, separando passageiros e veículos.
- Consultar reservas, pagamentos e bilhetes.
- Registrar pagamentos presenciais.
- Validar embarque por QR Code ou código manual.
- Gerenciar suspensões, cancelamentos e alterações operacionais.
- Publicar avisos e notícias.
- Gerenciar usuários e permissões.
- Solicitar e aprovar/rejeitar reembolsos conforme perfil.
- Consultar trilhas de auditoria.

## 4. Requisitos funcionais iniciais
- RF01: cadastro, autenticação e recuperação de senha.
- RF02: consulta de rotas, viagens, horários e disponibilidade.
- RF03: gestão de rotas, embarcações e viagens.
- RF04: gestão operacional, incluindo suspensão e reativação.
- RF05: criação de reserva e processamento de pagamento.
- RF06: emissão e consulta de bilhetes individuais.
- RF07: validação de embarque por QR Code e consulta manual.
- RF08: gestão de pagamentos presenciais e online.
- RF09: solicitação e aprovação de reembolsos.
- RF10: publicação de avisos e notificações.
- RF11: administração de usuários, papéis e permissões.
- RF12: auditoria de ações críticas.

## 5. Requisitos não funcionais
- Interface responsiva.
- Alta fidelidade ao protótipo Figma, que é prioridade visual.
- Segurança por autenticação e autorização baseada em papéis/permissões.
- Integridade transacional na confirmação de reservas e pagamentos.
- Proteção de dados pessoais e observância à LGPD.
- Não armazenar dados completos de cartão.
- Logs de auditoria para ações críticas.
- Código modular, testável e documentado.
- Testes automatizados para fluxos críticos.
- Backup e estratégia de recuperação a serem definidos.

## 6. Prioridade
O objetivo é um sistema completo. Desenvolver em etapas verificáveis, sem reduzir silenciosamente o escopo a um MVP.
