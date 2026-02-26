---
task: createTask()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: taskName
    tipo: string
    descricao: "Identificador da task em camelCase seguido de () — ex: analyzePerformance()"
    obrigatorio: true
    validacao: "Deve seguir padrão camelCase() — /^[a-z][a-zA-Z]*\\(\\)$/"
  - nome: responsavel
    tipo: string
    descricao: "Nome do agente responsável pela execução (PascalCase display name)"
    obrigatorio: true
    validacao: "Deve corresponder a um agente existente ou planejado no squad"
  - nome: description
    tipo: string
    descricao: "Descrição detalhada do propósito e escopo da task"
    obrigatorio: true
    validacao: "Mínimo 50 caracteres, deve ser específico e não genérico"
  - nome: inputs
    tipo: array
    descricao: "Array de especificações de input com nome, tipo, descrição, obrigatoriedade"
    obrigatorio: true
    validacao: "Mínimo 1 input, cada um com nome (camelCase), tipo, descrição, obrigatório (bool)"
  - nome: outputs
    tipo: array
    descricao: "Array de especificações de output com nome, tipo, destino, persistência"
    obrigatorio: true
    validacao: "Mínimo 1 output, cada um com nome (camelCase), tipo, destino, persistido (bool)"
  - nome: atomicLayer
    tipo: string
    descricao: "Camada atômica: Atom | Molecule | Organism | Ecosystem"
    obrigatorio: false
    validacao: "Default: Organism. Deve refletir complexidade real da task"
  - nome: targetPath
    tipo: string
    descricao: "Path de destino para o arquivo da task"
    obrigatorio: false
    validacao: "Se não fornecido, usa squads/{squad}/tasks/{task-name}.md"

Saida:
  - nome: taskFile
    tipo: file
    descricao: "Arquivo .md completo da task seguindo TASK-FORMAT-SPECIFICATION-V1"
    destino: "squads/{squad}/tasks/{taskName-kebab}.md"
    persistido: true
  - nome: validationResult
    tipo: object
    descricao: "Resultado da validação estrutural e de conteúdo"
    destino: "Memory"
    persistido: false

Checklist:
  pre-conditions:
    - "[ ] taskName segue convenção camelCase() — ex: createAgent(), analyzePerformance()"
    - "[ ] responsavel corresponde a um agent.name existente ou planejado"
    - "[ ] description tem mínimo 50 caracteres e é específica"
    - "[ ] inputs array tem pelo menos 1 item com todos os campos obrigatórios"
    - "[ ] outputs array tem pelo menos 1 item com todos os campos obrigatórios"
    - "[ ] Não existe task com mesmo identifier no diretório destino"
  post-conditions:
    - "[ ] Arquivo .md criado com YAML frontmatter válido e parseable"
    - "[ ] Campos obrigatórios presentes: task, responsavel, responsavel_type, atomic_layer, Entrada, Saida, Checklist"
    - "[ ] Checklist tem pelo menos 1 pre-condition e 1 post-condition"
    - "[ ] Pipeline Diagram presente no corpo Markdown"
    - "[ ] Descrição detalhada presente com Responsabilidades e Regras"
    - "[ ] Performance section com duration_expected e cost_estimated"
    - "[ ] Error Handling section com strategy e common_errors"
    - "[ ] Metadata section com version, dependencies, tags"
    - "[ ] Contratos Entrada/Saída são tipados e descritivos"

Performance:
  duration_expected: "2-4 minutos"
  cost_estimated: "~3000 tokens (Opus)"
  cacheable: false
  parallelizable: true
  skippable_when: "Nunca — tasks são o building block fundamental do AIOS"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "3s"
  fallback: "Gerar task com estrutura mínima e seções marcadas como TODO"
  notification: "orchestrator"
  common_errors:
    - error: "Duplicate Task Identifier"
      cause: "Já existe task com mesmo identifier camelCase() no escopo"
      resolution: "Listar tasks existentes e sugerir nome alternativo"
    - error: "Invalid Task Name Format"
      cause: "Nome não segue padrão camelCase()"
      resolution: "Corrigir automaticamente para camelCase e confirmar com usuário"
    - error: "Agent Not Found"
      cause: "responsavel não corresponde a nenhum agente existente"
      resolution: "Listar agentes disponíveis e solicitar seleção"
    - error: "Input/Output Contract Incomplete"
      cause: "Campos obrigatórios faltando em Entrada ou Saida"
      resolution: "Solicitar campos faltantes ao usuário"

