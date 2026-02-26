---
task: analyzeRequirements()
responsavel: "Analyzer"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: userObjective
    tipo: string
    descricao: "input do usuário (linguagem natural)"
    obrigatorio: true

Saida:
  - nome: analysisMd
    tipo: file
    descricao: "createAgents() task"
    obrigatorio: true
  - nome: componentRegistryMd
    tipo: file
    descricao: "createAgents() task + createTasks() task + createWorkflows() task"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Objetivo do usuário fornecido e não-vazio"
    - "[ ] Sessão inicializada via squad-tools.cjs init"
    - "[ ] Diretório .squad-workspace/<session>/ existe e é gravável"
  post-conditions:
    - "[ ] analysis.md criado com todas as seções obrigatórias (domínio, capacidades, roles, dependências)"
    - "[ ] component-registry.md criado com nomes canônicos de agentes, tasks e workflows"
    - "[ ] Nenhuma capacidade redundante no registry"
    - "[ ] Nomes canônicos seguem convenções (kebab-case para IDs, camelCase() para tasks)"

Performance:
  duration_expected: "2-5 minutos"
  cost_estimated: "~2000 tokens (Sonnet)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — é a primeira fase do pipeline"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "5s"
  fallback: "Solicitar esclarecimento ao usuário via protocolo de clarificação"
  notification: "orchestrator"

Metadata:
  story: "Como usuário, preciso que meu objetivo em linguagem natural seja decomposto em estrutura de squad"
  version: "1.0.0"
  dependencies: []
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# analyzeRequirements()

## Pipeline Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│  userObjective   │────▶│    Analyzer       │────▶│  analysis.md            │
│  (string)        │     │  (squad-analyzer) │     │  component-registry.md  │
└─────────────────┘     └──────────────────┘     └─────────────────────────┘
                              │                          │
                              │  Fase 1                  │  Alimenta Fases 2, 3, 4
                              ▼                          ▼
                        ┌──────────┐              ┌──────────────┐
                        │ Domínio  │              │ Nomes        │
                        │ Análise  │              │ Canônicos    │
                        │ Roles    │              │ IDs          │
                        │ Deps     │              │ Contratos    │
                        └──────────┘              └──────────────┘
```

## Descrição

A task `analyzeRequirements()` é a **primeira fase** do pipeline de geração de squads. Recebe um objetivo em linguagem natural do usuário e o decompõe em uma análise estruturada de domínio.

### Responsabilidades

1. **Análise de Domínio** — Identificar o domínio principal (ex: data engineering, DevOps, design system) e subdomínios relevantes.

2. **Decomposição de Capacidades** — Listar cada capacidade atômica que o squad precisa cobrir. Cada capacidade deve ser indivisível e não-redundante.

3. **Proposição de Roles** — Mapear capacidades para roles (futuros agentes). Se duas capacidades podem ser cobertas pelo mesmo role, consolidar.

4. **Dependency Graph** — Estabelecer dependências entre roles, identificando quais precisam executar antes de outros.

5. **Seleção de Workflow Patterns** — Recomendar patterns do catálogo AIOS (sequential, fan-out, pipeline, etc.) com base no domínio.

6. **Escaneamento de Contexto** — Se o projeto-alvo já existe, escanear sua estrutura técnica (tech stack, convenções, diretórios) para informar a análise.

### Outputs Gerados

- **analysis.md** — Documento completo com domínio, capacidades, roles, dependency graph, workflow patterns recomendados e contexto técnico.

- **component-registry.md** — Registry centralizado com nomes canônicos que todos os agentes subsequentes devem usar. Define:
  - `agent.name` (PascalCase) e `agent.id` (kebab-case) de cada role
  - `task` identifiers (camelCase()) de cada task prevista
  - `workflow_name` (snake_case) de cada workflow previsto
  - Mapeamento role → capacidades

### Protocolo de Clarificação

Se o objetivo do usuário for ambíguo ou insuficiente, o Analyzer deve:
1. Identificar as lacunas específicas
2. Formular perguntas diretas (máximo 3)
3. Aguardar resposta antes de prosseguir

### Critérios de Qualidade

- Zero capacidades redundantes
- Cada role cobre pelo menos 1 capacidade única
- Dependency graph é um DAG válido (sem ciclos)
- Nomes canônicos são consistentes e seguem convenções AIOS
