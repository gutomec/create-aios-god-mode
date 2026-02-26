---
task: createWorkflow()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: workflowName
    tipo: string
    descricao: "Nome do workflow em snake_case — ex: forge_artifact, optimize_framework"
    obrigatorio: true
    validacao: "Deve seguir convenção snake_case — /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/"
  - nome: description
    tipo: string
    descricao: "Descrição completa do propósito e escopo do workflow"
    obrigatorio: true
    validacao: "Mínimo 30 caracteres, deve ser específica ao domínio"
  - nome: agentSequence
    tipo: array
    descricao: "Sequência ordenada de agentes que participam do workflow com papel em cada step"
    obrigatorio: true
    validacao: "Mínimo 2 agentes, cada um com agentId e role definidos"
  - nome: workflowType
    tipo: string
    descricao: "Tipo de fluxo: sequential | fan-out | pipeline"
    obrigatorio: true
    validacao: "Deve ser um dos 3 tipos válidos"
  - nome: triggerCondition
    tipo: string
    descricao: "Condição que dispara o workflow (comando, evento, schedule)"
    obrigatorio: false
    validacao: "Se não fornecido, trigger é manual via comando"
  - nome: targetSquad
    tipo: string
    descricao: "Nome do squad onde salvar o workflow (kebab-case)"
    obrigatorio: false
    validacao: "Se fornecido, squad deve existir em squads/"

Saida:
  - nome: workflowFile
    tipo: file
    descricao: "Arquivo YAML completo do workflow com todas as definições"
    destino: "squads/{targetSquad}/workflows/{workflowName}.yaml"
    persistido: true
  - nome: validationResult
    tipo: object
    descricao: "Resultado da validação estrutural do workflow"
    destino: "Memory"
    persistido: false

Checklist:
  pre-conditions:
    - "[ ] workflowName segue convenção snake_case"
    - "[ ] Todos os agentes em agentSequence existem ou estão planejados"
    - "[ ] workflowType é um dos 3 valores válidos: sequential, fan-out, pipeline"
    - "[ ] Não existe workflow com mesmo nome no diretório destino"
    - "[ ] Para tipo fan-out: pelo menos 2 agentes paralelos definidos"
    - "[ ] Para tipo pipeline: outputs de step N compatíveis com inputs de step N+1"
  post-conditions:
    - "[ ] YAML do workflow é válido e parseable"
    - "[ ] workflow_name, description, agent_sequence presentes"
    - "[ ] Transitions definidas para todas as conexões entre steps"
    - "[ ] Cada transition tem trigger, confidence, greeting_message, next_steps"
    - "[ ] key_commands referenciam comandos existentes nos agentes"
    - "[ ] typical_duration e success_indicators definidos"
    - "[ ] trigger_threshold documentado"
    - "[ ] Diagrama de fluxo presente na description ou em comentários"

Performance:
  duration_expected: "3-5 minutos"
  cost_estimated: "~3000 tokens (Opus)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — workflows conectam tasks e agentes em processos coerentes"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "5s"
  fallback: "Gerar workflow esqueleto com transitions marcadas como TODO"
  notification: "orchestrator"
  common_errors:
    - error: "Duplicate Workflow Name"
      cause: "Já existe workflow com mesmo nome no escopo"
      resolution: "Listar workflows existentes e sugerir nome alternativo"
    - error: "Agent Not Found in Sequence"
      cause: "Agente referenciado em agentSequence não existe"
      resolution: "Listar agentes disponíveis e sugerir substituição"
    - error: "Circular Transition"
      cause: "Transition cria ciclo infinito sem exit condition"
      resolution: "Identificar ciclo e adicionar exit condition (max_iterations ou completion_criteria)"
    - error: "Incompatible I/O Between Steps"
      cause: "Output de step N não é compatível com input de step N+1"
      resolution: "Mapear contratos e sugerir adaptação ou middleware step"

Metadata:
  story: "Como Forge Squad, preciso criar workflows YAML que orquestram agentes e tasks em processos coerentes"
  version: "1.0.0"
  dependencies:
    - "WORKFLOW-FORMAT-SPECIFICATION-V1"
    - "Conhecimento dos 7 workflows AIOS existentes"
  tags:
    - creation
    - workflow
    - orchestration
    - transitions
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# createWorkflow()

## Pipeline Diagram

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  workflowName     │  │  description      │  │  workflowType     │
│  (snake_case)     │  │  (string)         │  │  (seq|fan|pipe)   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────┬──────────┴─────────────────────┘
                    │
