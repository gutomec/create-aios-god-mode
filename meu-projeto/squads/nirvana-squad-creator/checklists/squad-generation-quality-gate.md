# Squad Generation Quality Gate Checklist

> Quality gate obrigatório para squads gerados pelo pipeline NSC.
> Executado na Fase 6 (Validator) antes de avançar para README multilíngue.
> Squad: nirvana-squad-creator
> Created: 2026-02-24

---

## Pre-Conditions

Before starting, verify:

- [ ] Pipeline completou Fases 1-5 (analyze → optimize)
- [ ] optimization-report.md existe e foi revisado
- [ ] Todos os diretórios de artefatos populados: agents/, tasks/, workflows/, config/

---

## Checklist Items

### Category 1: Manifest Integrity

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 1.1 | squad.yaml existe e YAML é válido | [ ] | blocking | |
| 1.2 | `name` é kebab-case | [ ] | blocking | |
| 1.3 | `version` é semver válido (X.Y.Z) | [ ] | blocking | |
| 1.4 | `description` não-vazio (mín. 10 chars) | [ ] | blocking | |
| 1.5 | `aios.minVersion` definido (>= 2.1.0) | [ ] | blocking | |
| 1.6 | `aios.type` é "squad" | [ ] | blocking | |
| 1.7 | `components` lista todos os arquivos existentes em disco | [ ] | blocking | |
| 1.8 | Nenhum arquivo em disco ausente do manifest | [ ] | recommended | |

### Category 2: Agent Definitions

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 2.1 | Todo agent tem `agent.name`, `agent.id`, `agent.title`, `agent.icon` | [ ] | blocking | |
| 2.2 | `agent.id` é kebab-case e único no squad | [ ] | blocking | |
| 2.3 | `agent.whenToUse` definido (20+ chars) | [ ] | blocking | |
| 2.4 | `persona_profile.archetype` é valor válido | [ ] | recommended | |
| 2.5 | `greeting_levels` com 3 níveis (minimal, named, archetypal) | [ ] | recommended | |
| 2.6 | `commands` incluem `*help` e `*exit` | [ ] | blocking | |
| 2.7 | Todo command com task referencia arquivo existente | [ ] | blocking | |

### Category 3: Task Definitions

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 3.1 | Todo task tem frontmatter YAML com: task, responsavel, responsavel_type, atomic_layer | [ ] | blocking | |
| 3.2 | `task` segue formato camelCase() | [ ] | blocking | |
| 3.3 | `Entrada` e `Saida` definidos com campos obrigatórios | [ ] | blocking | |
| 3.4 | `Checklist` com pre-conditions e post-conditions | [ ] | blocking | |
| 3.5 | `responsavel` referencia agent.name existente | [ ] | blocking | |
| 3.6 | Performance section definido | [ ] | recommended | |
| 3.7 | Error Handling section definido | [ ] | recommended | |

### Category 4: Workflow Definitions

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 4.1 | Todo workflow tem: workflow_name, description, agent_sequence | [ ] | blocking | |
| 4.2 | `workflow_name` é snake_case | [ ] | blocking | |
| 4.3 | `agent_sequence` contém apenas IDs de agentes existentes | [ ] | blocking | |
| 4.4 | Transitions têm trigger e confidence | [ ] | recommended | |
| 4.5 | success_indicators definidos | [ ] | recommended | |

### Category 5: Config & Documentation

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 5.1 | config/coding-standards.md existe e não-vazio | [ ] | blocking | |
| 5.2 | config/tech-stack.md existe e não-vazio | [ ] | blocking | |
| 5.3 | config/source-tree.md existe e não-vazio | [ ] | blocking | |
| 5.4 | README.md existe com descrição do squad | [ ] | blocking | |

### Category 6: Cross-References

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 6.1 | Todo `responsavel` de task referencia agent.name existente | [ ] | blocking | |
| 6.2 | Todo agent ID em workflow agent_sequence existe em agents/ | [ ] | blocking | |
| 6.3 | Todo `Entrada[].origen` que referencia outra task é válido | [ ] | blocking | |
| 6.4 | Todo `Saida[].destino` que referencia outra task é válido | [ ] | blocking | |
| 6.5 | Sem referências circulares entre tasks | [ ] | recommended | |

---

## Post-Conditions

After completion, verify:

- [ ] Validation report gerado com status PASSED ou FAILED
- [ ] 6 categorias verificadas com status individual
- [ ] Se FAILED: lista de erros com localização e correção sugerida
- [ ] Se PASSED: pipeline avança para Fase 7 (README multilíngue)

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% blocking items pass | **PASSED** | Avançar para Fase 7 |
| 1+ blocking item fail | **FAILED** | Retornar ao orquestrador para correção |

**Blocking items:** 22
**Recommended items:** 8
**Total:** 30

---

## Usage

```bash
# Use this checklist with:
*checklist squad-generation-quality-gate

# Or reference in tasks:
checklist: squad-generation-quality-gate.md

# Invoked automatically by:
# validateSquad() → Phase 6 of NSC pipeline
```

---

*Checklist created by squad-creator — Craft*
