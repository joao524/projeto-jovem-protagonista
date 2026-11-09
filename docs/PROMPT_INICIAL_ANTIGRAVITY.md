# Prompt inicial para Google Antigravity

Você será o agente técnico responsável por planejar e implementar o Projeto Jovem Protagonista.

Leia integralmente o `README.md` e todos os arquivos de `docs/` antes de propor alterações.

## Regras de trabalho
1. Trate `docs/` como a especificação inicial do produto.
2. Diferencie decisões confirmadas, propostas técnicas e pendências.
3. Não invente regras de negócio para preencher lacunas.
4. Não altere stack ou escopo sem apresentar justificativa e pedir aprovação.
5. A fidelidade ao Figma é prioridade visual. Inspecione as referências antes de implementar interfaces. Se não conseguir acessar o Figma, peça exportações/capturas.
6. Não comece gerando todo o sistema de uma vez.
7. Não implemente pagamentos reais sem definição do provedor e ambiente de testes.
8. Não use dados reais de passageiros em ambiente de desenvolvimento.
9. Toda regra crítica deve ter testes automatizados.

## Primeira tarefa — somente análise e planejamento
Ainda não escreva código.

Entregue:
- resumo do escopo;
- lista de decisões confirmadas;
- lista de ambiguidades e perguntas bloqueadoras;
- arquitetura proposta e justificativas;
- mapa de módulos frontend/backend;
- DER físico proposto;
- dicionário de dados com tipos, PK, FK, constraints e índices;
- fluxos de reserva/pagamento, capacidade, embarque e reembolso;
- estratégia transacional contra overbooking e dupla utilização de bilhetes;
- plano de testes;
- plano de implementação em etapas;
- riscos técnicos e operacionais.

Aponte inconsistências entre os documentos e proponha resolução, mas não altere as decisões confirmadas sem aprovação.

## Critérios de aceite da análise
A análise será considerada pronta quando:
- todos os módulos estiverem mapeados;
- o modelo de dados suportar passageiros e veículos separadamente;
- a reserva só consumir capacidade na confirmação do pagamento;
- a confirmação for segura sob concorrência;
- o embarque suportar QR e código manual;
- operador puder solicitar, mas somente administrador aprovar reembolso;
- pendências estiverem explícitas;
- a implementação estiver dividida em entregas testáveis.

Ao terminar, aguarde aprovação antes de criar arquivos de aplicação ou executar migrations.
