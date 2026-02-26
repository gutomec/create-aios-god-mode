---
task: researchUpdates()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: topic
    tipo: string
    descricao: "Tópico de pesquisa: claude-code|aios|ecosystem|specific-topic"
    obrigatorio: true
  - nome: depth
    tipo: string
    descricao: "Profundidade da pesquisa: quick|deep"
    obrigatorio: true
  - nome: sinceDatetime
    tipo: string
    descricao: "Data/hora ISO 8601 desde a qual buscar atualizações (ex: 2026-02-01T00:00:00Z)"
    obrigatorio: true

Saida:
  - nome: researchReport
    tipo: file
    descricao: "Relatório de pesquisa com findings verificáveis e fontes"
    obrigatorio: true
  - nome: changelog
    tipo: file
    descricao: "Changelog com mudanças datadas desde sinceDatetime"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Acesso web disponível (WebSearch e/ou WebFetch funcionais)"
    - "[ ] Tópico de pesquisa definido e válido"
    - "[ ] sinceDatetime é uma data ISO 8601 válida"
    - "[ ] Profundidade de pesquisa especificada (quick ou deep)"
  post-conditions:
    - "[ ] Pesquisa é baseada em fontes verificáveis com URLs"
    - "[ ] Changelog tem timestamps para cada mudança encontrada"
    - "[ ] Findings são factuais — nenhuma especulação sem marcação"
    - "[ ] Gaps de informação estão explicitamente indicados"
    - "[ ] Datetime atual verificado via API antes da pesquisa"

Performance:
  duration_expected: "3-10 minutos"
  cost_estimated: "~4000 tokens"
  cacheable: true
  parallelizable: true
  skippable_when: "Quando sinceDatetime é recente (< 24h) e topic não teve atualizações conhecidas"

Error Handling:
  strategy: partial-continue
  fallback: "Retornar resultados parciais com gaps claramente indicados e fontes alternativas sugeridas"
  notification: "orchestrator"

Metadata:
  story: "Como squad, preciso pesquisar atualizações regularmente para manter minha base de conhecimento atualizada"
  version: "1.0.0"
  dependencies: []
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# researchUpdates()

## Pipeline Diagram

```
┌─────────────────┐     ┌──────────────────────┐
│ topic           │────▶│       Scout           │
│ depth           │     │    (aios-scout)       │
│ sinceDatetime   │     └──────────┬────────────┘
└─────────────────┘                │
                           ┌───────┴───────┐
                           │  Check Time   │
                           │  (worldtime   │
                           │   API)        │
                           └───────┬───────┘
                                   │
                      ┌────────────┼────────────┐
                      │            │            │
                ┌─────┴─────┐ ┌───┴────┐ ┌─────┴─────┐
                │ WebSearch │ │WebFetch│ │ Summarize │
                │ (busca)   │ │(docs)  │ │ (síntese) │
                └─────┬─────┘ └───┬────┘ └─────┬─────┘
                      │           │             │
                      └───────────┼─────────────┘
                                  │
                         ┌────────┴────────┐
                         │                 │
                   ┌─────┴──────┐   ┌──────┴─────┐
                   │ research   │   │ changelog  │
                   │ Report.md  │   │ .md        │
                   └────────────┘   └────────────┘
```

## Descrição

A task `researchUpdates()` é o **motor de pesquisa** do AIOS Forge Squad. Pesquisa atualizações e mudanças em tópicos relevantes para o framework, produzindo relatórios verificáveis e changelogs datados.

### Responsabilidades

1. **Verificação de Datetime** — Sempre como primeiro passo:
   ```bash
   curl -s http://worldtimeapi.org/api/timezone/America/Sao_Paulo
   ```
   - Extrai `datetime` da resposta JSON
   - Usa como referência para "agora" em todas as buscas
   - Se API indisponível, usa datetime do sistema com aviso

2. **Pesquisa por Tópico**:

   #### Tópico: `claude-code`
   - Features novas do CLI (comandos, flags, opções)
   - Mudanças no sistema de agentes (custom agents, teams, squads)
   - Atualizações de skills e skill marketplace
   - Novos MCP servers oficiais ou recomendados
   - Mudanças em hooks, rules e CLAUDE.md
   - Atualizações de modelos (novos modelos, deprecações)
   - **Fontes**: code.claude.com/docs, anthropic.com/news, github.com/anthropics

   #### Tópico: `aios`
   - Novas versões do AIOS Core
   - Mudanças na constituição ou regras
   - Novos tasks, workflows ou agentes oficiais
   - Mudanças no IDS ou quality gates
   - Atualizações na estrutura de diretórios
   - **Fontes**: github.com/SynkraAI/aios-core, changelogs

   #### Tópico: `ecosystem`
   - Ferramentas relacionadas (MCP servers, integrations)
   - Padrões emergentes de AI-assisted development
   - Competidores e alternativas ao AIOS
   - Comunidade e adoção
   - **Fontes**: npm registry, GitHub trending, blogs técnicos

   #### Tópico: `specific-topic` (qualquer outro)
   - Pesquisa genérica sobre o tópico especificado
   - Adaptação automática das fontes ao contexto
   - Uso combinado de WebSearch e WebFetch

3. **Profundidade de Pesquisa**:

   | Profundidade | Buscas | Fetches | Tempo |
   |-------------|--------|---------|-------|
   | `quick` | 2-3 buscas web | 1-2 fetches | 3-5 min |
   | `deep` | 5-8 buscas web | 3-5 fetches | 7-10 min |

4. **Síntese e Verificação**:
   - Cruzar informações de múltiplas fontes
   - Marcar findings como CONFIRMADO (2+ fontes) ou PRELIMINAR (1 fonte)
   - Indicar gaps explicitamente quando informação não foi encontrada
   - Nunca inventar ou especular sem marcação clara

### Formato do Relatório de Pesquisa

```markdown
# Research Report — {topic}

**Date:** ISO-8601 (datetime verificado)
**Depth:** {quick|deep}
**Since:** {sinceDatetime}
**Sources Consulted:** N

## Executive Summary
[Resumo em 3-5 linhas dos principais findings]

## Findings

### Finding 1: {título}
- **Status:** CONFIRMADO | PRELIMINAR
- **Date:** {data da mudança}
- **Source:** [{nome da fonte}]({URL})
- **Impact:** HIGH | MEDIUM | LOW
- **Details:** {descrição detalhada}

### Finding 2: {título}
...

## Gaps
[Informações não encontradas ou inconclusivas]

## Sources
1. [{título}]({URL}) — Consultado em {datetime}
2. [{título}]({URL}) — Consultado em {datetime}
...
```

### Formato do Changelog

```markdown
# Changelog — {topic}

**Period:** {sinceDatetime} → {currentDatetime}
**Entries:** N

## {YYYY-MM-DD}
- **[TIPO]** {descrição da mudança} — Fonte: [{nome}]({URL})

## {YYYY-MM-DD}
- **[TIPO]** {descrição da mudança} — Fonte: [{nome}]({URL})
...
```

Tipos de entrada: `[NEW]`, `[CHANGED]`, `[DEPRECATED]`, `[REMOVED]`, `[FIXED]`, `[SECURITY]`

### Integração com Pipeline

- **self-update workflow**: researchUpdates() é a Fase 2 e 3 (Claude Code e AIOS)
- Oracle pode invocar diretamente para pesquisa ad-hoc
- Findings alimentam selfUpdateKnowledge() e modernizeComponent()
- Changelog é usado como base para decisões de modernização
