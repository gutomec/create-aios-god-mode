---
task: validateSquad()
responsavel: "Validator"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: allGeneratedFiles
    tipo: array<file>
    descricao: "optimizeSquad() task output (modifiedFiles + unmodified)"
    obrigatorio: true
  - nome: allReferences
    tipo: array<file>
    descricao: "references/*.md (agent-format, task-format, workflow-format, squad-yaml-schema, config-format)"
    obrigatorio: true

Saida:
  - nome: validationReportMd
    tipo: file
    descricao: "createMultilingualReadme() task (se PASSED) ou orquestrador (se FAILED)"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] optimization-report.md existe e foi revisado"
    - "[ ] Todos os artefatos presentes: agents/, tasks/, workflows/, config/, squad.yaml, README.md"
    - "[ ] Referências de formato disponíveis para todas as 6 categorias"
  post-conditions:
    - "[ ] validation-report.md gerado com status PASSED ou FAILED"
    - "[ ] 6 categorias verificadas: agents, tasks, workflows, squad.yaml, config, cross-references"
    - "[ ] Cada categoria tem status individual (PASSED/FAILED) com detalhes"
    - "[ ] Se FAILED, lista de erros específicos com localização e correção sugerida"
    - "[ ] Se PASSED, pipeline pode avançar para Fase 7 (README multilíngue)"

Performance:
  duration_expected: "1-3 minutos"
  cost_estimated: "~2000 tokens (Sonnet)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — validação é gate obrigatório antes do deploy"

Error Handling:
  strategy: abort
  fallback: "Se validação encontrar erros, retornar relatório FAILED ao orquestrador para re-execução das fases afetadas"
  notification: "orchestrator"

Metadata:
  story: "Como pipeline, preciso validar que o squad gerado está 100% correto antes do deploy"
  version: "1.0.0"
  dependencies:
    - optimizeSquad()
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# validateSquad()

## Pipeline Diagram

```
┌──────────────────────────────────────────────────┐
│           Todos os Artefatos Gerados              │
│  agents/ + tasks/ + workflows/ + config/          │
│  squad.yaml + README.md + optimization-report.md  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐     ┌──────────────────┐
            │   Validator      │◀────│ references/*.md  │
            │  (squad-         │     │ (5 format specs) │
            │   validator)     │     └──────────────────┘
            └────────┬─────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
     ┌─────────────┐  ┌─────────────┐
     │   PASSED     │  │   FAILED    │
     │              │  │              │
     │ → Fase 7     │  │ → Retorno   │
     │   README     │  │   ao orques-│
     │   multilíngue│  │   trador    │
     └─────────────┘  └─────────────┘
```

## Descrição

A task `validateSquad()` é a **sexta fase** do pipeline e funciona como **gate obrigatório**. Nenhum artefato é deployado sem passar por esta validação.

### Responsabilidades

1. **Validação de Agents** — Para cada arquivo em `agents/`:
   - Campos required presentes: `agent.name`, `agent.id`, `agent.title`, `agent.icon`, `agent.whenToUse`
   - `persona_profile.archetype` é um dos valores válidos
   - `persona_profile.communication.tone` definido
   - `greeting_levels` com 3 níveis (minimal, named, archetypal)
   - `agent.id` é kebab-case e único

2. **Validação de Tasks** — Para cada arquivo em `tasks/`:
   - Campos required: `task`, `responsavel`, `responsavel_type`, `atomic_layer`, `Entrada`, `Saida`, `Checklist`
   - `task` segue formato camelCase()
   - `responsavel_type` é enum válido
   - `atomic_layer` é valor válido
   - Cada item de Entrada/Saída tem os 4 campos obrigatórios

3. **Validação de Workflows** — Para cada arquivo em `workflows/`:
   - Campos required: `workflow_name`, `description`, `agent_sequence`, `success_indicators`
   - `workflow_name` é snake_case
   - `agent_sequence` contém apenas IDs de agentes existentes
   - Transitions têm trigger, confidence, greeting_message

4. **Validação do squad.yaml**:
   - Campos required: `name`, `version`, `description`, `aios.minVersion`, `aios.type`
   - `name` é kebab-case
   - `version` é semver válido
   - `components` lista todos os artefatos existentes

5. **Validação de Config**:
   - `coding-standards.md`, `tech-stack.md`, `source-tree.md` existem
   - Cada arquivo tem conteúdo não-vazio

6. **Cross-References**:
   - Todo `responsavel` de task referencia `agent.name` existente
   - Todo agent ID em `agent_sequence` de workflow existe em `agents/`
   - Todo `Entrada[].origen` que referencia outra task é válido
   - Todo `Saida[].destino` que referencia outra task é válido
   - `components` do squad.yaml lista todos os arquivos que existem no diretório

### Formato do Relatório

```markdown
# Validation Report

**Status:** PASSED | FAILED
**Date:** ISO-8601
**Session:** <session-name>

## Summary
| Category | Status | Issues |
|----------|--------|--------|
| Agents | PASSED/FAILED | N issues |
| Tasks | PASSED/FAILED | N issues |
| Workflows | PASSED/FAILED | N issues |
| squad.yaml | PASSED/FAILED | N issues |
| Config | PASSED/FAILED | N issues |
| Cross-References | PASSED/FAILED | N issues |

## Details
[Detalhes por categoria com erros específicos, localização e correção sugerida]
```

### Regras de Gate

- **PASSED**: Todas as 6 categorias aprovadas → pipeline avança para Fase 7
- **FAILED**: Qualquer categoria reprovada → relatório retorna ao orquestrador
- O orquestrador decide se re-executa fases específicas ou solicita correção manual

