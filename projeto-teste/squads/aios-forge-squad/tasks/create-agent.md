---
task: createAgent()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: agentName
    tipo: string
    descricao: "Nome do agente em kebab-case (ex: aios-oracle, data-engineer)"
    obrigatorio: true
    validacao: "Deve seguir convenção kebab-case, sem espaços ou caracteres especiais"
  - nome: agentRole
    tipo: string
    descricao: "Descrição concisa do papel/função do agente no squad"
    obrigatorio: true
    validacao: "Deve ser não-vazio e descrever claramente a responsabilidade"
  - nome: archetype
    tipo: string
    descricao: "Arquétipo comportamental (strategist, executor, analyst, guardian, creator, connector)"
    obrigatorio: true
    validacao: "Deve ser um dos arquétipos válidos do AIOS"
  - nome: commands
    tipo: array
    descricao: "Especificações de comandos do agente com nome, descrição, visibilidade e args"
    obrigatorio: true
    validacao: "Mínimo 3 comandos (*help, *exit + pelo menos 1 operacional)"
  - nome: dependencies
    tipo: object
    descricao: "Objeto com tasks, templates, checklists e data files que o agente usa"
    obrigatorio: false
    validacao: "Se fornecido, todos os artefatos referenciados devem existir ou serão marcados como TODO"
  - nome: targetSquad
    tipo: string
    descricao: "Nome do squad destino para salvar o agente (kebab-case)"
    obrigatorio: false
    validacao: "Se fornecido, squad deve existir em squads/"

Saida:
  - nome: agentFile
    tipo: file
    descricao: "Arquivo .md completo do agente seguindo AGENT-PERSONALIZATION-STANDARD-V1"
    destino: "squads/{targetSquad}/agents/{agentName}.md"
    persistido: true
  - nome: validationResult
    tipo: object
    descricao: "Resultado da validação de formato e qualidade do agente gerado"
    destino: "Memory"
    persistido: false
  - nome: commandLoaderBlock
    tipo: object
    descricao: "Bloco command_loader gerado para o agente"
    destino: "Embutido no agentFile"
    persistido: true

Checklist:
  pre-conditions:
    - "[ ] agentName segue convenção kebab-case"
    - "[ ] Não existe agente com mesmo ID no squad destino"
    - "[ ] agentRole é não-vazio e descritivo"
    - "[ ] archetype é um dos valores válidos (strategist, executor, analyst, guardian, creator, connector)"
    - "[ ] commands array contém pelo menos 3 comandos incluindo *help e *exit"
    - "[ ] Se targetSquad fornecido, diretório squads/{targetSquad}/ existe"
  post-conditions:
    - "[ ] Arquivo do agente segue AGENT-PERSONALIZATION-STANDARD-V1 completo"
    - "[ ] YAML frontmatter é válido e parseable"
    - "[ ] Todas as 3 seções Markdown presentes: Quick Commands, Agent Collaboration, Usage Guide"
    - "[ ] persona_profile contém archetype e communication style"
    - "[ ] greeting_levels tem 3 níveis (brief, standard, detailed)"
    - "[ ] persona contém role, style, identity, focus, core_principles, responsibility_boundaries"
    - "[ ] Todos os comandos têm visibility, description e args definidos"
    - "[ ] command_loader mapeia todos os comandos operacionais para task files"
    - "[ ] dependencies referenciam artefatos existentes ou marcados com TODO"
    - "[ ] Linha count >= 200 para agente básico, >= 300 para agente completo"

Performance:
  duration_expected: "3-5 minutos"
  cost_estimated: "~4000 tokens (Opus)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — agente é artefato fundamental do AIOS"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "5s"
  fallback: "Gerar template do agente com marcadores TODO nos campos incompletos"
  notification: "orchestrator"
  common_errors:
    - error: "Duplicate Agent ID"
      cause: "Já existe agente com mesmo nome no squad"
      resolution: "Verificar agentes existentes e sugerir nome alternativo"
    - error: "Invalid Archetype"
      cause: "Arquétipo fornecido não é um dos valores válidos"
      resolution: "Listar arquétipos válidos e solicitar seleção"
    - error: "Missing Dependencies"
      cause: "Artefatos em dependencies não existem no filesystem"
      resolution: "Marcar como TODO e listar para criação posterior"

