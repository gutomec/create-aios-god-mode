# Source Tree

## Directory Structure

```
squads/nirvana-squad-creator/
├── agents/                           # 9 agentes (formato AIOS)
│   ├── squad-analyzer.md
│   ├── squad-agent-creator.md
│   ├── squad-task-creator.md
│   ├── squad-workflow-creator.md
│   ├── squad-optimizer.md
│   ├── squad-validator.md
│   ├── squad-readme-creator.md
│   ├── squad-publisher.md
│   └── squad-orchestrator.md
├── tasks/                            # 10 tasks (formato AIOS)
│   ├── analyze-requirements.md
│   ├── create-agents.md
│   ├── create-tasks.md
│   ├── create-workflows.md
│   ├── optimize-squad.md
│   ├── validate-squad.md
│   ├── create-multilingual-readme.md
│   ├── deploy-squad.md
│   ├── publish-squad.md
│   └── manage-state.md
├── workflows/                        # 2 workflows AIOS
│   ├── squad-generation-pipeline.yaml
│   └── squad-publish-flow.yaml
├── config/
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md
├── scripts/
│   └── squad-tools.cjs
├── templates/                        # 4 templates (cópia)
├── references/                       # 5 referências (cópia)
├── squad.yaml
├── README.md
├── README.en.md
├── README.zh.md
├── README.hi.md
├── README.es.md
└── README.ar.md
```

## Key Paths
- `agents/`: Definições de agentes AIOS com persona_profile e commands
- `tasks/`: Tasks com contratos Entrada/Saída encadeados
- `workflows/`: Orquestração do pipeline
- `config/`: Padrões de código, tech stack, estrutura
- `scripts/`: CLI de estado atômico (squad-tools.cjs)
- `templates/`: Templates anotados para geração de componentes AIOS
- `references/`: Especificações completas de cada formato AIOS

## File Naming
- Agents: `squad-{role}.md` (kebab-case)
- Tasks: `{action-noun}.md` (kebab-case, derivado do camelCase identifier)
- Workflows: `squad-{purpose}.yaml` (kebab-case, extensão .yaml)
