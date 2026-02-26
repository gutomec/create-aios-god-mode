# AIOS Forge Squad

> Squad de desenvolvimento, otimização e evolução do framework AIOS.

[![Version](https://img.shields.io/badge/version-1.0.1-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![AIOS](https://img.shields.io/badge/AIOS-%3E%3D%202.1.0-orange)]()
[![Validation](https://img.shields.io/badge/validation-100%2F100-brightgreen)]()

## O que é

O AIOS Forge Squad é a meta-ferramenta do ecossistema AIOS: um squad que cria, valida, otimiza e moderniza o próprio framework. Com 7 agentes especializados, 14 tasks e 3 workflows, ele cobre todo o ciclo de vida de artefatos AIOS — de agentes a squads completos.

## Instalação

```bash
npx squads add gutomec/squads-sh-aios/aios-forge-squad
```

## Agentes

| Agente | ID | Papel |
|--------|-----|-------|
| Oracle | `aios-oracle` | Orquestrador — roteia requisições, coordena agentes, gerencia pipelines |
| Architect | `aios-architect` | Estrategista — projeta melhorias com awareness das 4 camadas (L1-L4) |
| Forge | `aios-forge` | Criador — gera qualquer artefato AIOS com perfeição de formato |
| Sentinel | `aios-sentinel` | Guardião — valida contra constituição, quality gates e IDS |
| Catalyst | `aios-catalyst` | Otimizador — compactação de contexto, AgentDropout, performance |
| Nexus | `aios-nexus` | Integrador — MCP, deploy, configuração, regras |
| Scout | `aios-scout` | Pesquisador — auto-atualização via web, monitoramento de novidades |

## Comandos

### Criação

```bash
@aios-forge *create-agent       # Novo agente com persona completa
@aios-forge *create-task        # Nova task com contratos I/O
@aios-forge *create-workflow    # Novo workflow multi-agente
@aios-forge *create-skill       # Nova skill para Claude Code
@aios-forge *create-squad       # Novo squad completo (7 fases)
@aios-forge *create-template    # Novo template anotado
```

### Validação e Auditoria

```bash
@aios-sentinel *validate-artifact    # Valida formato + constituição + IDS
@aios-sentinel *audit-framework      # Auditoria completa do projeto
```

### Otimização

```bash
@aios-catalyst *optimize-component    # Mede, otimiza, verifica
@aios-catalyst *modernize-component   # Migra para padrões atuais
```

### Integração

```bash
@aios-nexus *integrate-config    # Configura MCP, rules, settings, deploy
```

### Pesquisa e Auto-Atualização

```bash
@aios-scout *research-updates         # Pesquisa novidades (Claude Code, AIOS)
@aios-scout *self-update-knowledge    # Atualiza base de conhecimento
```

### Orquestração

```bash
@aios-oracle *analyze-component    # Análise profunda de qualquer componente
```

## Workflows

### forge_artifact

Pipeline completo de criação — da requisição ao deploy.

```
Oracle → Architect → Forge → Sentinel → Catalyst → Nexus
```

Analisa a requisição, projeta a estrutura, cria o artefato, valida contra os padrões, otimiza e integra no sistema.

### optimize_framework

Pipeline de otimização — auditoria completa até deploy das melhorias.

```
Oracle → Architect → Scout → Catalyst → Sentinel → Nexus
```

Audita o estado atual, pesquisa melhores práticas, aplica otimizações, valida conformidade e deploya.

### self_update

Pipeline de auto-atualização — pesquisa, avalia e aplica novidades.

```
Scout → Scout → Oracle → Forge → Sentinel
```

Consulta data/hora atual, pesquisa atualizações do Claude Code e AIOS, avalia relevância, atualiza artefatos e valida integridade.

## Arquitetura

```
                      ┌────────────────┐
                      │  aios-oracle   │
                      │ (Orquestrador) │
                      └───────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
      ┌───────┴──────┐ ┌─────┴──────┐ ┌──────┴───────┐
      │aios-architect│ │ aios-forge  │ │aios-sentinel │
      │(Estrategista)│ │  (Criador)  │ │  (Guardião)  │
      └───────┬──────┘ └─────┬──────┘ └──────┬───────┘
              │               │               │
      ┌───────┴──────┐ ┌─────┴──────┐ ┌──────┴───────┐
      │aios-catalyst │ │ aios-nexus  │ │  aios-scout  │
      │(Otimizador)  │ │(Integrador) │ │(Pesquisador) │
      └──────────────┘ └────────────┘ └──────────────┘
```

## Estrutura

```
squads/aios-forge-squad/
├── squad.yaml                          # Manifesto
├── README.md
├── config/
│   ├── coding-standards.md             # Padrões de codificação
│   ├── tech-stack.md                   # Stack tecnológica
│   └── source-tree.md                  # Mapa do squad
├── agents/                             # 7 agentes
│   ├── aios-oracle.md
│   ├── aios-architect.md
│   ├── aios-forge.md
│   ├── aios-sentinel.md
│   ├── aios-catalyst.md
│   ├── aios-nexus.md
│   └── aios-scout.md
├── tasks/                              # 14 tasks
│   ├── analyze-aios-component.md
│   ├── create-agent.md
│   ├── create-task.md
│   ├── create-workflow.md
│   ├── create-skill.md
│   ├── create-squad.md
│   ├── create-template.md
│   ├── validate-artifact.md
│   ├── audit-framework.md
│   ├── optimize-component.md
│   ├── modernize-component.md
│   ├── integrate-configuration.md
│   ├── research-updates.md
│   └── self-update-knowledge.md
└── workflows/                          # 3 workflows
    ├── forge-artifact.yaml
    ├── optimize-framework.yaml
    └── self-update.yaml
```

## Requisitos

- Node.js 18+
- AIOS Core >= 2.1.0
- Claude Code (Fev 2026+)
- Git 2.30+

## Autor

**Luiz Gustavo Vieira Rodrigues** — [@gutomec](https://github.com/gutomec)

## Licença

MIT