┌──────────────────┐│
│  agentSequence    ││
│  (array)          │┤
└──────────────────┘│
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│                        Forge Agent                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Step 1: Validate & Classify                             │ │
│  │  - workflowType routing                                 │ │
│  │  - agent existence check                                │ │
│  │  - naming convention validation                         │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│         ┌───────────────┼───────────────┐                    │
│         ▼               ▼               ▼                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │ Sequential │  │  Fan-Out   │  │  Pipeline  │             │
│  │ Builder    │  │  Builder   │  │  Builder   │             │
│  │            │  │            │  │            │             │
│  │ A → B → C │  │    ┌─ B    │  │ A ─┤─ B ─┤ │             │
│  │            │  │ A ─┤       │  │    in  out │             │
│  │            │  │    └─ C    │  │            │             │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘             │
│        │               │               │                    │
│        └───────────────┬┘───────────────┘                    │
│                        │                                     │
│  ┌─────────────────────▼───────────────────────────────────┐ │
│  │ Step 3: Generate Transitions                            │ │
│  │  - trigger per connection                               │ │
│  │  - confidence level                                     │ │
│  │  - greeting_message for agent handoff                   │ │
│  │  - next_steps with command references                   │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │ Step 4: Assemble YAML & Validate                       │ │
│  │  - merge all sections                                   │ │
│  │  - validate YAML syntax                                 │ │
│  │  - check transition completeness                        │ │
│  │  - write file                                           │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
   ┌──────────────────┐  ┌──────────────────┐
   │  workflowFile     │  │  validationResult │
   │  (.yaml completo) │  │  (structure check)│
   └──────────────────┘  └──────────────────┘
