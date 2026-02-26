---
task: optimizeSquad()
responsavel: "Optimizer"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: allGeneratedFiles
    tipo: array<file>
    descricao: "createAgents() + createTasks() + createWorkflows() task outputs"
    obrigatorio: true

Saida:
  - nome: optimizationReportMd
    tipo: file
    descricao: "validateSquad() task"
    obrigatorio: true
  - nome: modifiedFiles
    tipo: array<file>
    descricao: "validateSquad() task"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Todos os artefatos do pipeline existem: agents/, tasks/, workflows/, config/, squad.yaml"
    - "[ ] component-registry.md disponível para referência de nomes canônicos"
    - "[ ] IDEATION.md disponível com notas de redundância do AgentCreator"
  post-conditions:
    - "[ ] optimization-report.md gerado com todas as ações tomadas"
    - "[ ] AgentDropout aplicado — agentes redundantes removidos ou consolidados"
    - "[ ] Cross-references corrigidos em todos os artefatos modificados"
    - "[ ] Model routing otimizado (Opus para tarefas criativas, Sonnet para validação)"
    - "[ ] Nenhum agente órfão (sem task associada) permanece"
    - "[ ] Nenhuma task órfã (sem agente responsável) permanece"

Performance:
  duration_expected: "2-5 minutos"
  cost_estimated: "~4000 tokens (Opus)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — otimização é obrigatória antes da validação"

Error Handling:
  strategy: fallback
  fallback: "Se otimização falhar, gerar relatório indicando 'no changes needed' e passar artefatos originais"
  notification: "orchestrator"

Metadata:
  story: "Como pipeline, preciso eliminar redundâncias e otimizar o squad antes da validação"
  version: "1.0.0"
  dependencies:
    - createAgents()
    - createTasks()
    - createWorkflows()
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# optimizeSquad()

## Pipeline Diagram

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ agents/*.md  │  │ tasks/*.md   │  │ workflows/   │  │ squad.yaml   │
│              │  │              │  │ *.yaml       │  │ config/*.md  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │                  │
       └─────────┬───────┴─────────────────┴──────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   Optimizer      │
        │  (squad-         │
        │   optimizer)     │
        └────────┬─────────┘
                 │
        ┌────────┴────────────────┐
        │                         │
        ▼                         ▼
 ┌────────────────────┐   ┌──────────────────┐
 │ optimization-      │   │ Arquivos         │
 │ report.md          │   │ Modificados      │
 │                    │   │ (agents, tasks,  │
 │ - AgentDropout     │   │  workflows,      │
 │ - Model Routing    │   │  squad.yaml)     │
 │ - Cross-refs       │   │                  │
 └────────────────────┘   └──────────────────┘
```

## Descrição

A task `optimizeSquad()` é a **quinta fase** do pipeline. É o único agente com permissão para editar artefatos gerados por outros agentes. Aplica técnicas de otimização para eliminar redundâncias e melhorar a eficiência do squad.

### Responsabilidades

1. **AgentDropout** — Identificar e eliminar agentes redundantes:
   - Detectar agentes com capacidades sobrepostas (>70% overlap)
   - Consolidar agentes similares mantendo a melhor definição
   - Atualizar todas as referências nos artefatos afetados
   - Registrar cada dropout no relatório com justificativa

2. **Model Routing** — Otimizar alocação de modelos:
   - Opus para tarefas criativas e complexas (geração, design)
   - Sonnet para tarefas analíticas e validação
   - Haiku para tarefas simples e repetitivas
   - Registrar recomendações no relatório

3. **Cross-Reference Fix** — Corrigir referências cruzadas:
   - Se um agente foi removido, atualizar tasks que o referenciam
   - Se uma task foi renomeada, atualizar workflows e agent dependencies
   - Validar que todos os IDs em `agent_sequence` de workflows existem
   - Validar que todos os `responsavel` de tasks referenciam agentes existentes

4. **Detecção de Órfãos** — Identificar componentes sem conexão:
   - Agentes sem nenhuma task associada
   - Tasks sem agente responsável
   - Workflows com agentes inexistentes na sequence

5. **Relatório de Otimização** — Gerar `optimization-report.md` com:
   - Resumo de ações tomadas
   - AgentDropout: agentes removidos/consolidados com justificativa
   - Model Routing: recomendações de modelo por agente
   - Cross-references: correções aplicadas
   - Métricas: contagem de agentes antes/depois, tasks antes/depois

### Regras de Edição

- O Optimizer é o **único agente** com permissão de editar arquivos de outros agentes
- Toda edição é registrada no relatório com justificativa
- Nenhuma edição pode quebrar o encadeamento de contratos Entrada/Saída
- Se uma consolidação é ambígua, preservar ambos os agentes e sinalizar para revisão humana

