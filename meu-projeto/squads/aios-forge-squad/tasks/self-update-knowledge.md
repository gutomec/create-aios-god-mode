---
task: selfUpdateKnowledge()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: scope
    tipo: string
    descricao: "Escopo da atualização: claude-code|aios|all"
    obrigatorio: true
  - nome: forceRefresh
    tipo: boolean
    descricao: "Se true, ignora cache e pesquisa tudo novamente (default: false)"
    obrigatorio: false

Saida:
  - nome: updateLog
    tipo: file
    descricao: "Log de tudo que foi atualizado com timestamps e fontes"
    obrigatorio: true
  - nome: knowledgeBase
    tipo: file
    descricao: "Base de conhecimento atualizada do squad"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Acesso web disponível (WebSearch e/ou WebFetch funcionais)"
    - "[ ] Datetime atual obtido via worldtimeapi.org"
    - "[ ] Escopo definido e válido (claude-code, aios ou all)"
    - "[ ] Knowledge base existente acessível para comparação"
  post-conditions:
    - "[ ] Base de conhecimento está atualizada com as informações mais recentes"
    - "[ ] Update log tem timestamps e fontes para cada mudança"
    - "[ ] Nenhuma contradição na base de conhecimento"
    - "[ ] Informações deprecated estão marcadas como tal (não removidas)"
    - "[ ] Diff entre versão anterior e nova está documentado"

Performance:
  duration_expected: "5-15 minutos"
  cost_estimated: "~8000 tokens"
  cacheable: false
  parallelizable: true
  skippable_when: "Quando forceRefresh é false e última atualização tem menos de 24h"

Error Handling:
  strategy: partial-continue
  fallback: "Atualizar apenas escopos onde pesquisa teve sucesso, marcar demais como PENDING"
  notification: "orchestrator"

Metadata:
  story: "Como squad, preciso manter minha base de conhecimento sempre atualizada para operar com informações corretas"
  version: "1.0.0"
  dependencies:
    - researchUpdates()
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# selfUpdateKnowledge()

## Pipeline Diagram

```
┌─────────────────┐     ┌──────────────────────┐
│ scope           │────▶│       Scout           │
│ forceRefresh    │     │    (aios-scout)       │
└─────────────────┘     └──────────┬────────────┘
                                   │
                           ┌───────┴───────┐
                           │  1. Check     │
                           │  Datetime     │
                           │  (worldtime)  │
                           └───────┬───────┘
                                   │
                      ┌────────────┼────────────┐
                      │            │            │
                ┌─────┴─────┐ ┌───┴────┐ ┌─────┴─────┐
                │ 2. Claude │ │3. AIOS │ │ 4. Compare│
                │    Code   │ │Updates │ │   & Merge │
                │  Research │ │Research│ │           │
                └─────┬─────┘ └───┬────┘ └─────┬─────┘
                      │           │             │
                      └───────────┼─────────────┘
                                  │
                         ┌────────┴────────┐
                         │  5. Apply       │
                         │  Incremental    │
                         │  Updates        │
                         └────────┬────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                   ┌─────┴──────┐   ┌──────┴─────┐
                   │ update     │   │ knowledge  │
                   │ Log.md     │   │ Base.md    │
                   └────────────┘   └────────────┘
```

## Descrição

A task `selfUpdateKnowledge()` é a **capacidade de auto-evolução** do AIOS Forge Squad. Mantém a base de conhecimento do squad sempre atualizada com as últimas informações sobre Claude Code, AIOS e o ecossistema, garantindo que todos os agentes operam com dados corretos e atuais.

### Responsabilidades

1. **Verificação de Datetime Atual**:
   ```bash
   curl -s http://worldtimeapi.org/api/timezone/America/Sao_Paulo
   ```
   - Registra datetime como referência para o ciclo de atualização
   - Se API indisponível, usa datetime do sistema com aviso
   - Compara com último datetime de atualização para calcular período

2. **Pesquisa Claude Code** (`scope: claude-code` ou `all`):
   - Documentação oficial: code.claude.com/docs
   - Notas de release: anthropic.com/news
   - Features do CLI: comandos, flags, opções novas
   - Sistema de agentes: custom agents, teams, squads, skills
   - MCP: novos servers, mudanças em APIs
   - Hooks e Rules: novas capacidades
   - Modelos: novos modelos, mudanças de comportamento, deprecações

