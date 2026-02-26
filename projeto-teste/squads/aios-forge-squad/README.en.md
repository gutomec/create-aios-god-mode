# AIOS Forge Squad

> Development, optimization, and evolution squad for the AIOS framework.

[![Version](https://img.shields.io/badge/version-1.0.1-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![AIOS](https://img.shields.io/badge/AIOS-%3E%3D%202.1.0-orange)]()
[![Validation](https://img.shields.io/badge/validation-100%2F100-brightgreen)]()

## What is it

AIOS Forge Squad is the AIOS ecosystem's meta-tool: a squad that creates, validates, optimizes, and modernizes the framework itself. With 7 specialized agents, 14 tasks, and 3 workflows, it covers the entire lifecycle of AIOS artifacts — from agents to full squads.

## Installation

```bash
npx squads add gutomec/squads-sh-aios/aios-forge-squad
```

## Agents

| Agent | ID | Role |
|-------|-----|------|
| Oracle | `aios-oracle` | Orchestrator — routes requests, coordinates agents, manages pipelines |
| Architect | `aios-architect` | Strategist — designs improvements with 4-layer awareness (L1-L4) |
| Forge | `aios-forge` | Creator — generates any AIOS artifact with perfect format adherence |
| Sentinel | `aios-sentinel` | Guardian — validates against constitution, quality gates, and IDS |
| Catalyst | `aios-catalyst` | Optimizer — context compaction, AgentDropout, performance tuning |
| Nexus | `aios-nexus` | Integrator — MCP, deploy, configuration, rules |
| Scout | `aios-scout` | Researcher — self-update via web, monitors for updates |

## Commands

### Creation

```bash
@aios-forge *create-agent       # New agent with full persona
@aios-forge *create-task        # New task with I/O contracts
@aios-forge *create-workflow    # New multi-agent workflow
@aios-forge *create-skill       # New Claude Code skill
@aios-forge *create-squad       # New complete squad (7 phases)
@aios-forge *create-template    # New annotated template
```

### Validation & Audit

```bash
@aios-sentinel *validate-artifact    # Validates format + constitution + IDS
@aios-sentinel *audit-framework      # Full project audit
```

### Optimization

```bash
@aios-catalyst *optimize-component    # Measure, optimize, verify
@aios-catalyst *modernize-component   # Migrate to current standards
```

### Integration

```bash
@aios-nexus *integrate-config    # Configure MCP, rules, settings, deploy
```

### Research & Self-Update

```bash
@aios-scout *research-updates         # Research updates (Claude Code, AIOS)
@aios-scout *self-update-knowledge    # Update knowledge base
```

### Orchestration

```bash
@aios-oracle *analyze-component    # Deep analysis of any component
```

## Workflows

### forge_artifact

Full creation pipeline — from request to deploy.

```
Oracle → Architect → Forge → Sentinel → Catalyst → Nexus
```

Analyzes the request, designs the structure, creates the artifact, validates against standards, optimizes, and integrates into the system.

### optimize_framework

Optimization pipeline — full audit through improvement deploy.

```
Oracle → Architect → Scout → Catalyst → Sentinel → Nexus
```

Audits current state, researches best practices, applies optimizations, validates compliance, and deploys.

### self_update

Self-update pipeline — research, evaluate, and apply updates.

```
Scout → Scout → Oracle → Forge → Sentinel
```

Checks current date/time, researches Claude Code and AIOS updates, evaluates relevance, updates artifacts, and validates integrity.

## Architecture

```
                      ┌────────────────┐
                      │  aios-oracle   │
                      │ (Orchestrator) │
                      └───────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
      ┌───────┴──────┐ ┌─────┴──────┐ ┌──────┴───────┐
      │aios-architect│ │ aios-forge  │ │aios-sentinel │
      │ (Strategist) │ │  (Creator)  │ │  (Guardian)  │
      └───────┬──────┘ └─────┬──────┘ └──────┬───────┘
              │               │               │
      ┌───────┴──────┐ ┌─────┴──────┐ ┌──────┴───────┐
      │aios-catalyst │ │ aios-nexus  │ │  aios-scout  │
      │ (Optimizer)  │ │(Integrator) │ │ (Researcher) │
      └──────────────┘ └────────────┘ └──────────────┘
```

## Structure

```
squads/aios-forge-squad/
├── squad.yaml                          # Manifest
├── README.md
├── config/
│   ├── coding-standards.md             # Coding standards
│   ├── tech-stack.md                   # Technology stack
│   └── source-tree.md                  # Squad map
├── agents/                             # 7 agents
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

## Requirements

- Node.js 18+
- AIOS Core >= 2.1.0
- Claude Code (Feb 2026+)
- Git 2.30+

## Author

**Luiz Gustavo Vieira Rodrigues** — [@gutomec](https://github.com/gutomec)

## License

MIT
