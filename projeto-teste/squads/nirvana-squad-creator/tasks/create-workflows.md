---
task: createWorkflows()
responsavel: "WorkflowCreator"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: analysisMd
    tipo: file
    descricao: "analyzeRequirements() task output"
    obrigatorio: true
  - nome: componentRegistryMd
    tipo: file
    descricao: "analyzeRequirements() task output"
    obrigatorio: true
  - nome: agentFiles
    tipo: array<file>
    descricao: "createAgents() task output"
    obrigatorio: true
  - nome: taskFiles
    tipo: array<file>
    descricao: "createTasks() task output"
    obrigatorio: true
  - nome: allTemplates
    tipo: array<file>
    descricao: "templates/*.md (squad.yaml, workflow, config templates)"
    obrigatorio: true
  - nome: allReferences
    tipo: array<file>
    descricao: "references/*.md (workflow-format, squad-yaml-schema, config-format)"
    obrigatorio: true

Saida:
  - nome: workflowFiles
    tipo: array<file>
    descricao: "optimizeSquad() task"
    obrigatorio: true
  - nome: squadYaml
    tipo: file
    descricao: "optimizeSquad() task + validateSquad() task"
    obrigatorio: true
  - nome: configFiles
    tipo: array<file>
    descricao: "optimizeSquad() task"
    obrigatorio: true
  - nome: readmeMd
    tipo: file
    descricao: "optimizeSquad() task"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Agentes existem no diretório agents/ com IDs válidos"
    - "[ ] Tasks existem no diretório tasks/ com contratos Entrada/Saída"
    - "[ ] Templates de workflow, squad.yaml e config disponíveis"
    - "[ ] Referências de formato disponíveis"
  post-conditions:
    - "[ ] Pelo menos 1 workflow criado no diretório workflows/"
    - "[ ] Cada workflow tem: workflow_name, description, agent_sequence, success_indicators"
    - "[ ] squad.yaml gerado com name, version, description, aios.minVersion, aios.type, components"
    - "[ ] config/ contém coding-standards.md, tech-stack.md, source-tree.md"
    - "[ ] README.md gerado com visão geral do squad"
    - "[ ] agent_sequence em cada workflow referencia apenas agent IDs existentes"
    - "[ ] Transitions são coerentes com o fluxo de tasks"

Performance:
  duration_expected: "3-8 minutos"
  cost_estimated: "~6000 tokens (Opus)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — workflows e squad.yaml são obrigatórios"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "5s"
  fallback: "Gerar workflow sequencial mínimo e squad.yaml com campos obrigatórios"
  notification: "orchestrator"

Metadata:
  story: "Como pipeline, preciso gerar workflows, squad.yaml, config e README a partir de agentes e tasks"
  version: "1.0.0"
  dependencies:
    - analyzeRequirements()
    - createAgents()
    - createTasks()
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# createWorkflows()

## Pipeline Diagram

```
┌──────────────┐  ┌────────────────────┐  ┌──────────────┐  ┌──────────────┐
│ analysis.md  │  │ component-registry │  │ agents/*.md  │  │ tasks/*.md   │
│              │  │ .md                │  │              │  │              │
└──────┬───────┘  └────────┬───────────┘  └──────┬───────┘  └──────┬───────┘
       │                   │                     │                 │
       └───────────┬───────┴─────────────────────┴─────────────────┘
                   │
                   ▼
          ┌──────────────────┐     ┌──────────────────┐  ┌──────────────────┐
          │  WorkflowCreator  │◀────│ templates/*.md   │  │ references/*.md  │
          │  (squad-workflow- │     │ (squad, workflow, │  │ (formats,        │
          │   creator)        │     │  config)          │  │  schemas)        │
          └────────┬──────────┘     └──────────────────┘  └──────────────────┘
                   │
       ┌───────────┼───────────┬────────────────┐
       │           │           │                │
       ▼           ▼           ▼                ▼
┌────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│ workflows/ │ │ squad    │ │ config/  │ │ README.md │
│ *.yaml     │ │ .yaml    │ │ *.md     │ │           │
└────────────┘ └──────────┘ └──────────┘ └───────────┘
```

## Descrição

A task `createWorkflows()` é a **quarta fase** do pipeline. Gera workflows AIOS, o `squad.yaml` central, arquivos de configuração e o README do squad.

### Responsabilidades

1. **Geração de Workflows** — Para cada workflow previsto no `component-registry.md`:
   - Selecionar pattern base do catálogo AIOS (sequential, fan-out, pipeline, etc.)
   - Definir `agent_sequence` com IDs de agentes existentes
   - Criar `transitions` com triggers, confidence e next_steps
   - Definir `success_indicators` baseados nos post-conditions das tasks
   - Definir `key_commands` para ativação via slash commands

2. **Geração do squad.yaml** — Arquivo central do squad com:
   - `name` (kebab-case), `version` (semver), `description`
   - `aios.minVersion`, `aios.type: squad`
   - `components` listando todos os agents, tasks, workflows e configs
   - `slashPrefix` para habilitação de slash commands

3. **Geração de Config** — Três arquivos Markdown em `config/`:
   - `coding-standards.md` — Regras de estilo, naming, testes do squad
   - `tech-stack.md` — Runtime, frameworks, dependências
   - `source-tree.md` — Estrutura de diretórios do squad

4. **Geração do README.md** — Documentação inicial com:
   - Visão geral do squad
   - Lista de agentes com roles
   - Descrição dos workflows
   - Instruções de uso básico

### Seleção de Workflow Pattern

| Pattern | Quando Usar |
|---------|-------------|
| Sequential | Fases dependem estritamente da anterior |
| Fan-out | Múltiplos agentes podem executar em paralelo |
| Pipeline | Dados fluem através de transformações encadeadas |
| Conditional | Bifurcação baseada em condição (ex: validação pass/fail) |

### Regras de Geração

- `workflow_name`: snake_case
- `agent_sequence`: apenas IDs de agentes existentes (kebab-case)
- `transitions`: cada transição tem trigger, confidence (0.0-1.0), greeting_message
- `key_commands`: prefixo `*` + kebab-case
- `squad.yaml`: validável contra squad-yaml-schema.md
- Config files: Markdown freeform, conteúdo relevante ao domínio do squad
