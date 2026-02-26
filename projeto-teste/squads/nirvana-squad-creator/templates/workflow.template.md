# Workflow Definition Template

Gere um workflow AIOS seguindo esta estrutura. O formato de workflow e sintetizado de 3 fontes (workflow-patterns.yaml, workflow-state-schema.yaml, squads-guide.md) -- nao existe uma spec formal unica como para agents e tasks.

O exemplo usa o workflow `etl-pipeline` do squad ficticio `etl-squad` como referencia visual. Campos marcados `<!-- REQUIRED -->` sao os mais importantes para um workflow funcional.

## Exemplo de Referencia

```yaml
# --- Identity ---
workflow_name: etl_pipeline        # <!-- REQUIRED --> Identificador unico, snake_case
description: "Complete ETL pipeline from data extraction through transformation, loading, and validation"  # <!-- REQUIRED --> Resumo legivel

# --- Agent Sequence ---
agent_sequence:                    # <!-- REQUIRED --> Lista ordenada de agent IDs
  - data-extractor                 # Primeiro agente a executar
  - transformer                    # Segundo
  - loader                         # Terceiro
  - qa-validator                   # Ultimo (validacao)

# --- Trigger ---
key_commands:                      # Comandos que iniciam este workflow
  - "*run-etl"
  - "*extract-and-load"
trigger_threshold: 2               # Sinais necessarios antes de auto-ativacao (default: 2)
typical_duration: "15-30 minutes"  # Estimativa de duracao

# --- Success Criteria ---
success_indicators:                # <!-- REQUIRED --> Condicoes que definem sucesso
  - "All data extracted without critical errors"
  - "Transformation rules applied correctly"
  - "Data loaded to destination"
  - "Validation report shows no blockers"

# --- Transitions ---
transitions:                       # Definicoes de transicao de estado
  extraction_complete:
    trigger: "raw data extracted and logged"
    confidence: 0.85               # Confianca para transicao automatica (0.0-1.0)
    greeting_message: "Extraction complete. Starting transformation."
    next_steps:
      - command: "*transform-data"
        args_template: "{source_file}"
        description: "Apply transformation rules to extracted data"
        priority: 1

  transformation_complete:
    trigger: "all records transformed and validated"
    confidence: 0.90
    greeting_message: "Transformation complete. Starting load."
    next_steps:
      - command: "*load-data"
        args_template: "{transformed_file} --destination={target}"
        description: "Load transformed data to destination"
        priority: 1

  load_complete:
    trigger: "data loaded to destination successfully"
    confidence: 0.85
    greeting_message: "Load complete. Starting validation."
    next_steps:
      - command: "*validate-pipeline"
        description: "Run end-to-end validation checks"
        priority: 1

  validation_approved:
    trigger: "validation report shows no blockers"
    confidence: 0.95
    greeting_message: "ETL pipeline complete. All checks passed."
    next_steps:
      - command: "*generate-report"
        description: "Generate final pipeline execution report"
        priority: 1
```

## Available Patterns

AIOS Core fornece 10 patterns predefinidos. Squads selecionam e customizam baseado em seu dominio:

| Pattern | Description |
|---------|-------------|
| `story_development` | Ciclo completo de story: analise, arquitetura, implementacao, QA |
| `epic_creation` | Planejamento de epic com breakdown em stories, estimativa, priorizacao |
| `backlog_management` | Grooming de backlog, priorizacao, sprint planning |
| `architecture_review` | Avaliacao de arquitetura, diagramas, documentacao de decisoes |
| `git_workflow` | Gerenciamento de branches, convencoes de commit, review de PR, merge |
| `database_workflow` | Design de schema, migracoes, indexacao, checagem de integridade |
| `code_quality_workflow` | Code review, linting, testes, ciclos de refatoracao |
| `documentation_workflow` | Criacao, revisao e manutencao de documentacao |
| `ux_workflow` | Pesquisa UX, wireframing, prototipagem, testes de usabilidade |
| `research_workflow` | Pesquisa de dominio, analise competitiva, avaliacao de tecnologia |

## Customization

Para customizar um pattern existente:

1. Escolher o pattern base mais proximo ao dominio do squad
2. Substituir agent IDs genericos pelos agents reais do squad
3. Ajustar triggers, confidence thresholds e next-steps
4. Adicionar success indicators especificos do dominio

## Field Reference

Spec completa com workflow definition, runtime state schema e catalogo de patterns: [references/workflow-format.md](../references/workflow-format.md)
