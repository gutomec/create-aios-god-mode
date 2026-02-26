# Source Tree — AIOS Forge Squad

## Visão Geral

Este documento descreve a estrutura completa de diretórios e arquivos do AIOS Forge Squad, incluindo convenções de nomenclatura e propósito de cada componente.

---

## Estrutura Completa

```
squads/aios-forge-squad/
│
├── squad.yaml                          # Manifesto do squad (ponto de entrada)
├── README.md                           # Documentação principal (PT-BR)
├── README.en.md                        # Documentação em inglês
│
├── agents/                             # 7 agentes especializados (AIOS format)
│   ├── aios-oracle.md                  # Orquestrador — roteia trabalho, coordena agentes
│   ├── aios-architect.md               # Arquiteto — projeta melhorias e estruturas
│   ├── aios-forge.md                   # Criador — cria qualquer artefato AIOS
│   ├── aios-sentinel.md                # Validador — valida, audita e testa
│   ├── aios-catalyst.md                # Otimizador — otimiza e moderniza componentes
│   ├── aios-nexus.md                   # Integrador — configura, deploya e integra
│   └── aios-scout.md                   # Pesquisador — auto-atualiza e pesquisa novidades
│
├── tasks/                              # 14 tasks executáveis (AIOS format)
│   ├── analyze-aios-component.md       # Análise profunda de componente AIOS
│   ├── create-agent.md                 # Criação de novo agente
│   ├── create-task.md                  # Criação de nova task
│   ├── create-workflow.md              # Criação de novo workflow
│   ├── create-skill.md                 # Criação de nova skill
│   ├── create-squad.md                 # Criação de novo squad
│   ├── create-template.md              # Criação de novo template
│   ├── validate-artifact.md            # Validação constitucional de artefato
│   ├── audit-framework.md              # Auditoria completa do framework
│   ├── optimize-component.md           # Otimização de componente existente
│   ├── modernize-component.md          # Modernização de componente legado
│   ├── integrate-configuration.md      # Integração de configuração no sistema
│   ├── research-updates.md             # Pesquisa de atualizações e novidades
│   └── self-update-knowledge.md        # Auto-atualização da base de conhecimento
│
├── workflows/                          # 3 workflows orquestrados
│   ├── forge-artifact.yaml             # Criação completa de artefato (análise → criação → validação)
│   ├── optimize-framework.yaml         # Otimização do framework (auditoria → otimização → validação)
│   └── self-update.yaml                # Auto-atualização (pesquisa → análise → aplicação)
│
└── config/                             # Configurações do squad
    ├── coding-standards.md             # Padrões de codificação obrigatórios
    ├── tech-stack.md                   # Stack tecnológica e dependências
    └── source-tree.md                  # Este arquivo — mapa do squad
```

---

## Convenções de Nomenclatura de Arquivos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Agentes | `kebab-case.md` | `aios-forge.md` |
| Tasks | `kebab-case.md` | `create-agent.md` |
| Workflows | `kebab-case.yaml` | `forge-artifact.yaml` |
| Configurações | `kebab-case.md` | `coding-standards.md` |
| Manifesto | `squad.yaml` | (fixo) |
| Documentação | `README.md` / `README.en.md` | (fixo) |

---

## Caminhos-Chave

| Caminho | Descrição |
|---------|-----------|
| `squads/aios-forge-squad/squad.yaml` | Ponto de entrada — manifesto completo |
| `squads/aios-forge-squad/agents/` | Definições de todos os 7 agentes |
| `squads/aios-forge-squad/tasks/` | Definições de todas as 14 tasks |
| `squads/aios-forge-squad/workflows/` | Definições de todos os 3 workflows |
| `squads/aios-forge-squad/config/` | Configurações e padrões do squad |

---

## Relação entre Componentes

```
                    ┌─────────────┐
                    │ squad.yaml  │  ← Manifesto (lista todos os componentes)
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   agents/   │ │   tasks/    │ │ workflows/  │
    │  (7 files)  │ │ (14 files)  │ │  (3 files)  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                    ┌──────▼──────┐
                    │   config/   │  ← Padrões compartilhados
                    │  (3 files)  │
                    └─────────────┘
```

### Mapeamento Agente → Tasks

| Agente | Tasks Primárias |
|--------|----------------|
| `aios-oracle` | `analyze-aios-component` |
| `aios-architect` | `analyze-aios-component` |
| `aios-forge` | `create-agent`, `create-task`, `create-workflow`, `create-skill`, `create-squad`, `create-template` |
| `aios-sentinel` | `validate-artifact`, `audit-framework` |
| `aios-catalyst` | `optimize-component`, `modernize-component` |
| `aios-nexus` | `integrate-configuration` |
| `aios-scout` | `research-updates`, `self-update-knowledge` |

### Mapeamento Workflow → Tasks

| Workflow | Tasks Envolvidas |
|----------|-----------------|
| `forge-artifact` | `analyze-aios-component` → `create-*` → `validate-artifact` |
| `optimize-framework` | `audit-framework` → `optimize-component` / `modernize-component` → `validate-artifact` |
| `self-update` | `research-updates` → `self-update-knowledge` → `validate-artifact` |

---

## Contagem de Artefatos

| Tipo | Quantidade |
|------|-----------|
| Agentes | 7 |
| Tasks | 14 |
| Workflows | 3 |
| Configurações | 3 |
| Documentação | 2 (README.md + README.en.md) |
| Manifesto | 1 (squad.yaml) |
| **Total** | **30 arquivos** |
