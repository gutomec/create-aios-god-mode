# Workflow Format Reference

**Sources:**
- [workflow-patterns.yaml](https://github.com/SynkraAI/aios-core/blob/main/.aios-core/data/workflow-patterns.yaml) -- Pattern definitions
- [workflow-state-schema.yaml](https://github.com/SynkraAI/aios-core/blob/main/.aios-core/data/workflow-state-schema.yaml) -- Runtime state tracking
- [squads-guide.md](https://github.com/SynkraAI/aios-core/blob/main/docs/guides/squads-guide.md) -- Squad workflow integration

**Confidence:** MEDIUM

> There is no single WORKFLOW-FORMAT-SPECIFICATION-V1 in AIOS Core. This reference is synthesized from the 3 sources listed above to provide a unified view of workflow definitions and their runtime state.

---

## Workflow Definition Structure

A workflow definition is a YAML file (`.yaml`) that describes an ordered sequence of agent actions, trigger conditions, and transition logic.

| Field | Type | Description |
|-------|------|-------------|
| `workflow_name` | string | Unique workflow identifier (snake_case) |
| `description` | string | Human-readable summary of the workflow's purpose. **MUST be inline quoted string** — never use YAML multi-line (`\|` or `>`), parsed as `object,object` by AIOS |
| `agent_sequence` | array | Ordered list of agent IDs involved in this workflow |
| `key_commands` | array | Slash commands that trigger this workflow (e.g., `*develop-story`) |
| `trigger_threshold` | integer | Number of trigger signals needed before auto-activation (default: 2) |
| `typical_duration` | string | Estimated execution time (e.g., `"2-4 hours"`) |
| `success_indicators` | array | Conditions that define successful completion |
| `transitions` | object | State transition definitions keyed by transition name |

### Transition Object

Each key in `transitions` maps to a transition definition:

| Field | Type | Description |
|-------|------|-------------|
| `trigger` | string | Event or condition that activates this transition |
| `confidence` | float | Confidence threshold (0.0 to 1.0) for automatic transition |
| `greeting_message` | string | Status message displayed when transition activates |
| `next_steps` | array | Actions to execute after transition |
| `next_steps[].command` | string | Command to invoke |
| `next_steps[].args_template` | string | Argument template with placeholders |
| `next_steps[].description` | string | Human-readable description of this step |
| `next_steps[].priority` | integer | Execution priority (lower = higher priority) |

---

## Workflow State Schema (Runtime)

When a workflow executes, AIOS Core tracks its state using this schema:

| Field | Type | Description |
|-------|------|-------------|
| `workflow_id` | string | Unique identifier for this workflow definition |
| `workflow_name` | string | Human-readable workflow name |
| `instance_id` | string | Unique identifier for this execution instance |
| `target_context` | enum | Execution scope: `core` \| `squad` \| `hybrid` |
| `status` | enum | Current state: `active` \| `paused` \| `completed` \| `aborted` |
| `started_at` | string | Start timestamp (ISO-8601) |
| `updated_at` | string | Last update timestamp (ISO-8601) |
| `current_phase` | string | Name of the active phase |
| `current_step_index` | integer | Zero-based index of the current step within the phase |
| `steps` | array | Execution log of all steps |
| `artifacts` | object | Global registry of output files produced |
| `decisions` | array | Audit log of choices made during execution |

### Step Object

Each entry in the `steps` array records one executed step:

| Field | Type | Description |
|-------|------|-------------|
| `phase` | string | Phase this step belongs to |
| `agent` | string | Agent ID that executed this step |
| `action` | string | Description of what was done |
| `status` | enum | `pending` \| `in_progress` \| `completed` \| `failed` \| `skipped` |
| `started_at` | string | Step start timestamp (ISO-8601) |
| `completed_at` | string | Step completion timestamp (ISO-8601) |
| `artifacts_created` | array | Files produced by this step |
| `notes` | string | Free-text observations or issues |

---

## Available Patterns

AIOS Core provides 10 predefined workflow patterns. Squads select and customize these based on their domain:

| Pattern | Description |
|---------|-------------|
| `story_development` | Complete story lifecycle from analysis through implementation and QA |
| `epic_creation` | Epic planning with breakdown into stories, estimation, and prioritization |
| `backlog_management` | Backlog grooming, prioritization, and sprint planning |
| `architecture_review` | Architecture evaluation, diagramming, and decision documentation |
| `git_workflow` | Branch management, commit conventions, PR review, and merge protocols |
| `database_workflow` | Schema design, migration creation, indexing, and data integrity checks |
| `code_quality_workflow` | Code review, linting, testing, and refactoring cycles |
| `documentation_workflow` | Documentation creation, review, and maintenance across the project |
| `ux_workflow` | UX research, wireframing, prototyping, and usability testing |
| `research_workflow` | Domain research, competitive analysis, and technology evaluation |

---

## Complete Example

```yaml
# Workflow: story_development (sequential pattern)
workflow_name: story_development
description: "Complete story lifecycle from requirements analysis through implementation, testing, and documentation"

agent_sequence:
  - analyst
  - architect
  - dev
  - qa

key_commands:
  - "*develop-story"
  - "*implement-feature"

trigger_threshold: 2
typical_duration: "2-4 hours"

success_indicators:
  - "All acceptance criteria met"
  - "Tests passing with adequate coverage"
  - "Code reviewed and approved"
  - "Documentation updated"

transitions:
  analysis_complete:
    trigger: "requirements analyzed and acceptance criteria defined"
    confidence: 0.85
    greeting_message: "Analysis complete. Architecture phase starting."
    next_steps:
      - command: "*design-architecture"
        args_template: "{story_id}"
        description: "Design technical approach for the story"
        priority: 1

  architecture_approved:
    trigger: "architecture reviewed and approved"
    confidence: 0.90
    greeting_message: "Architecture approved. Implementation starting."
    next_steps:
      - command: "*implement-story"
        args_template: "{story_id} --branch={feature_branch}"
        description: "Begin implementation based on architecture decisions"
        priority: 1

  implementation_complete:
    trigger: "all code written and unit tests passing"
    confidence: 0.80
    greeting_message: "Implementation complete. QA review starting."
    next_steps:
      - command: "*review-code"
        description: "Run code quality checks and review"
        priority: 1
      - command: "*run-tests"
        description: "Execute full test suite"
        priority: 2

  qa_approved:
    trigger: "all tests passing and code review approved"
    confidence: 0.95
    greeting_message: "QA approved. Story complete."
    next_steps:
      - command: "*merge-branch"
        args_template: "{feature_branch}"
        description: "Merge feature branch to main"
        priority: 1
      - command: "*update-docs"
        description: "Update project documentation"
        priority: 2
```

---

## Squad Customization

Squads customize workflows by:

1. **Selecting patterns:** Choose from the 10 available patterns based on the squad's domain
2. **Adapting agent sequences:** Replace generic agent IDs (`analyst`, `dev`) with squad-specific agent IDs (`data-extractor`, `transformer`)
3. **Modifying transitions:** Adjust triggers, confidence thresholds, and next-step commands to match the squad's pipeline
4. **Adding domain-specific success indicators:** Replace generic indicators with domain-specific criteria

The workflow file lives in the squad's directory and is listed in `squad.yaml` under `components.workflows`.

---

*Reference synthesized from multiple AIOS Core sources (see header).*
*Last updated: 2026-02-20*
