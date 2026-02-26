# Tech Stack

## Core Stack
- Runtime: Node.js (zero dependências externas)
- Language: JavaScript (CommonJS para scripts CLI)
- Formats: Markdown (agentes, tasks, config), YAML (workflows, manifesto)
- Orchestration: Claude Code Task tool (spawn de sub-agentes)

## AIOS Core
- Minimum version: 2.1.0
- Format: AGENT-PERSONALIZATION-STANDARD-V1 (agentes)
- Format: TASK-FORMAT-SPECIFICATION-V1 (tasks)
- Format: Workflow synthesized spec (workflows)

## Claude Code Integration
- Skill format: YAML frontmatter + Markdown body
- Command personas: Markdown puro (sem frontmatter)
- Rules: Bullets acionáveis em Markdown
- Settings: JSON mínimo (`{ "language": "portuguese" }`)

## CLI Tool
- `squad-tools.cjs` — gestão de estado atômico
- Zero dependências npm (Node.js puro, fs + path)
- Output: JSON para todas as operações
- Comandos: init, resume, state (get/advance/gate/add-decision), validate, snapshot

## Publication
- Platform: squads.sh (marketplace AIOS)
- CLI: `squads login` + `squads publish`
- Format: squad directory com squad.yaml na raiz
