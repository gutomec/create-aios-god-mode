# Nirvana Squad Creator

> Genera squads AIOS optimizados a partir de lenguaje natural — pipeline de 9 fases con análisis, generación, optimización, validación, READMEs multilingües, despliegue y publicación en squads.sh.

## Instalación

```bash
npx squads add gutomec/squads-sh-aios/nirvana-squad-creator
```

## Qué Hace

Nirvana Squad Creator es una **meta-herramienta**: un squad AIOS que genera otros squads AIOS. A partir de un objetivo en lenguaje natural, produce un squad completo y optimizado con:

- **Agentes** con personalidad, archetype y commands (AGENT-PERSONALIZATION-STANDARD-V1)
- **Tasks** con contratos explícitos de Entrada/Salida (TASK-FORMAT-SPECIFICATION-V1)
- **Workflows** con selección automática de pattern y transitions
- **Config** adaptado al dominio (coding-standards, tech-stack, source-tree)
- **READMEs** en 6 idiomas (PT-BR, en, zh, hi, es, ar)
- **Publicación** en el marketplace squads.sh

Cero agentes redundantes. Validación en 6 categorías. Despliegue automático con habilitación de slash commands.

## Pipeline — 9 Fases

| Fase | Agente | Rol | Modelo |
|------|--------|-----|--------|
| 0 | Orquestador | Recopila input, inicializa sesión | — |
| 1 | 🔍 Analyzer | Analiza requisitos, genera component-registry | Sonnet |
| 2 | 🏗️ AgentCreator | Genera definiciones de agents AIOS | Opus |
| 3 | 📋 TaskCreator | Genera tasks con contratos Entrada/Salida | Opus |
| 4 | 🔄 WorkflowCreator | Genera workflows, squad.yaml, config | Opus |
| 5 | ⚡ Optimizer | AgentDropout, cross-references, naming | Opus |
| 6 | ✅ Validator | Validación de 6 categorías AIOS | Sonnet |
| 7 | 🌐 ReadmeCreator | READMEs en 6 idiomas | Opus |
| 8 | — Deploy | Despliega en proyecto AIOS, habilita commands | Orquestador |
| 9 | 🚀 Publisher | Publica en squads.sh (opcional) | Orquestador |

## Agentes

| Icono | Nombre | Archetype | Responsabilidad |
|-------|--------|-----------|-----------------|
| 🔍 | Analyzer | Guardian | Descompone el objetivo en dominio, capacidades y roles |
| 🏗️ | AgentCreator | Builder | Genera definiciones de agentes con persona_profile |
| 📋 | TaskCreator | Builder | Genera tasks con contratos Entrada/Salida encadenados |
| 🔄 | WorkflowCreator | Flow_Master | Genera workflows, squad.yaml, config y README |
| ⚡ | Optimizer | Balancer | Elimina redundancias, corrige cross-references |
| ✅ | Validator | Guardian | Valida contra 6 categorías de especificación AIOS |
| 🌐 | ReadmeCreator | Builder | Genera READMEs en PT-BR + 5 traducciones |
| 🚀 | Publisher | Flow_Master | Guía la publicación en el marketplace squads.sh |

## Tasks

| Task | Responsable | Atomic Layer |
|------|-------------|-------------|
| `analyzeRequirements()` | Analyzer | Organism |
| `createAgents()` | AgentCreator | Organism |
| `createTasks()` | TaskCreator | Organism |
| `createWorkflows()` | WorkflowCreator | Organism |
| `optimizeSquad()` | Optimizer | Organism |
| `validateSquad()` | Validator | Organism |
| `createMultilingualReadme()` | ReadmeCreator | Organism |
| `deploySquad()` | Orquestador | Organism |
| `publishSquad()` | Publisher | Molecule |
| `manageState()` | Orquestador | Molecule |

## Workflows

### squad_generation_pipeline
Pipeline principal de 9 fases — del análisis de requisitos a la publicación.
```
[Analyzer] → [AgentCreator] → [TaskCreator] → [WorkflowCreator] → [Optimizer] → [Validator] → [ReadmeCreator] → Deploy → [Publisher]
```

### squad_publish_flow
Flujo independiente para publicar un squad existente en squads.sh.
```
[Validator] → [Publisher]
```

## Configuración

- `config/coding-standards.md` — Convenciones de nomenclatura, reglas de formato, idioma
- `config/tech-stack.md` — Node.js, AIOS Core, Claude Code, YAML/Markdown
- `config/source-tree.md` — Estructura de directorios del squad

## Uso

### Pipeline completo
```bash
/SQUADS:nsc:squad-analyzer
```

### Agentes individuales
```
/SQUADS:nsc:squad-analyzer          — Análisis de requisitos
/SQUADS:nsc:squad-agent-creator     — Generación de agentes
/SQUADS:nsc:squad-task-creator      — Generación de tasks
/SQUADS:nsc:squad-workflow-creator  — Workflows y squad.yaml
/SQUADS:nsc:squad-optimizer         — Optimización
/SQUADS:nsc:squad-validator         — Validación
/SQUADS:nsc:squad-readme-creator    — READMEs multilingües
/SQUADS:nsc:squad-publisher         — Publicación
```

## Autor

**Luiz Gustavo Vieira Rodrigues** ([@gutomec](https://github.com/gutomec))

## Licencia

MIT
