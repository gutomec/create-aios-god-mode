# Task Definition Template

Gere uma definicao de task AIOS seguindo esta estrutura. Tasks seguem uma "task-first architecture" onde cada task e uma unidade de trabalho autocontida com contratos explicitos de dados (Entrada/Saida). Campos marcados `<!-- REQUIRED -->` sao obrigatorios.

O exemplo usa a task `extractData()` do squad ficticio `etl-squad` como referencia visual.

## Exemplo de Referencia

```yaml
# --- Identity ---
task: extractData()                # <!-- REQUIRED --> Identificador unico, formato camelCase()
responsavel: "DataExtractor"       # <!-- REQUIRED --> Nome legivel da entidade responsavel
responsavel_type: Agente           # <!-- REQUIRED --> Agente | Worker | Humano | Clone
atomic_layer: Molecule             # <!-- REQUIRED --> Classificacao de complexidade (ver tabela abaixo)

# --- Input Contract ---
Entrada:                           # <!-- REQUIRED --> Especificacoes de input
  - nome: sourceConfig             # Nome do campo de entrada
    tipo: object                   # Tipo de dado (string, object, array, boolean, file)
    obrigatorio: true              # Se o input e mandatorio
    descricao: "Configuração da fonte de dados (de input.md, requisitos do usuário)"
  - nome: extractionScope
    tipo: string
    obrigatorio: false
    descricao: "Escopo da extração (de analysis.md, output do analyzer)"

# --- Output Contract ---
Saida:                             # <!-- REQUIRED --> Especificacoes de output
  - nome: rawData                  # Nome do campo de saida
    tipo: file                     # Tipo de dado
    obrigatorio: true              # Se o output e obrigatorio
    descricao: "Dados brutos extraídos (destino: transformData() task)"
  - nome: extractionLog
    tipo: object
    obrigatorio: true
    descricao: "Log da extração com row count e duração (destino: validation-report.md)"

# --- Validation ---
Checklist:                         # <!-- REQUIRED --> Condicoes de validacao
  pre-conditions:
    - "[ ] Source configuration is valid and accessible"
    - "[ ] Target output directory exists"
    - "[ ] Network connectivity verified (for remote sources)"
  post-conditions:
    - "[ ] Output file exists and is non-empty"
    - "[ ] Extraction log contains row count and duration"
    - "[ ] No critical errors in extraction log"
  acceptance-criteria:             # Criterios com flag de blocker (opcional)
    - blocker: true
      criteria: "Extracted data matches expected schema"
    - blocker: false
      criteria: "Extraction completed within expected duration"

# --- Performance (opcional) ---
Performance:
  duration_expected: "5-15 minutes"
  cost_estimated: "~500 tokens + API calls"
  cacheable: true
  parallelizable: false
  skippable_when: "Source data unchanged since last extraction"

# --- Error Handling (opcional) ---
Error Handling:
  strategy: retry                  # retry | fallback | abort
  retry:
    max_attempts: 3
    delay: "exponential(base=2s, max=30s)"
  fallback: "Use cached data from previous extraction"
  notification: "orchestrator"
```

## Atomic Layer Classification

### Structural Layers

| Layer | Scope | Example |
|-------|-------|---------|
| `Atom` | Operacao indivisivel minima | Validar um campo |
| `Molecule` | Combinacao de atoms em unidade logica | Extrair dados de uma fonte |
| `Organism` | Operacao multi-molecule complexa | ETL completo para um dominio |
| `Template` | Padrao reutilizavel entre contextos | Template generico de extracao |
| `Page` | Unidade completa de workflow end-to-end | Execucao completa do pipeline |

### Functional Layers

| Layer | Domain | Example |
|-------|--------|---------|
| `Config` | Configuracao e setup | Configurar conexao ao banco |
| `Strategy` | Planejamento e decisoes | Escolher abordagem de extracao |
| `Content` | Criacao ou modificacao de conteudo | Gerar documentacao |
| `Media` | Operacoes com arquivos de midia | Processar imagens |
| `Layout` | Estrutura e organizacao | Desenhar layout de diretorios |
| `Analysis` | Pesquisa e investigacao | Analisar schema de API |

Uma task usa a classificacao estrutural ou funcional, a que melhor descreve sua natureza.

## Command Syntax

Tasks sao invocadas pelo agente responsavel via o comando definido no agent:

```
*extract-data --source=api-users --format=json
```

## Pipeline Diagram

Cada task conecta-se a outras via seus contratos Entrada/Saida:

```
input.md ──→ [extractData()] ──→ rawData ──→ [transformData()] ──→ records ──→ [loadData()]
                  ↓                                                                ↓
           extractionLog                                                    loadReport
                  ↓                                                                ↓
           validation-report.md ←──────────────────────────────────────────────────┘
```

## Field Reference

Spec completa com todos os campos, tipos, e regras de validacao: [references/task-format.md](../references/task-format.md)