Metadata:
  story: "Como Forge Squad, preciso criar agentes completos que seguem o padrão AIOS"
  version: "1.0.0"
  dependencies:
    - "AGENT-PERSONALIZATION-STANDARD-V1"
    - "Conhecimento do sistema de agentes AIOS (11 core agents)"
  tags:
    - creation
    - agent
    - persona
    - command-loader
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# createAgent()

## Pipeline Diagram

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  agentName    │  │  agentRole    │  │  archetype    │
│  (string)     │  │  (string)     │  │  (string)     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────┬───────┴─────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│                     Forge Agent                       │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ 1. Validate │─▶│ 2. Structure │─▶│ 3. Generate │ │
│  │    Inputs   │  │    Persona   │  │    File     │ │
│  └─────────────┘  └──────────────┘  └──────┬──────┘ │
│                                            │        │
│  ┌─────────────┐  ┌──────────────┐         │        │
│  │ 5. Validate │◀─│ 4. Build     │◀────────┘        │
│  │    Output   │  │    CmdLoader │                   │
│  └──────┬──────┘  └──────────────┘                   │
│         │                                            │
└─────────┼────────────────────────────────────────────┘
          │
          ▼
┌──────────────────┐  ┌──────────────────┐
│  agentFile       │  │  validationResult │
│  (.md completo)  │  │  (quality check)  │
└──────────────────┘  └──────────────────┘
          │
          ▼
┌───────────────────────────────────────────┐
│  Estrutura do Arquivo do Agente           │
│                                           │
│  ┌─ YAML Frontmatter ──────────────────┐ │
│  │  persona_profile                     │ │
│  │  greeting_levels (3)                 │ │
│  │  persona (role/style/identity/focus) │ │
│  │  core_principles                     │ │
│  │  responsibility_boundaries           │ │
│  │  commands[]                          │ │
│  │  command_loader{}                    │ │
│  │  dependencies{}                      │ │
│  └──────────────────────────────────────┘ │
│                                           │
│  ┌─ Markdown Body ─────────────────────┐ │
│  │  ## Quick Commands (tabela)          │ │
│  │  ## Agent Collaboration              │ │
│  │    - Receives From                   │ │
│  │    - Hands Off To                    │ │
│  │    - Shared Artifacts                │ │
│  │  ## Usage Guide                      │ │
│  │    - Operações detalhadas            │ │
│  │    - Exemplos de uso                 │ │
│  └──────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

## Descrição

A task `createAgent()` é uma das **tasks fundamentais** do AIOS Forge Squad. Gera um arquivo de agente completo seguindo o padrão AGENT-PERSONALIZATION-STANDARD-V1, incluindo YAML frontmatter com persona, comandos e command_loader, além do corpo Markdown com documentação operacional.

### Responsabilidades

1. **Validação de Inputs** — Verificar que todos os inputs obrigatórios estão presentes e válidos antes de iniciar a geração:
   - agentName segue kebab-case (`/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`)
   - Não existe agente duplicado no squad destino
   - archetype é um valor reconhecido
   - commands tem pelo menos 3 entries

2. **Estruturação da Persona** — Construir a persona completa do agente baseada nos inputs:
   - **persona_profile**: archetype (ex: "O Guardião Analítico"), communication (tom, verbosidade, formalidade)
   - **greeting_levels**: 3 níveis de saudação (brief para YOLO mode, standard para Interactive, detailed para Pre-Flight)
   - **persona**: role (responsabilidade central), style (como se comunica), identity (quem é), focus (objetivo primário)
   - **core_principles**: 5-10 princípios fundamentais derivados do role e archetype
   - **responsibility_boundaries**: o que o agente FAZ e o que NÃO FAZ (delega)

