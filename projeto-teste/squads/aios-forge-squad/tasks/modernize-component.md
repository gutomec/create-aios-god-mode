---
task: modernizeComponent()
responsavel: "Catalyst"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: componentPath
    tipo: string
    descricao: "Caminho do componente AIOS a ser modernizado"
    obrigatorio: true
  - nome: targetStandard
    tipo: string
    descricao: "Padrão alvo: latest|specific-version (ex: 2.1.0)"
    obrigatorio: true
  - nome: scope
    tipo: string
    descricao: "Escopo da modernização: format|patterns|dependencies"
    obrigatorio: true

Saida:
  - nome: modernizedComponent
    tipo: file
    descricao: "Componente modernizado seguindo o padrão alvo"
    obrigatorio: true
  - nome: migrationLog
    tipo: file
    descricao: "Log detalhado de todas as mudanças aplicadas com before/after"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Componente existe e é acessível no caminho especificado"
    - "[ ] Padrão alvo é conhecido e documentado"
    - "[ ] Backup do componente original criado antes de qualquer modificação"
    - "[ ] Componente é de camada mutável (L3 ou L4) ou possui autorização explícita"
    - "[ ] Escopo é um dos 3 valores válidos: format, patterns, dependencies"
  post-conditions:
    - "[ ] Componente segue o padrão alvo completamente para o escopo definido"
    - "[ ] Todas as mudanças documentadas no migration log com before/after"
    - "[ ] Nenhuma referência cruzada quebrada"
    - "[ ] Componente modernizado passa na validação do validateArtifact()"
    - "[ ] Funcionalidade original preservada — modernização é cosmética/estrutural"

Performance:
  duration_expected: "3-8 minutos"
  cost_estimated: "~5000 tokens"
  cacheable: false
  parallelizable: false
  skippable_when: "Quando componente já está no padrão mais recente para o escopo solicitado"

Error Handling:
  strategy: rollback
  fallback: "Retornar componente original com migration log parcial indicando onde parou e o que falta"
  notification: "orchestrator"

Metadata:
  story: "Como framework, preciso que componentes legados sejam atualizados para padrões modernos sem perda de funcionalidade"
  version: "1.0.0"
  dependencies:
    - analyzeAiosComponent()
    - validateArtifact()
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# modernizeComponent()

## Pipeline Diagram

```
┌─────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ componentPath   │────▶│    Catalyst        │◀────│ Target Standard   │
│ targetStandard  │     │  (aios-catalyst)   │     │ (latest specs)    │
│ scope           │     └────────┬───────────┘     └───────────────────┘
└─────────────────┘              │
                         ┌───────┴───────┐
                         │   Backup      │
                         │   Original    │
                         └───────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────┴─────┐ ┌───┴────┐ ┌─────┴─────┐
              │  Detect   │ │ Apply  │ │  Verify   │
              │  Gaps     │ │Migrate │ │  Result   │
              └─────┬─────┘ └───┬────┘ └─────┬─────┘
                    │           │             │
                    └───────────┼─────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                 ┌─────┴──────┐   ┌──────┴─────┐
                 │ modernized │   │ migration  │
                 │ Component  │   │ Log.md     │
                 └────────────┘   └────────────┘
```

## Descrição

A task `modernizeComponent()` é a **ferramenta de evolução** do AIOS Forge Squad. Atualiza componentes legados ou desatualizados para os padrões mais recentes do framework, garantindo que todo o ecossistema se mantenha coerente e moderno.

### Responsabilidades

1. **Detecção de Gaps** — Compara o componente atual contra o padrão alvo e identifica todas as diferenças por escopo:

   #### Escopo: `format`
   - Versão do YAML frontmatter vs padrão atual
   - Seções obrigatórias ausentes ou renomeadas
   - Estrutura de campos vs schema esperado
   - Convenções de nomenclatura (camelCase, kebab-case, snake_case)
   - Encoding (UTF-8 sem BOM)
   - Acentuação PT-BR em conteúdo textual

   #### Escopo: `patterns`
   - Padrões de código deprecated em uso
   - Patterns de error handling desatualizados
   - Padrões de integração Claude Code antigos
   - Convenções de handoff artifacts obsoletas
   - Padrões de greeting_levels vs formato atual
   - Padrões de commands vs formato Fev 2026

   #### Escopo: `dependencies`
   - Versões de dependências vs versões atuais
   - Dependências deprecated ou removidas
   - Novas dependências recomendadas para funcionalidade existente
   - Compatibilidade de versões entre dependências

2. **Aplicação de Migração** — Aplica mudanças incrementalmente:
   - Cada mudança é atômica e reversível
   - Mudanças são aplicadas na ordem de menor risco para maior risco
   - Cada mudança é verificada antes de prosseguir para a próxima
   - Se uma mudança falhar, as anteriores permanecem (parcial é aceitável)

3. **Verificação de Resultado** — Após todas as migrações:
   - Componente modernizado é válido sintaticamente
   - Referências cruzadas permanecem intactas
   - Funcionalidade original é preservada
   - Componente segue o padrão alvo para o escopo definido

### Mapa de Modernizações por Padrão

| Versão | Mudanças de `format` | Mudanças de `patterns` | Mudanças de `dependencies` |
|--------|---------------------|----------------------|--------------------------|
| 2.0.x → 2.1.x | greeting_levels obrigatório, atomic_layer em tasks | Handoff compaction protocol, agent-memory imports | AIOS Core 2.1.0, Node.js 18+ |
| Pre-2.0 → 2.1.x | Reestruturação completa de frontmatter, adição de Performance/Error Handling | Todos os patterns modernos | Atualização completa |
| latest (Fev 2026) | Claude Code integration patterns atualizados | Skills, Teams, Hooks, Rules | Claude Opus 4.6 patterns |

### Formato do Migration Log

```markdown
# Migration Log — {componentName}

**Date:** ISO-8601
**From:** {versão/padrão atual}
**To:** {targetStandard}
**Scope:** {scope}
**Status:** COMPLETE | PARTIAL | FAILED

## Summary
| Categoria | Mudanças Aplicadas | Mudanças Pendentes |
|-----------|-------------------|-------------------|
| {escopo} | N | N |

## Changes Applied
### Change 1: {título}
- **Before:** `{conteúdo original}`
- **After:** `{conteúdo modernizado}`
- **Reason:** {justificativa da mudança}

### Change 2: {título}
...

## Changes Pending (se PARTIAL)
1. {Descrição} — Motivo: {razão do pendente}

## Validation
- Format compliance: PASSED/FAILED
- Cross-references: PASSED/FAILED
- Functionality preserved: PASSED/FAILED
```

### Regras de Rollback

- Se a modernização causar falha na validação → rollback automático
- Se referências cruzadas quebrarem → rollback automático
- Se funcionalidade for perdida → rollback automático
- Em rollback, migration log é preservado com status FAILED e detalhes do erro

### Integração com Pipeline

- **optimize-framework workflow**: modernizeComponent() é executada pelo Catalyst na Fase 4
- Pós-modernização, componente é validado por validateArtifact()
- Se validação falhar, rollback é executado e Oracle é notificado
- Scout pode alimentar modernizeComponent() com dados de researchUpdates() sobre novos padrões
