# Padrões de Codificação — AIOS Forge Squad

## Visão Geral

Este documento define os padrões de codificação obrigatórios para todos os artefatos produzidos pelo AIOS Forge Squad. Todos os contribuidores e agentes devem seguir estas convenções rigorosamente.

---

## Linguagens e Formatos

| Tipo de Artefato | Linguagem/Formato | Extensão |
|------------------|-------------------|----------|
| Agentes | Markdown (AIOS format) | `.md` |
| Tasks | Markdown (AIOS format) | `.md` |
| Workflows | YAML | `.yaml` |
| Squad Manifest | YAML | `.yaml` |
| Scripts | JavaScript (Node.js) | `.js` |
| Configuração | Markdown ou YAML | `.md` / `.yaml` |

---

## Convenções de Nomenclatura

### Identificadores

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Agent ID | `kebab-case` | `aios-forge`, `aios-sentinel` |
| Agent filename | `kebab-case.md` | `aios-forge.md` |
| Task identifier | `camelCase()` | `analyzeAiosComponent()`, `createAgent()` |
| Task filename | `kebab-case.md` | `analyze-aios-component.md`, `create-agent.md` |
| Workflow name | `snake_case` | `forge_artifact`, `optimize_framework` |
| Workflow filename | `kebab-case.yaml` | `forge-artifact.yaml`, `optimize-framework.yaml` |
| Command name | `*kebab-case` | `*create-agent`, `*validate-artifact` |
| Variáveis em código | `camelCase` (inglês) | `const taskResult = ...` |
| Constantes | `UPPER_SNAKE_CASE` (inglês) | `const MAX_ITERATIONS = 5` |

### Regra de Ouro

- **Nomes de variáveis, funções e código**: sempre em **inglês** (padrão internacional mundial)
- **Conteúdo textual** (descrições, documentação, mensagens): sempre em **PT-BR** com acentuação correta

---

## Idioma e Codificação

| Aspecto | Padrão |
|---------|--------|
| Codificação de arquivos | **UTF-8** (obrigatório) |
| Idioma do conteúdo | **Português (PT-BR)** com acentuação correta |
| Idioma de código/variáveis | **Inglês** (padrão internacional) |
| Acentuação | **Obrigatória** — nunca remover acentos |

### Exemplos de Acentuação Correta

- "Descrição" (nunca "Descricao")
- "Validação" (nunca "Validacao")
- "Configuração" (nunca "Configuracao")
- "Otimização" (nunca "Otimizacao")

---

## Formatação YAML

| Regra | Valor |
|-------|-------|
| Indentação | **2 espaços** (nunca tabs) |
| Comprimento máximo de linha | **120 caracteres** |
| Strings com caracteres especiais | Aspas duplas (`"`) |
| Strings multiline | Block scalar (`>` ou `|`) |
| Listas | Prefixo `- ` com 2 espaços de indentação |
| Comentários | `#` com espaço após o símbolo |

### Exemplo

```yaml
# Configuração do workflow
name: forge_artifact
description: >
  Workflow de criação de artefatos AIOS com validação
  constitucional integrada.

steps:
  - name: analyze
    agent: aios-oracle
    task: analyze-aios-component.md
  - name: create
    agent: aios-forge
    task: create-agent.md
```

---

## Estrutura de Agentes

Cada agente **deve** conter:

1. **YAML Frontmatter** — Metadados do agente (id, name, role, version, etc.)
2. **Quick Commands Table** — Tabela de comandos rápidos disponíveis
3. **Agent Collaboration** — Seção de colaboração com outros agentes
4. **Usage Guide** — Guia de uso com exemplos práticos

### Exemplo de Estrutura

```markdown
---
id: aios-forge
name: "Forge"
role: "Criador de Artefatos AIOS"
version: 1.0.0
---

# Forge — Criador de Artefatos AIOS

## Quick Commands

| Comando | Descrição |
|---------|-----------|
| `*create-agent` | Cria um novo agente AIOS |

## Agent Collaboration
...

## Usage Guide
...
```

---

## Estrutura de Tasks

Cada task **deve** conter:

1. **YAML Frontmatter** — Metadados da task (id, name, type, version, etc.)
2. **Pipeline Diagram** — Diagrama ASCII do fluxo de execução
3. **Description** — Descrição detalhada com inputs, outputs e steps

### Exemplo de Estrutura

```markdown
---
id: create-agent
name: "createAgent()"
type: task
version: 1.0.0
---

# createAgent() — Criação de Agente AIOS

## Pipeline

```
[Input] → [Análise] → [Geração] → [Validação] → [Output]
```

## Descrição
...
```

---

## Regras Gerais

1. **Sem BOM** — Arquivos UTF-8 sem Byte Order Mark
2. **Linha final** — Todo arquivo deve terminar com uma linha em branco
3. **Sem trailing whitespace** — Espaços em branco no final de linhas são proibidos
4. **Headings** — Use `#` para headings em Markdown (nunca underline style)
5. **Links relativos** — Prefira links relativos dentro do squad
6. **Separadores** — Use `---` para separar seções principais em documentos longos
