# Tech Stack — AIOS Forge Squad

## Visão Geral

Este documento descreve a stack tecnológica utilizada pelo AIOS Forge Squad, incluindo runtime, formatos, integrações e dependências.

---

## Runtime e Ambiente

| Componente | Versão/Requisito | Notas |
|------------|------------------|-------|
| **Node.js** | 18+ | Runtime obrigatório para scripts e CLI |
| **AIOS Core** | >= 2.1.0 | Versão mínima do framework |
| **npm** | 9+ | Gerenciador de pacotes |
| **Git** | 2.30+ | Controle de versão |
| **GitHub CLI** | 2.0+ | Integração com GitHub |

---

## Formatos e Especificações

### Formato de Agentes

| Especificação | Versão |
|---------------|--------|
| **AGENT-PERSONALIZATION-STANDARD** | V1 |

Formato padrão AIOS para definição de agentes com:
- YAML frontmatter (metadados estruturados)
- Markdown body (persona, comandos, guia de uso)
- Seções obrigatórias: Quick Commands, Agent Collaboration, Usage Guide

### Formato de Tasks

| Especificação | Versão |
|---------------|--------|
| **TASK-FORMAT-SPECIFICATION** | V1 |

Formato padrão AIOS para definição de tasks com:
- YAML frontmatter (metadados, inputs, outputs, dependencies)
- Pipeline diagram (fluxo de execução visual)
- Descrição detalhada com steps numerados

---

## Claude Code

| Aspecto | Detalhe |
|---------|---------|
| **Versão** | Latest (Fev 2026) |
| **Modelo** | Claude Opus 4.6 |

### Funcionalidades Utilizadas

| Feature | Uso no Squad |
|---------|-------------|
| **Custom Agents** | 7 agentes especializados via `@agent` |
| **Skills** | Criação de skills via `*create-skill` |
| **Teams** | Coordenação multi-agente via Oracle |
| **Hooks** | Pre/post-commit, validação automática |
| **Rules** | `.claude/rules/` para contexto automático |
| **Memory** | `MEMORY.md` por agente para persistência |
| **MCP Servers** | Integração com ferramentas externas |
| **CLAUDE.md** | Instruções globais e por projeto |

---

## Self-Update e Pesquisa

O squad possui capacidade de auto-atualização através do agente `@aios-scout`:

| Ferramenta | Propósito |
|------------|-----------|
| **WebSearch** | Busca por atualizações, novos padrões e melhores práticas |
| **WebFetch** | Captura de conteúdo de documentação e changelogs |
| **curl** | Verificação de datetime e APIs REST |

### Fontes de Atualização

- Documentação oficial do Claude Code
- Changelogs do Anthropic
- Release notes do AIOS Core
- Melhores práticas da comunidade
- Padrões emergentes de AI-assisted development

---

## Integrações

### MCP Servers

| Servidor | Propósito |
|----------|-----------|
| **context7** | Documentação de bibliotecas em tempo real |
| **shadcn** | Componentes UI (quando aplicável) |
| **GitHub CLI** | Operações de repositório |
| **Docker Gateway** | Infraestrutura MCP |

### Quality Gates

| Gate | Descrição |
|------|-----------|
| **Validação Constitucional** | Verificação contra os 6 artigos |
| **CodeRabbit** | Review automatizado de código |
| **QA Gate** | 7 verificações de qualidade |
| **Story Validation** | Checklist de 10 pontos |

### IDS Registry

| Aspecto | Detalhe |
|---------|---------|
| **IDS** | Incremental Development System |
| **Registro** | Todos os artefatos são registrados no IDS |
| **Rastreabilidade** | Cada componente tem ID único e versionamento |

---

## Constituição AIOS — 6 Artigos

A Constituição AIOS é a lei suprema do framework. Todo artefato criado pelo squad deve estar em conformidade.

| Artigo | Nome | Descrição |
|--------|------|-----------|
| **I** | CLI First | CLI é a interface primária; UI é secundária |
| **II** | Agent Authority | Cada agente tem autoridade exclusiva sobre suas operações |
| **III** | Story-Driven | Todo desenvolvimento parte de uma story |
| **IV** | No Invention | Nenhuma feature inventada — tudo rastreável a requisitos |
| **V** | Quality First | Qualidade não é negociável — gates são obrigatórios |
| **VI** | Absolute Imports | Imports absolutos sempre; relativos apenas dentro do mesmo módulo |

---

## Compatibilidade

| Plataforma | Suporte |
|------------|---------|
| macOS | Completo |
| Linux | Completo |
| Windows (WSL) | Completo via WSL2 |
| Windows (nativo) | Parcial (requer adaptações) |