Metadata:
  story: "Como Forge Squad, preciso criar tasks com contratos formais Entrada/Saída para garantir encadeamento"
  version: "1.0.0"
  dependencies:
    - "TASK-FORMAT-SPECIFICATION-V1"
    - "Conhecimento do sistema de tasks AIOS (250+ tasks)"
  tags:
    - creation
    - task
    - contracts
    - pipeline
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# createTask()

## Pipeline Diagram

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  taskName     │  │  responsavel  │  │  description  │
│  (camelCase)  │  │  (agent name) │  │  (string)     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────┬───────┴─────────────────┘
                 │
┌──────────────┐ │ ┌──────────────┐
│  inputs       │ │ │  outputs      │
│  (array)      │─┤ │  (array)      │
└──────────────┘ │ └──────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│                     Forge Agent                       │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ Step 1: Validate Inputs                      │    │
│  │  - taskName format (camelCase())             │    │
│  │  - responsavel exists                         │    │
│  │  - no duplicates                              │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                │
│  ┌──────────────────▼───────────────────────────┐    │
│  │ Step 2: Build YAML Frontmatter               │    │
│  │  - task, responsavel, responsavel_type        │    │
│  │  - atomic_layer classification                │    │
│  │  - Entrada[] contracts                        │    │
│  │  - Saida[] contracts                          │    │
│  │  - Checklist (pre/post)                       │    │
│  │  - Performance, Error Handling, Metadata      │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                │
│  ┌──────────────────▼───────────────────────────┐    │
│  │ Step 3: Generate Markdown Body               │    │
│  │  - # taskName() heading                      │    │
│  │  - ## Pipeline Diagram (ASCII art)           │    │
│  │  - ## Descrição (detailed)                   │    │
│  │    - Responsabilidades                        │    │
│  │    - Regras de Execução                       │    │
│  │    - Critérios de Qualidade                   │    │
│  │    - Integração com Outros Tasks              │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                │
│  ┌──────────────────▼───────────────────────────┐    │
│  │ Step 4: Validate & Save                      │    │
│  │  - YAML parseable check                      │    │
│  │  - Required fields check                     │    │
│  │  - Contract completeness check               │    │
│  │  - Write file to targetPath                  │    │
│  └──────────────────┬───────────────────────────┘    │
│                     │                                │
└─────────────────────┼────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐  ┌──────────────────┐
│  taskFile         │  │  validationResult │
│  (complete .md)   │  │  (quality report) │
└──────────────────┘  └──────────────────┘
```

## Descrição

A task `createTask()` gera definições de tasks AIOS completas com contratos formais de dados. Tasks são os **building blocks** do framework AIOS — cada operação executável é uma task com inputs, outputs, pré/pós-condições e tratamento de erros definidos.

### Responsabilidades

1. **Validação de Inputs** — Verificar todos os inputs antes da geração:
   - `taskName` deve seguir camelCase(): primeira letra minúscula, palavras capitalizadas, terminado em `()`
   - `responsavel` deve corresponder a um `agent.name` existente no squad
   - `inputs` e `outputs` devem ter pelo menos 1 item cada com todos os campos necessários
   - Verificar unicidade do identifier no escopo destino

2. **Construção do YAML Frontmatter** — Gerar o bloco YAML completo com todas as seções:

   **Campos Obrigatórios do Frontmatter:**

   | Campo | Tipo | Descrição | Exemplo |
   |-------|------|-----------|---------|
   | `task` | string | Identifier em camelCase() | `analyzePerformance()` |
   | `responsavel` | string | Agent display name | `"Oracle"` |
   | `responsavel_type` | string | Tipo do executor | `"Agente"` |
   | `atomic_layer` | string | Camada de complexidade | `"Organism"` |
   | `Entrada` | array | Contratos de input | Ver formato abaixo |
   | `Saida` | array | Contratos de output | Ver formato abaixo |
   | `Checklist` | object | Pre/post conditions | Ver formato abaixo |
   | `Performance` | object | Estimativas de performance | Ver formato abaixo |
   | `Error Handling` | object | Estratégia de erros | Ver formato abaixo |
   | `Metadata` | object | Metadados da task | Ver formato abaixo |

   **Formato de Cada Entrada[]:**
   ```yaml
   - nome: fieldName
     tipo: string | number | boolean | file | array | object
     descricao: "O que este input representa"
     obrigatorio: true | false
     validacao: "Regras de validação"
   ```

   **Formato de Cada Saida[]:**
   ```yaml
   - nome: fieldName
     tipo: string | number | boolean | file | array | object
     descricao: "O que este output representa"
     destino: "Para onde vai (file path, Memory, Return value)"
     persistido: true | false
   ```

3. **Geração do Corpo Markdown** — O corpo deve conter obrigatoriamente:

   - **Heading H1**: `# taskName()` (mesmo identifier do frontmatter)
   - **Pipeline Diagram**: Diagrama ASCII mostrando fluxo de dados de inputs → processamento → outputs
   - **Descrição**: Seção detalhada com:
     - Responsabilidades numeradas (o que a task faz)
     - Regras de Execução (convenções, validações)
     - Critérios de Qualidade (o que define sucesso)
     - Integração (como se conecta com outras tasks)

