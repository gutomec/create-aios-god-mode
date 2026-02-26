---
task: auditFramework()
responsavel: "Sentinel"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: scope
    tipo: string
    descricao: "Escopo da auditoria: full|constitution|quality|ids|cross-refs"
    obrigatorio: true
  - nome: targetPath
    tipo: string
    descricao: "Caminho específico para auditar (opcional — se omitido, audita todo o projeto)"
    obrigatorio: false

Saida:
  - nome: auditReport
    tipo: file
    descricao: "Relatório abrangente de auditoria com findings categorizados"
    obrigatorio: true
  - nome: actionItems
    tipo: file
    descricao: "Lista priorizada de ações corretivas com severidade e esforço estimado"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Projeto AIOS existe e está acessível"
    - "[ ] Diretório .aios-core/ presente com estrutura completa"
    - "[ ] Escopo de auditoria especificado e válido"
    - "[ ] Constituição AIOS acessível para verificação"
  post-conditions:
    - "[ ] Auditoria cobre todo o escopo solicitado"
    - "[ ] Action items estão priorizados por severidade (CRITICAL > HIGH > MEDIUM > LOW)"
    - "[ ] Cada finding tem localização, descrição e remediação sugerida"
    - "[ ] Métricas de saúde do framework calculadas"
    - "[ ] Relatório inclui pontuação geral de compliance"

Performance:
  duration_expected: "5-15 minutos"
  cost_estimated: "~8000 tokens"
  cacheable: true
  parallelizable: true
  skippable_when: "Nunca — auditoria é o health check do framework"

Error Handling:
  strategy: partial-continue
  fallback: "Se uma categoria de auditoria falhar, continuar com as demais e marcar a categoria como SKIPPED no relatório"
  notification: "orchestrator"

Metadata:
  story: "Como framework, preciso de auditorias regulares para garantir saúde e conformidade de todos os artefatos"
  version: "1.0.0"
  dependencies:
    - validateArtifact()
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# auditFramework()

## Pipeline Diagram

```
┌─────────────────┐
│ scope            │
│ targetPath       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                   Sentinel                           │
│                (aios-sentinel)                       │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │Constitution│ │  Quality   │ │    IDS     │      │
│  │  Audit     │ │   Gates    │ │  Registry  │      │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘      │
│        │              │              │               │
│  ┌─────┴──────┐ ┌─────┴──────┐ ┌────┴───────┐      │
│  │Cross-Refs  │ │  Orphans   │ │ Deprecated │      │
│  │ Integrity  │ │ Detection  │ │  Patterns  │      │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘      │
│        └──────────┬────┴──────────────┘              │
│                   │                                  │
└───────────────────┼──────────────────────────────────┘
                    │
           ┌────────┴────────┐
           │                 │
     ┌─────┴──────┐   ┌─────┴──────┐
     │ audit-     │   │ action-    │
     │ report.md  │   │ items.md   │
     └────────────┘   └────────────┘
```

## Descrição

A task `auditFramework()` é a **verificação de saúde abrangente** do AIOS. Executa uma auditoria profunda cobrindo todos os aspectos do framework, identificando problemas, inconsistências e oportunidades de melhoria.

### Responsabilidades

1. **Auditoria Constitucional** (`scope: constitution` ou `full`):
   - Verificar compliance dos 6 artigos em **todos** os artefatos
   - Produzir scorecard por artigo com taxa de compliance (%)
   - Identificar violações específicas com localização e descrição
   - Priorizar violações por impacto no framework

2. **Auditoria de Quality Gates** (`scope: quality` ou `full`):
   - Verificar cobertura das 3 camadas de quality gate
   - Identificar artefatos sem error handling definido
   - Verificar que todas as tasks têm pre/post-conditions
   - Verificar que todos os workflows têm success_indicators
   - Medir taxa de cobertura de testes

3. **Auditoria IDS** (`scope: ids` ou `full`):
   - Verificar consistência do IDS registry
   - Identificar duplicatas de funcionalidade
   - Verificar aderência ao princípio REUSE > ADAPT > CREATE
   - Validar versionamento semver de todos os componentes
   - Detectar IDs colisionantes ou inválidos

4. **Auditoria de Referências Cruzadas** (`scope: cross-refs` ou `full`):
   - Mapear cadeia completa agent → task → workflow
   - Identificar artefatos órfãos (definidos mas nunca referenciados)
   - Identificar artefatos fantasma (referenciados mas não definidos)
   - Validar contratos Entrada/Saida entre tasks
   - Verificar que squad.yaml lista todos os artefatos existentes

5. **Detecção de Padrões Deprecated** (apenas `scope: full`):
   - Identificar padrões de código obsoletos
   - Verificar convenções de nomenclatura contra padrão atual
   - Detectar formatos de YAML desatualizados
   - Identificar integrações com Claude Code usando APIs descontinuadas

### Escopos de Auditoria

| Escopo | Categorias Cobertas | Duração Estimada |
|--------|---------------------|------------------|
| `full` | Todas as 5 categorias | 10-15 minutos |
| `constitution` | Apenas compliance constitucional | 3-5 minutos |
| `quality` | Apenas quality gates | 3-5 minutos |
| `ids` | Apenas IDS registry | 2-3 minutos |
| `cross-refs` | Apenas referências cruzadas | 3-5 minutos |

### Formato do Relatório de Auditoria

```markdown
# AIOS Framework Audit Report

**Date:** ISO-8601
**Scope:** {scope}
**Target:** {targetPath ou "Full Project"}
**Overall Score:** {0-100}%

## Executive Summary
[Resumo em 3-5 linhas com principais findings]

## Scorecard
| Categoria | Score | Findings | Critical | High | Medium | Low |
|-----------|-------|----------|----------|------|--------|-----|
| Constitution | 85% | 12 | 0 | 2 | 5 | 5 |
| Quality Gates | 90% | 8 | 0 | 1 | 3 | 4 |
| IDS Registry | 95% | 3 | 0 | 0 | 1 | 2 |
| Cross-References | 80% | 15 | 1 | 3 | 6 | 5 |
| Deprecated | 70% | 20 | 2 | 5 | 8 | 5 |

## Detailed Findings
[Findings organizados por categoria com localização, severidade e remediação]

## Health Metrics
[Métricas quantitativas: total de artefatos, taxa de compliance, cobertura de testes, etc.]
```

### Formato da Lista de Action Items

```markdown
# Action Items — AIOS Framework Audit

**Generated:** ISO-8601
**Total Items:** N
**Priority Distribution:** N critical, N high, N medium, N low

## Critical (Fix Immediately)
- [ ] {Descrição} — {Localização} — Esforço: {estimativa}

## High (Fix This Sprint)
- [ ] {Descrição} — {Localização} — Esforço: {estimativa}

## Medium (Fix This Cycle)
- [ ] {Descrição} — {Localização} — Esforço: {estimativa}

## Low (Backlog)
- [ ] {Descrição} — {Localização} — Esforço: {estimativa}
```

### Integração com Pipeline

- **Trigger**: Comando `*audit` via Oracle ou execução direta
- **Frequência recomendada**: Após cada ciclo de desenvolvimento ou antes de releases
- **Action items**: Podem ser convertidos em stories para o backlog
- Se findings CRITICAL são encontrados, Oracle é notificado imediatamente
