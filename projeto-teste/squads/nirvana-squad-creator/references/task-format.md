# Task Format Reference (TASK-FORMAT-SPECIFICATION-V1)

**Source:** [TASK-FORMAT-SPECIFICATION-V1.md](https://github.com/SynkraAI/aios-core/blob/main/.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)
**Confidence:** HIGH

---

## Structure Overview

An AIOS task definition is a Markdown file (`.md`) containing a YAML configuration block that specifies the task's identity, responsible entity, atomic classification, inputs, outputs, and validation checklist. Optional sections cover templates, tools, scripts, performance hints, error handling, and metadata.

Tasks follow a "task-first architecture" where each task is a self-contained unit of work with explicit data contracts (Entrada/Saida) that enable pipeline composition.

---

## Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `task` | string | Unique task identifier | camelCase() format (e.g., `extractData()`, `transformRecords()`) |
| `responsavel` | string | Human-readable name of the responsible entity | Free text, matches an agent name or human role |
| `responsavel_type` | enum | Type of responsible entity | `Agente` \| `Worker` \| `Humano` \| `Clone` |
| `atomic_layer` | enum | Complexity classification | Structural: `Atom` \| `Molecule` \| `Organism` \| `Template` \| `Page` |
| | | | Functional: `Config` \| `Strategy` \| `Content` \| `Media` \| `Layout` \| `Analysis` |
| `Entrada` | array | Input specifications | Each item: `campo`, `tipo`, `origen`, `obrigatorio` |
| `Entrada[].campo` | string | Input field name | Free text |
| `Entrada[].tipo` | string | Data type | e.g., `string`, `object`, `array`, `boolean`, `file` |
| `Entrada[].origen` | string | Where this input comes from | Reference to another task output or external source |
| `Entrada[].obrigatorio` | boolean | Whether input is mandatory | `true` or `false` |
| `Saida` | array | Output specifications | Each item: `campo`, `tipo`, `destino`, `persistido` |
| `Saida[].campo` | string | Output field name | Free text |
| `Saida[].tipo` | string | Data type | e.g., `string`, `object`, `array`, `file` |
| `Saida[].destino` | string | Where this output goes | Reference to consuming task or storage |
| `Saida[].persistido` | boolean | Whether output is saved to disk | `true` or `false` |
| `Checklist` | object | Validation conditions | Contains `pre-conditions` and `post-conditions` arrays |

---

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `Template` | object | Template configuration |
| `Template.path` | string | Path to template file |
| `Template.type` | string | Template format (e.g., `markdown`, `yaml`) |
| `Template.version` | string | Template version |
| `Template.variables` | array | Variables to interpolate |
| `Template.schema` | string | Schema reference for validation |
| `Tools` | array | External tools used by this task |
| `Tools[].tool_name` | string | Tool identifier |
| `Tools[].version` | string | Tool version |
| `Tools[].used_for` | string | Purpose within this task |
| `Tools[].shared_with` | array | Other tasks sharing this tool |
| `Tools[].cost` | string | Cost classification (free, paid, metered) |
| `Tools[].cacheable` | boolean | Whether tool results can be cached |
| `Scripts` | array | Utility scripts |
| `Scripts[].script_path` | string | Path to script file |
| `Scripts[].description` | string | What the script does |
| `Scripts[].language` | string | Programming language |
| `Scripts[].version` | string | Script version |
| `Performance` | object | Performance hints for orchestration |
| `Performance.duration_expected` | string | Estimated execution time |
| `Performance.cost_estimated` | string | Estimated cost (tokens, API calls) |
| `Performance.cacheable` | boolean | Whether task output can be cached |
| `Performance.parallelizable` | boolean | Whether task can run in parallel with others |
| `Performance.skippable_when` | string | Condition under which task can be skipped |
| `Error Handling` | object | Error recovery configuration |
| `Error Handling.strategy` | enum | Recovery approach: `retry` \| `fallback` \| `abort` |
| `Error Handling.retry` | object | Retry config (max_attempts, delay) |
| `Error Handling.fallback` | string | Fallback behavior description |
| `Error Handling.notification` | string | Who to notify on failure |
| `Metadata` | object | Bookkeeping |
| `Metadata.story` | string | Related user story |
| `Metadata.version` | string | Task definition version |
| `Metadata.dependencies` | array | Other tasks this depends on |
| `Metadata.author` | string | Task definition author |
| `Metadata.created_at` | string | Creation timestamp (ISO-8601) |
| `Metadata.updated_at` | string | Last update timestamp (ISO-8601) |

---

## Complete Example

```yaml
task: extractData()
responsavel: "DataExtractor"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - campo: sourceConfig
    tipo: object
    origen: "input.md (user requirements)"
    obrigatorio: true
  - campo: extractionScope
    tipo: string
    origen: "analysis.md (analyzer output)"
    obrigatorio: false

Saida:
  - campo: rawData
    tipo: file
    destino: "transformData() task"
    persistido: true
  - campo: extractionLog
    tipo: object
    destino: "validation-report.md"
    persistido: true

Checklist:
  pre-conditions:
    - "[ ] Source configuration is valid and accessible"
    - "[ ] Target output directory exists"
    - "[ ] Network connectivity verified (for remote sources)"
  post-conditions:
    - "[ ] Output file exists and is non-empty"
    - "[ ] Extraction log contains row count and duration"
    - "[ ] No critical errors in extraction log"
  acceptance-criteria:
    - blocker: true
      criteria: "Extracted data matches expected schema"
    - blocker: false
      criteria: "Extraction completed within expected duration"

Template:
  path: templates/task.template.md
  type: markdown
  version: "1.0.0"
  variables:
    - task_name
    - agent_name
  schema: references/task-format.md

Tools:
  - tool_name: WebFetch
    version: latest
    used_for: "Fetching data from HTTP APIs"
    shared_with:
      - validateData()
    cost: free
    cacheable: true

Scripts:
  - script_path: scripts/validate-source.sh
    description: "Validates source connectivity and authentication"
    language: bash
    version: "1.0.0"

Performance:
  duration_expected: "5-15 minutes"
  cost_estimated: "~500 tokens + API calls"
  cacheable: true
  parallelizable: false
  skippable_when: "Source data unchanged since last extraction"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 3
    delay: "exponential(base=2s, max=30s)"
  fallback: "Use cached data from previous extraction"
  notification: "orchestrator"

Metadata:
  story: "As a data engineer, I need to extract data from multiple sources"
  version: "1.0.0"
  dependencies:
    - analyzeRequirements()
  author: "Squad Creator"
  created_at: "2026-02-20T14:00:00Z"
  updated_at: "2026-02-20T14:00:00Z"
```

---

## Atomic Layer Classification

### Structural Layers

| Layer | Scope | Example |
|-------|-------|---------|
| `Atom` | Smallest indivisible operation | Validate a single field |
| `Molecule` | Combination of atoms forming a logical unit | Extract data from one source |
| `Organism` | Complex multi-molecule operation | Full ETL for a data domain |
| `Template` | Reusable pattern across contexts | Generic API extraction template |
| `Page` | Complete end-to-end workflow unit | Full pipeline execution |

### Functional Layers

| Layer | Domain | Example |
|-------|--------|---------|
| `Config` | Configuration and setup | Set up database connection |
| `Strategy` | Planning and decision-making | Choose extraction approach |
| `Content` | Content creation or modification | Generate documentation |
| `Media` | Media file operations | Process image assets |
| `Layout` | Structure and organization | Design directory layout |
| `Analysis` | Research and investigation | Analyze API response schema |

A task uses either a structural or functional classification, whichever best describes its nature.

---

## Validation Rules

- `task` identifier follows camelCase() format: starts with lowercase letter, uses camelCase, ends with `()`
- `responsavel_type` is one of: `Agente`, `Worker`, `Humano`, `Clone`
- `atomic_layer` is one of the structural or functional values listed above
- `Entrada` array has at least one entry
- `Saida` array has at least one entry
- `Checklist` contains both `pre-conditions` and `post-conditions` arrays
- Each `Entrada` item has all four fields: `campo`, `tipo`, `origen`, `obrigatorio`
- Each `Saida` item has all four fields: `campo`, `tipo`, `destino`, `persistido`
- `responsavel` value matches an agent name or role defined in the squad

---

*Reference extracted from AIOS Core official documentation.*
*Last updated: 2026-02-20*