4. **Classificação Atomic Layer** — Atribuir a camada correta baseada na complexidade real:

   | Layer | Complexidade | Exemplo | Guideline |
   |-------|-------------|---------|-----------|
   | `Atom` | Operação única, indivisível | Ler arquivo, validar campo | 1 step, 1 input, 1 output |
   | `Molecule` | Combinação de atoms | Gerar template preenchido | 2-4 steps, poucos I/O |
   | `Organism` | Operação complexa multi-step | Criar agente completo | 5+ steps, múltiplos I/O |
   | `Ecosystem` | Orquestração de organisms | Criar squad inteiro | 10+ steps, pipeline |

5. **Encadeamento de Contratos** — Garantir que os contratos são encadeáveis:
   - Cada `Saida[].destino` indica quem consome este output
   - Cada `Entrada[].descricao` indica de onde vem este input
   - Tipos são compatíveis entre produtor e consumidor
   - Campos obrigatórios têm produtores garantidos na pipeline

### Regras de Geração

- **task identifier**: camelCase seguido de `()` — ex: `createAgent()`, `analyzePerformance()`
- **responsavel**: Nome legível do agente (PascalCase), não o ID kebab-case
- **responsavel_type**: Sempre `"Agente"` para agents, `"Pipeline"` para workflows automatizados
- **Checklist**: Mínimo 2 pre-conditions + 2 post-conditions
- **Pipeline Diagram**: Obrigatório, usando caracteres Unicode (┌ ┐ └ ┘ │ ─ ▶ ▼)
- **Descrição**: Mínimo 4 subseções (Responsabilidades, Regras, Qualidade, Integração)
- **Performance**: Sempre incluir `duration_expected` e `cost_estimated`

### Diagrama Pipeline — Regras de Construção

O Pipeline Diagram deve seguir estas convenções:

```
Regras visuais:
  - Inputs à esquerda, outputs à direita
  - Processamento no centro
  - Fluxo de dados indicado com ─▶ (horizontal) ou │▼ (vertical)
  - Boxes usando Unicode: ┌──┐ │  │ └──┘
  - Labels dentro dos boxes
  - Anotar tipo de dado entre parênteses: (string), (file), (array)
  - Para fluxos complexos, usar numeração: Step 1, Step 2...
```

### Validação de Qualidade

| Check | Critério | Blocker |
|-------|----------|---------|
| YAML válido | Frontmatter é parseable sem erros | SIM |
| Campos obrigatórios | task, responsavel, responsavel_type, atomic_layer, Entrada, Saida, Checklist | SIM |
| Contracts tipados | Cada Entrada/Saida tem tipo definido | SIM |
| Pipeline Diagram | Presente no corpo Markdown | SIM |
| Descrição detalhada | Mínimo 4 subseções | NÃO (warning) |
| Performance | duration_expected presente | NÃO (warning) |
| Unicidade | Não existe task duplicada | SIM |

### Integração com Outros Tasks

| Task Relacionada | Relação |
|-----------------|---------|
| `createAgent()` | Agentes referenciam tasks em command_loader |
| `createWorkflow()` | Workflows encadeiam tasks em sequência |
| `validateArtifact()` | Valida tasks geradas contra TASK-FORMAT-V1 |
| `analyzeAiosComponent()` | Analisa tasks existentes como referência |
| `optimizeComponent()` | Otimiza tasks com base em análise de performance |

### Exemplo de Output Gerado

Para uma chamada `createTask({ taskName: "validateSchema()", responsavel: "Sentinel", ... })`:

```yaml
# No frontmatter:
task: validateSchema()
responsavel: "Sentinel"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: schemaPath
    tipo: string
    descricao: "Caminho para o schema a validar"
    obrigatorio: true

Saida:
  - nome: validationResult
    tipo: object
    descricao: "Resultado da validação com erros e warnings"
    destino: "Memory"
    persistido: false

# No corpo:
# validateSchema()
## Pipeline Diagram
## Descrição
```
