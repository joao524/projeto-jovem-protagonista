# Regras de negócio — Projeto Jovem Protagonista

## 1. Decisões confirmadas
1. Público: passageiros e operadores.
2. Escopo: sistema completo, com portal público e painel administrativo.
3. Prioridade: fidelidade visual ao Figma.
4. Modalidade: ferry-boat.
5. Pagamentos: online e presencial.
6. Capacidade: controlada por viagem.
7. Reserva: `immediate` — a vaga só é ocupada após confirmação do pagamento.
8. Embarque: `both` — QR Code individual e consulta manual.
9. Reembolso: `operator` — operador solicita; administrador autoriza.
10. Capacidade: `passengers_vehicles` — passageiros e veículos com limites independentes.

## 2. Reserva e confirmação
- A criação de uma intenção/reserva pendente não consome capacidade.
- O sistema consulta disponibilidade antes de iniciar o pagamento, mas essa consulta não garante vaga até a confirmação.
- Após confirmação financeira, o backend deve verificar novamente a capacidade e confirmar a reserva em transação atômica.
- Se a capacidade tiver sido esgotada durante o pagamento, a reserva não pode ser confirmada. O sistema deve iniciar cancelamento/estorno ou compensação conforme o provedor e o estado financeiro.
- Pagamento presencial só confirma a reserva depois que operador autorizado registra o recebimento e o backend confirma capacidade.
- Webhooks de pagamento devem ser autenticados e idempotentes.
- Uma notificação repetida do provedor não pode duplicar confirmação, bilhete ou baixa financeira.

## 3. Capacidade
- Cada viagem tem capacidade máxima de passageiros e capacidade máxima de veículos.
- As capacidades são independentes.
- Uma reserva pode incluir passageiros e, quando aplicável, veículos.
- A confirmação exige disponibilidade suficiente em todas as categorias solicitadas.
- Cancelamento não deve liberar capacidade antes de a transição de estado estar efetivamente concluída.
- Alterações de capacidade devem ser auditadas e não podem deixar capacidade menor que a ocupação confirmada.
- Confirmar com a operação real se categorias de veículos ocupam unidades equivalentes ou se exigem consumo de espaços/unidades diferentes.

## 4. Bilhetes e embarque
- Emitir bilhete individual por passageiro.
- Cada bilhete deve ter identificador/código único e QR Code.
- Operador pode validar por leitura do QR Code ou consulta manual pelo código.
- Backend verifica existência, viagem, reserva confirmada, pagamento confirmado, validade e não utilização.
- Uma segunda utilização deve ser recusada.
- Registrar operador, horário, método e resultado da validação.
- Definir se e como os veículos terão validação/registro de entrada independente.

## 5. Reembolso
- Operador pode solicitar reembolso e informar motivo/valor.
- Administrador aprova ou rejeita.
- Solicitante não pode aprovar a própria solicitação.
- Reembolso aprovado deve ser processado pelo meio original quando tecnicamente possível; pagamento presencial exige procedimento de caixa definido.
- Impedir reembolso acima do saldo reembolsável.
- Registrar solicitante, aprovador, justificativas, valores, timestamps e estado do processamento.
- Estados sugeridos: `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `PROCESSING`, `COMPLETED`, `FAILED`, `CANCELLED`.

## 6. Suspensão/cancelamento de viagem
- Suspender viagem bloqueia novas compras.
- Registrar motivo, responsável, data/hora e comunicação aos passageiros afetados.
- Reservas existentes devem entrar em fluxo de tratamento: remarcação, reembolso ou outra política formalmente definida.
- Não presumir política de compensação sem decisão do responsável pelo negócio.

## 7. Estados sugeridos
Reserva: `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `REFUNDED`.
Pagamento: `PENDING`, `AUTHORIZED`, `CONFIRMED`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`.
Bilhete: `VALID`, `USED`, `CANCELLED`, `REFUNDED`.
Viagem: `SCHEDULED`, `BOARDING`, `IN_PROGRESS`, `COMPLETED`, `SUSPENDED`, `CANCELLED`.

Os estados são propostas de implementação e devem ser validados contra os fluxos do protótipo e a operação real.
