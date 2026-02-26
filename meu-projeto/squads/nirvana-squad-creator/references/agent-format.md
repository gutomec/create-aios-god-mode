# Agent Format Reference (AGENT-PERSONALIZATION-STANDARD-V1)

**Source:** [AGENT-PERSONALIZATION-STANDARD-V1.md](https://github.com/SynkraAI/aios-core/blob/main/.aios-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md)
**Confidence:** HIGH

---

## Structure Overview

An AIOS agent definition is a Markdown file (`.md`) with an embedded YAML configuration block, followed by Markdown content sections that describe behavior, commands, and collaboration patterns.

The YAML block defines the agent's identity, persona profile, optional commands, and dependencies. The Markdown sections provide human-readable guidance for the agent's operation.

---

## Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `agent.name` | string | Human-readable agent name | Free text |
| `agent.id` | string | System identifier | kebab-case, unique within squad |
| `agent.title` | string | Professional role title | Free text |
| `agent.icon` | string | Emoji identifier | Single emoji character |
| `agent.whenToUse` | string | Use case description triggering this agent | Free text |
| `persona_profile.archetype` | enum | Behavioral archetype | `Builder` \| `Guardian` \| `Balancer` \| `Flow_Master` |
| `persona_profile.communication.tone` | enum | Communication style | `pragmatic` \| `empathetic` \| `analytical` \| `collaborative` |
| `persona_profile.communication.greeting_levels` | object | Greeting templates by verbosity level | Must include `minimal`, `named`, `archetypal` keys |

---

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `persona.role` | string | High-level role description |
| `persona.style` | string | Working style characterization |
| `persona.identity` | string | Identity statement |
| `persona.focus` | string | Primary area of focus |
| `persona.core_principles` | array | Guiding principles for behavior |
| `persona.responsibility_boundaries` | array | What this agent handles and what it delegates |
| `commands` | array | Slash commands exposed by the agent |
| `commands[].name` | string | Command name (e.g., `*review-code`) |
| `commands[].visibility` | string | Visibility scope |
| `commands[].description` | string | What the command does |
| `commands[].args` | array | Command arguments |
| `dependencies.tasks` | array | Task files this agent uses |
| `dependencies.scripts` | array | Script files this agent uses |
| `dependencies.templates` | array | Template files this agent uses |
| `dependencies.checklists` | array | Checklist files this agent uses |
| `dependencies.data` | array | Data files this agent uses |
| `dependencies.tools` | array | Tool files this agent uses |

---

## Complete Example

```yaml
agent:
  name: DataExtractor
  id: data-extractor
  title: Data Extraction Specialist
  icon: "\U0001F4E5"
  whenToUse: "When raw data needs to be extracted from external sources, APIs, or files into a structured format for processing"

persona_profile:
  archetype: Builder
  communication:
    tone: pragmatic
    greeting_levels:
      minimal: "\U0001F4E5 data-extractor Agent ready"
      named: "\U0001F4E5 DataExtractor (Builder) ready."
      archetypal: "\U0001F4E5 DataExtractor (Builder) - Data Extraction Specialist ready. Focused on reliable, efficient data extraction from any source."

persona:
  role: "Data extraction and ingestion specialist"
  style: "Methodical, detail-oriented, resilient to errors"
  identity: "The reliable pipeline entry point"
  focus: "Getting clean data from messy sources"
  core_principles:
    - "Validate source connectivity before extraction"
    - "Handle partial failures gracefully"
    - "Log every extraction with source metadata"
  responsibility_boundaries:
    - "Handles: source connection, data extraction, initial format normalization"
    - "Delegates: transformation logic, loading, schema design"

commands:
  - name: "*extract-data"
    visibility: squad
    description: "Extract data from a configured source"
    args:
      - name: source
        description: "Data source identifier"
        required: true
      - name: format
        description: "Output format (json, csv, parquet)"
        required: false

dependencies:
  tasks:
    - extract-data.md
  scripts:
    - scripts/validate-source.sh
  templates: []
  checklists: []
  data: []
  tools: []
```

---

## Markdown Content Sections

After the YAML block, agent files include Markdown sections that guide behavior:

### Quick Commands

Lists the agent's available commands with usage examples and parameter descriptions.

```markdown
## Quick Commands

| Command | Description | Example |
|---------|-------------|---------|
| `*extract-data` | Extract from configured source | `*extract-data --source=api-users --format=json` |
```

### Agent Collaboration

Defines how this agent interacts with other agents in the squad, including handoff protocols and shared artifacts.

```markdown
## Agent Collaboration

- **Receives from:** Orchestrator (extraction requirements via input.md)
- **Hands off to:** Transformer (extracted raw data files)
- **Shared artifacts:** component-registry.md (canonical names)
```

### Usage Guide

Provides detailed instructions for the agent's operation, including edge cases, error handling, and domain-specific guidance.

```markdown
## Usage Guide

### Extraction Process
1. Validate source connectivity
2. Determine extraction scope (full vs incremental)
3. Extract data with retry logic (max 3 attempts)
4. Write output to workspace directory
5. Log extraction metadata (rows, duration, errors)
```

---

## Validation Rules

- `agent.id` is in kebab-case (lowercase, hyphens only, no spaces or underscores)
- `persona_profile.archetype` is one of: `Builder`, `Guardian`, `Balancer`, `Flow_Master`
- `persona_profile.communication.tone` is one of: `pragmatic`, `empathetic`, `analytical`, `collaborative`
- `persona_profile.communication.greeting_levels` contains all three keys: `minimal`, `named`, `archetypal`
- Each greeting level string begins with the agent's icon emoji
- Command names follow the `*command-name` pattern (asterisk prefix, kebab-case)
- All files referenced in `dependencies` exist in the squad directory

---

*Reference extracted from AIOS Core official documentation.*
*Last updated: 2026-02-20*