```

## Descrição

A task `createWorkflow()` gera definições de workflow AIOS no formato YAML. Workflows são os **orquestradores** do framework — conectam agentes e tasks em processos multi-step com transições definidas, permitindo automação de fluxos complexos.

### Responsabilidades

1. **Validação e Classificação** — Verificar inputs e rotear para o builder correto:
   - `workflowName` segue snake_case (ex: `forge_artifact`, `optimize_framework`)
   - Todos os agentes em `agentSequence` existem no squad
   - `workflowType` determina o padrão de construção

2. **Construção por Tipo** — Cada tipo de workflow tem um builder especializado:

   **Sequential (A → B → C):**
   ```yaml
   # Agentes executam em série, um após o outro
   # Output de cada step é input do próximo
   # Falha em qualquer step interrompe a cadeia
   agent_sequence:
     - step: 1
       agent: "@agent-a"
       role: "Análise inicial"
       key_command: "*analyze"
       output: "analysis.md"
     - step: 2
       agent: "@agent-b"
       role: "Implementação"
       key_command: "*implement"
       input_from: "step_1.output"
   ```

   **Fan-Out (A → [B, C, D] → E):**
   ```yaml
   # Um agente distribui trabalho para N agentes paralelos
   # Resultados são agregados por um agente final
   agent_sequence:
     - step: 1
       agent: "@orchestrator"
       role: "Distribuição"
       fan_out_to: [2, 3, 4]
     - step: 2
       agent: "@worker-1"
       role: "Subtask A"
       parallel: true
     - step: 3
       agent: "@worker-2"
       role: "Subtask B"
       parallel: true
     - step: 4
       agent: "@aggregator"
       role: "Consolidação"
       waits_for: [2, 3]
   ```

   **Pipeline (A ─┤input→output┤─ B):**
   ```yaml
   # Encadeamento rigoroso de contratos I/O
   # Cada step produz output tipado consumido pelo próximo
   # Validação de compatibilidade entre steps
   agent_sequence:
     - step: 1
       agent: "@analyzer"
       input_contract: { userObjective: string }
       output_contract: { analysis: file, registry: file }
     - step: 2
       agent: "@builder"
       input_contract: { analysis: file, registry: file }
       output_contract: { artifacts: array<file> }
   ```

3. **Geração de Transitions** — Cada conexão entre steps recebe uma transition completa:

   ```yaml
   transitions:
     - from: "step_1"
       to: "step_2"
       trigger: "step_1.status == 'completed'"
       confidence: 0.95
       greeting_message: |
         {agent-b} recebendo handoff de {agent-a}.
         Contexto: {step_1.summary}
         Próximo: Executar {key_command} com dados recebidos.
       next_steps:
         - command: "*implement"
           args: "--input={step_1.output}"
         - command: "*validate"
           args: "--type=pre-check"
   ```

   **Campos Obrigatórios por Transition:**

   | Campo | Tipo | Descrição |
   |-------|------|-----------|
   | `trigger` | string | Condição que dispara a transição |
   | `confidence` | float | Nível de confiança da transição (0.0-1.0) |
   | `greeting_message` | string | Mensagem de handoff para o próximo agente |
   | `next_steps` | array | Comandos a executar no step seguinte |

4. **Montagem do YAML Final** — Estrutura completa do workflow:

   ```yaml
   workflow_name: "nome_do_workflow"
   description: "Descrição completa"
   version: "1.0.0"
   workflow_type: "sequential | fan-out | pipeline"

   agent_sequence:
     - step: N
       agent: "@agent-id"
       role: "Descrição do papel"
       key_command: "*command"

   key_commands:
     - command: "*command-name"
       agent: "@agent-id"
       description: "O que faz"

   trigger_threshold:
     condition: "Quando disparar"
     manual_command: "*start-workflow-name"

   typical_duration: "X-Y minutos"

   success_indicators:
     - "Indicador 1"
     - "Indicador 2"

   transitions:
     - from: "step_N"
       to: "step_N+1"
       trigger: "condition"
       confidence: 0.95
       greeting_message: "handoff message"
       next_steps:
         - command: "*cmd"
   ```

5. **Validação do YAML** — Antes de salvar, validar:
   - YAML é sintaticamente válido
   - Todos os steps referenciados em transitions existem
   - Não há transitions órfãs (sem source ou target)
   - Não há ciclos infinitos sem exit condition
   - key_commands referenciam comandos reais dos agentes
   - agent_sequence é consistente com transitions

### Tipos de Workflow — Guia de Seleção

| Situação | Tipo Recomendado | Justificativa |
|----------|-----------------|---------------|
| Fluxo linear sem paralelismo | `sequential` | Simples, previsível, fácil debug |
| Múltiplas subtasks independentes | `fan-out` | Paralelismo natural, consolidação no final |
| Contratos I/O rígidos entre steps | `pipeline` | Garantia de compatibilidade entre steps |
| Fluxo com decision points | `sequential` + branches | Transitions com condições |
| Operação massiva paralela | `fan-out` + nested | Distribuição hierárquica |

### Workflows AIOS Existentes (Referência)

O AIOS possui 7 workflows core que servem como referência de padrão:

| Workflow | Tipo | Agentes | Propósito |
|----------|------|---------|-----------|
| Story Development Cycle | sequential | @sm → @po → @dev → @qa | Desenvolvimento de stories |
| QA Loop | sequential/iterativo | @qa ↔ @dev | Review-fix cycle |
| Spec Pipeline | pipeline | @pm → @architect → @analyst → @qa | Requirements to spec |
| Brownfield Discovery | sequential | @architect → @data → @ux → @qa → @pm | Legacy assessment |

### Regras de Geração

- **Naming**: workflow_name em snake_case, arquivo em kebab-case.yaml
- **Mínimo 2 agentes** em qualquer workflow (workflow de 1 agente é uma task, não workflow)
- **Transitions completas**: toda conexão step-to-step precisa de transition explícita
- **Exit conditions**: workflows cíclicos DEVEM ter max_iterations ou completion_criteria
- **Success indicators**: mínimo 2 indicadores mensuráveis de sucesso
- **Greeting messages**: devem incluir contexto suficiente para o agente receptor

### Critérios de Qualidade

| Check | Critério | Blocker |
|-------|----------|---------|
| YAML válido | Parseable sem erros | SIM |
| Campos obrigatórios | workflow_name, description, agent_sequence, transitions | SIM |
| Transitions completas | Toda conexão step→step tem transition | SIM |
| Sem ciclos infinitos | Exit conditions para loops | SIM |
| Agentes existem | Todos os agentes referenciados são válidos | NÃO (warning) |
| Key commands válidos | Referências a comandos reais | NÃO (warning) |
| Success indicators | Mínimo 2 indicadores | NÃO (warning) |

### Integração com Outros Tasks

| Task Relacionada | Relação |
|-----------------|---------|
| `createAgent()` | Agentes são os executores dos steps do workflow |
| `createTask()` | Tasks são as operações executadas em cada step |
| `createSquad()` | Squads incluem workflows como componente |
| `validateArtifact()` | Valida workflows gerados contra WORKFLOW-FORMAT-V1 |
| `analyzeAiosComponent()` | Analisa workflows existentes como referência |
