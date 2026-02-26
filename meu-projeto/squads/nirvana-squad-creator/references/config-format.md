# Config Format Reference

**Source:** [squads-guide.md](https://github.com/SynkraAI/aios-core/blob/main/docs/guides/squads-guide.md)
**Confidence:** MEDIUM (no formal spec -- these are freeform Markdown files with domain-specific content)

---

## Structure Overview

The `config/` directory in an AIOS squad contains 3 Markdown files that define the squad's coding conventions, technology choices, and project structure. These files have no formal schema -- their content is domain-specific and varies by squad.

The config files serve two purposes:
1. **Agent guidance:** Agents read these files to generate code and artifacts that match the project's conventions
2. **Inheritance:** AIOS Core merges squad config with its defaults based on the inheritance mode declared in `squad.yaml`

---

## Config Files

### `config/coding-standards.md`

Defines the code style rules, naming conventions, and documentation standards for the squad's domain.

**Typical sections:**

| Section | Content |
|---------|---------|
| Languages | Primary and secondary languages used |
| Formatting Rules | Indentation, line length, quotation style |
| Naming Conventions | Variable, function, file, and directory naming patterns |
| Documentation | Comment style, JSDoc/docstring requirements |
| Testing Standards | Test file naming, coverage expectations, test patterns |
| Error Handling | Error propagation rules, logging conventions |

**Mini-example:**

```markdown
# Coding Standards

## Languages
- Primary: TypeScript (strict mode)
- Secondary: SQL (PostgreSQL dialect)

## Naming Conventions
- Files: kebab-case (e.g., `data-extractor.ts`)
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase

## Testing
- Test files: `*.test.ts` co-located with source
- Minimum coverage: 80% for business logic
```

---

### `config/tech-stack.md`

Documents the technologies, frameworks, libraries, and infrastructure used by the squad's target project.

**Typical sections:**

| Section | Content |
|---------|---------|
| Core Stack | Primary runtime, framework, language versions |
| Dependencies | Key libraries with purpose and version constraints |
| Dev Tools | Linters, formatters, test runners, build tools |
| Infrastructure | Hosting, databases, message queues, caching |
| APIs | External services and integrations |

**Mini-example:**

```markdown
# Tech Stack

## Core Stack
- Runtime: Node.js 20 LTS
- Framework: Express 4.x
- Language: TypeScript 5.x
- Database: PostgreSQL 16

## Dependencies
- `pg`: PostgreSQL client
- `csv-parser`: CSV file processing
- `zod`: Runtime schema validation

## Dev Tools
- ESLint + Prettier
- Vitest for testing
- Docker for local development
```

---

### `config/source-tree.md`

Maps the expected directory structure of the target project, including file naming conventions and key paths.

**Typical sections:**

| Section | Content |
|---------|---------|
| Directory Structure | Tree visualization of the project layout |
| File Naming | Naming conventions per directory |
| Key Paths | Important directories with descriptions |
| Generated Files | Directories containing auto-generated content |

**Mini-example:**

```markdown
# Source Tree

## Directory Structure
```
src/
├── extractors/     # Data source extractors
├── transformers/   # Data transformation logic
├── loaders/        # Data destination loaders
├── shared/         # Shared utilities and types
├── config/         # Runtime configuration
└── index.ts        # Entry point
```

## Key Paths
- `src/extractors/`: One file per data source
- `src/transformers/`: One file per transformation rule set
- `migrations/`: Database migration files (timestamped)
```

---

## Config Inheritance Modes

The inheritance mode is declared in `squad.yaml` under `config.extends`:

| Mode | Behavior | Use When |
|------|----------|----------|
| `extend` | Squad's config adds rules on top of AIOS Core defaults. Both sets of rules apply. | Most squads. Standard conventions with domain-specific additions. |
| `override` | Squad's config replaces AIOS Core defaults entirely. Only squad rules apply. | Squads with specialized conventions that conflict with defaults. |
| `none` | No config inheritance. Squad operates standalone. | Fully self-contained squads with no dependency on core conventions. |

Cross-reference: The inheritance mode and config file paths are declared in `squad.yaml`. See [squad-yaml-schema.md](squad-yaml-schema.md) for the full manifest schema.

---

## Content Guidelines

Config files are freeform Markdown with no required fields. The templates above provide a structural guide, but the actual content is entirely domain-specific. When generating config files for a squad:

- Keep sections concise and actionable
- Use tables for structured data (versions, naming rules)
- Include concrete examples rather than abstract descriptions
- Reference specific tool versions and configurations
- Tailor content to the squad's domain (an ETL squad has different standards than a UI squad)

---

*Reference extracted from AIOS Core official documentation.*
*Last updated: 2026-02-20*
