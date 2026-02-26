# Coding Standards

## Languages
- Primary: Markdown (agentes, tasks, config, READMEs)
- Secondary: YAML (workflows, squad.yaml)
- Tertiary: JavaScript/Node.js (scripts CLI)

## Naming Conventions
- Agent IDs: kebab-case (`squad-analyzer`)
- Agent filenames: kebab-case.md (`squad-analyzer.md`)
- Task identifiers: camelCase() (`analyzeRequirements()`)
- Task filenames: kebab-case.md (`analyze-requirements.md`)
- Workflow names: snake_case (`squad_generation_pipeline`)
- Workflow filenames: kebab-case.yaml (`squad-generation-pipeline.yaml`)
- Command names: *kebab-case (`*analyze-requirements`)
- Squad name: kebab-case (`nirvana-squad-creator`)
- Variables em código: inglês, camelCase

## Formatting Rules
- Indentação YAML: 2 espaços
- Indentação Markdown: sem requisito (consistente por arquivo)
- Line length: máximo 120 caracteres em YAML
- Strings YAML com caracteres especiais: sempre entre aspas

## Content Language
- Conteúdo textual: PT-BR com acentuação correta (UTF-8)
- Nomes de variáveis e código: inglês (padrão internacional)
- Termos técnicos: manter em inglês (IDs, paths, commands)

## Documentation Standards
- Cada agente: YAML config + Quick Commands + Agent Collaboration + Usage Guide
- Cada task: YAML config + Pipeline Diagram
- README: estrutura padronizada em 6 idiomas

## Error Handling
- Scripts: JSON output com `{ ok: true/false, error: "..." }`
- Agentes: retorno estruturado `## FASE COMPLETA` ou `## CLARIFICAÇÃO NECESSÁRIA`
- Pipeline: anti-loop via CLI de estado atômico