3. **Geração do Arquivo** — Criar o arquivo .md com estrutura completa:

   **YAML Frontmatter** deve incluir:
   ```yaml
   name: "Agent Name"
   id: agent-name
   title: "Título descritivo"
   icon: "emoji apropriado"
   whenToUse: "Descrição de quando ativar este agente"

   persona_profile:
     archetype: "Descrição do arquétipo"
     communication:
       tom: formal | casual | técnico
       verbosity: concise | moderate | detailed
       formality: high | medium | low

   greeting_levels:
     brief: "Saudação curta (1 linha)"
     standard: "Saudação padrão (2-3 linhas)"
     detailed: "Saudação detalhada com contexto (5+ linhas)"

   persona:
     role: "Descrição da responsabilidade"
     style: "Como se comunica e opera"
     identity: "Quem é este agente"
     focus: "Objetivo primário"

   core_principles:
     - "Princípio 1"
     - "Princípio 2"

   responsibility_boundaries:
     owns:
       - "Responsabilidade exclusiva 1"
     delegates:
       - "Delega para @outro-agente: operação X"

   commands:
     - name: "*command"
       description: "O que faz"
       visibility: full | quick | key | hidden
       args:
         - name: arg1
           type: string
           required: true

   command_loader:
     "*command":
       description: "O que faz"
       requires:
         - "tasks/command-workflow.md"
       optional:
         - "data/reference-data.md"

   dependencies:
     tasks: []
     templates: []
     checklists: []
     data: []
   ```

   **Markdown Body** deve incluir 3 seções obrigatórias:

   | Seção | Conteúdo |
   |-------|----------|
   | Quick Commands | Tabela com todos os comandos, descrição e args |
   | Agent Collaboration | Receives From, Hands Off To, Shared Artifacts |
   | Usage Guide | Instruções detalhadas de operação com exemplos |

4. **Build do Command Loader** — Para cada comando operacional (não utility):
   - Mapear para task file correspondente em `requires[]`
   - Adicionar data files opcionais em `optional[]`
   - Incluir `CRITICAL_LOADER_RULE` no agente
   - Garantir que command_loader cobre TODOS os comandos operacionais

5. **Validação do Output** — Executar validação de qualidade antes de salvar:
   - YAML é parseable sem erros
   - Todas as seções obrigatórias presentes
   - Contagem de linhas >= 200
   - Comandos todos documentados
   - Dependencies verificadas (existem ou marcadas TODO)

### Arquétipos Válidos

| Archetype | Descrição | Exemplo de Agente |
|-----------|-----------|-------------------|
| `strategist` | Planeja, prioriza, orquestra | @pm, @po, @sm |
| `executor` | Implementa, constrói, codifica | @dev, @forge |
| `analyst` | Analisa, pesquisa, diagnostica | @analyst, @oracle |
| `guardian` | Valida, protege, audita | @qa, @sentinel |
| `creator` | Cria, inova, gera | @forge, @catalyst |
| `connector` | Integra, conecta, sincroniza | @nexus, @devops |

### Regras de Geração

- **Nomes**: `agentName` em kebab-case no ID, PascalCase no display name
- **Comandos**: Mínimo 3 (`*help`, `*exit` + operacionais), cada um com visibility
- **Persona**: Coerente com archetype — um `guardian` não deve ter tom casual por default
- **Core Principles**: Derivados do role, não genéricos — devem ser específicos ao domínio
- **Boundaries**: Explícitas — o que FAZ e o que DELEGA para outros agentes
- **Command Loader**: Todo comando operacional DEVE ter entry no command_loader
- **CRITICAL_LOADER_RULE**: Deve estar presente verbatim no agente

### Validação de Qualidade (SC_AGT_001 Adaptado)

| Dimensão | Peso | Critério |
|----------|------|----------|
| Estrutura | 0.25 | YAML válido, seções presentes, formato correto |
| Persona | 0.20 | Role/style/identity coerentes com archetype |
| Comandos | 0.20 | Todos documentados, command_loader completo |
| Principles | 0.15 | Específicos ao domínio, mínimo 5 |
| Boundaries | 0.10 | Owns e delegates explícitos |
| Documentation | 0.10 | Quick Commands, Collaboration, Usage Guide presentes |

**Threshold**: Score >= 7.0 para PASS, < 7.0 requer iteração.

### Integração com Outros Tasks

| Task Relacionada | Relação |
|-----------------|---------|
| `createTask()` | Cria task files referenciados no command_loader |
| `createTemplate()` | Cria templates referenciados em dependencies |
| `validateArtifact()` | Valida o agente gerado contra SC_AGT_001 |
| `analyzeAiosComponent()` | Analisa agentes existentes para referência |
| `createSquad()` | Usa createAgent() para gerar cada agente do squad |