3. **Pesquisa AIOS** (`scope: aios` ou `all`):
   - GitHub: github.com/SynkraAI/aios-core
   - Changelogs e release notes
   - Novas tasks, workflows, agentes oficiais
   - Mudanças na constituição ou regras
   - Atualizações no IDS, quality gates, graph dashboard
   - Novas integrações e extensões

4. **Comparação com Knowledge Base Existente**:
   - Para cada finding, verificar se já existe na base atual
   - Classificar como: NEW (não existia), UPDATED (existia mas mudou), CONFIRMED (igual), DEPRECATED (removido na fonte)
   - Detectar contradições entre informação nova e existente
   - Resolver contradições priorizando fontes oficiais mais recentes

5. **Aplicação Incremental de Updates**:
   - **NEW**: Adicionar à base de conhecimento com fonte e data
   - **UPDATED**: Atualizar entrada existente, preservar histórico no diff
   - **CONFIRMED**: Atualizar timestamp de verificação
   - **DEPRECATED**: Marcar como deprecated (não remover), adicionar nota com data e razão
   - Nunca sobrescrever — sempre incremental com rastreabilidade

6. **Log de Atualização**:
   - Cada mudança tem timestamp, fonte, tipo e diff
   - Log é append-only — nunca edita entradas anteriores
   - Serve como audit trail completo do conhecimento do squad

### Formato do Update Log

```markdown
# Knowledge Update Log

**Cycle:** {cycleId}
**Date:** ISO-8601 (datetime verificado)
**Scope:** {scope}
**Force Refresh:** {yes/no}
**Period:** {lastUpdateDatetime} → {currentDatetime}

## Summary
| Tipo | Quantidade |
|------|-----------|
| NEW | N |
| UPDATED | N |
| CONFIRMED | N |
| DEPRECATED | N |
| CONTRADICTIONS RESOLVED | N |

## Changes

### NEW: {título}
- **Source:** [{nome}]({URL})
- **Date Found:** ISO-8601
- **Category:** {claude-code|aios|ecosystem}
- **Content:** {conteúdo adicionado}

### UPDATED: {título}
- **Source:** [{nome}]({URL})
- **Date Found:** ISO-8601
- **Before:** {conteúdo anterior}
- **After:** {conteúdo atualizado}
- **Reason:** {razão da mudança}

### DEPRECATED: {título}
- **Source:** [{nome}]({URL})
- **Date Found:** ISO-8601
- **Reason:** {razão da deprecação}
...
```

### Formato da Knowledge Base

```markdown
# AIOS Forge Squad — Knowledge Base

**Last Updated:** ISO-8601
**Total Entries:** N
**Update Cycle:** {cycleId}

## Claude Code
### CLI Features
[Lista de features com versão e status]

### Agent System
[Custom agents, teams, squads, skills]

### MCP Servers
[Lista de servers conhecidos com status]

### Models
[Modelos disponíveis com capabilities]

## AIOS Framework
### Core
[Versão atual, estrutura, constituição]

### Agents
[11 agentes core com roles]

### Quality Gates
[3 camadas, regras, thresholds]

### IDS
[Princípios, registry, versionamento]

## Ecosystem
### Tools
[Ferramentas relacionadas]

### Patterns
[Padrões emergentes]

## Deprecated
[Informações marcadas como deprecated com data e razão]
```

### Cache e Frequência

| Cenário | Comportamento |
|---------|-------------|
| `forceRefresh: false` + última atualização < 24h | Skip, retorna knowledge base atual |
| `forceRefresh: false` + última atualização > 24h | Executa pesquisa incremental |
| `forceRefresh: true` | Executa pesquisa completa ignorando cache |

### Integração com Pipeline

- **self-update workflow**: selfUpdateKnowledge() é a task central (Fase 2-5)
- Oracle invoca via comando `*self-update`
- Knowledge base alimenta todos os agentes do squad com informações atualizadas
- modernizeComponent() usa knowledge base para saber quais padrões são os mais recentes
- Sentinel usa knowledge base para validar contra padrões atuais
