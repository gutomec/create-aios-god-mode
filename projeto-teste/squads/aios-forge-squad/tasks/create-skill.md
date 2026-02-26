---
task: createSkill()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: skillName
    tipo: string
    descricao: "Nome da skill em kebab-case — ex: code-review, deploy-preview"
    obrigatorio: true
    validacao: "Deve seguir convenção kebab-case — /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"
  - nome: description
    tipo: string
    descricao: "Descrição clara do propósito da skill e quando deve ser ativada"
    obrigatorio: true
    validacao: "Mínimo 30 caracteres, deve incluir contexto de quando triggar"
  - nome: commands
    tipo: array
    descricao: "Array de comandos da skill com nome, descrição, args e implementação"
    obrigatorio: true
    validacao: "Mínimo 1 comando operacional. Cada comando deve ter name, description, args[]"
  - nome: triggerConditions
    tipo: string
    descricao: "Condições que ativam automaticamente esta skill no Claude Code"
    obrigatorio: true
    validacao: "Deve ser específico e não-ambíguo. Ex: 'Quando o usuário pede code review'"
  - nome: agentPersona
    tipo: object
    descricao: "Persona opcional para a skill (tone, expertise, constraints)"
    obrigatorio: false
    validacao: "Se fornecido, deve ter pelo menos tone e expertise definidos"
  - nome: targetPath
    tipo: string
    descricao: "Path de destino para os arquivos da skill"
    obrigatorio: false
    validacao: "Default: .claude/agents/ para skills globais, squads/{squad}/skills/ para squad skills"

Saida:
  - nome: skillFile
    tipo: file
    descricao: "Arquivo SKILL.md principal com definição completa da skill"
    destino: "{targetPath}/{skillName}/SKILL.md"
    persistido: true
  - nome: commandFiles
    tipo: array
    descricao: "Arquivos de persona por comando — cada comando operacional gera um .md"
    destino: "{targetPath}/{skillName}/commands/"
    persistido: true
  - nome: validationResult
    tipo: object
    descricao: "Resultado da validação de formato e completude"
    destino: "Memory"
    persistido: false

Checklist:
  pre-conditions:
    - "[ ] skillName segue convenção kebab-case"
    - "[ ] Não existe skill com mesmo nome no targetPath"
    - "[ ] description inclui contexto de quando ativar (trigger)"
    - "[ ] commands array tem pelo menos 1 comando operacional"
    - "[ ] triggerConditions é específico e não-ambíguo"
    - "[ ] Se agentPersona fornecido, tem tone e expertise"
  post-conditions:
    - "[ ] SKILL.md tem YAML frontmatter válido com name, description, trigger"
    - "[ ] SKILL.md tem corpo Markdown com Usage Guide, Commands table, Agent Collaboration"
    - "[ ] Para cada comando operacional, existe arquivo de persona em commands/"
    - "[ ] Cada arquivo de comando persona tem instruções claras de execução"
    - "[ ] Trigger conditions são claras — Claude Code consegue decidir quando ativar"
    - "[ ] Nenhuma ambiguidade nos triggers — skill não conflita com outras skills existentes"
    - "[ ] Formato compatível com .claude/agents/ ou squad deployment"

Performance:
  duration_expected: "2-4 minutos"
  cost_estimated: "~2500 tokens (Opus)"
  cacheable: false
  parallelizable: true
  skippable_when: "Quando funcionalidade pode ser coberta por task simples sem necessidade de skill dedicada"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "3s"
  fallback: "Gerar SKILL.md com marcadores TODO nos comandos incompletos"
  notification: "orchestrator"
  common_errors:
    - error: "Duplicate Skill Name"
      cause: "Já existe skill com mesmo nome no targetPath"
      resolution: "Listar skills existentes e sugerir nome alternativo"
    - error: "Ambiguous Trigger Condition"
      cause: "Trigger conflita com skill existente"
      resolution: "Refinar trigger para ser mais específico e não sobrepor"
    - error: "Empty Command Implementation"
      cause: "Comando não tem instruções de execução"
      resolution: "Adicionar instruções mínimas ou marcar como TODO"
    - error: "Invalid Persona Format"
      cause: "agentPersona não tem campos necessários"
      resolution: "Usar persona default com tone=professional e expertise derivada da description"

Metadata:
  story: "Como Forge Squad, preciso criar skills Claude Code com triggers claros e comandos operacionais"
  version: "1.0.0"
  dependencies:
    - "Claude Code custom agent format"
    - "Conhecimento de .claude/agents/ deployment"
  tags:
    - creation
    - skill
    - claude-code
    - custom-agent
    - command-persona
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# createSkill()

## Pipeline Diagram

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  skillName        │  │  description      │  │  triggerConditions│
│  (kebab-case)     │  │  (string)         │  │  (string)        │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────┬──────────┴─────────────────────┘
                    │
┌──────────────────┐│  ┌──────────────────┐
│  commands         ││  │  agentPersona     │
│  (array)          │┤  │  (object, opt)    │
└──────────────────┘│  └──────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────┐
│                        Forge Agent                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Step 1: Validate & Plan                                 │ │
│  │  - Name uniqueness check                                │ │
│  │  - Trigger conflict detection                           │ │
│  │  - Command classification (operational vs utility)      │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │ Step 2: Generate SKILL.md                               │ │
│  │                                                          │ │
│  │  ┌─ YAML Frontmatter ────────────────────────────────┐  │ │
│  │  │  name: skill-name                                  │  │ │
│  │  │  description: "..."                                │  │ │
│  │  │  trigger:                                          │  │ │
│  │  │    conditions: ["condition 1", "condition 2"]      │  │ │
│  │  │    keywords: ["keyword1", "keyword2"]              │  │ │
│  │  │  persona: (optional)                               │  │ │
│  │  │    tone: professional                              │  │ │
│  │  │    expertise: "domain"                             │  │ │
│  │  │  commands: [...]                                   │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌─ Markdown Body ───────────────────────────────────┐  │ │
│  │  │  ## Usage Guide                                    │  │ │
│  │  │  ## Commands (tabela)                              │  │ │
│  │  │  ## Agent Collaboration                            │  │ │
│  │  │  ## Examples                                       │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │ Step 3: Generate Command Persona Files                  │ │
│  │                                                          │ │
│  │  Para cada comando operacional:                          │ │
│  │  ┌────────────────────────────────────┐                  │ │
│  │  │  commands/{command-name}.md         │                  │ │
│  │  │  - Instruções de execução          │                  │ │
│  │  │  - Contexto e constraints          │                  │ │
│  │  │  - Output format esperado          │                  │ │
│  │  │  - Error handling                  │                  │ │
│  │  └────────────────────────────────────┘                  │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │ Step 4: Validate All Files                              │ │
│  │  - SKILL.md YAML check                                  │ │
│  │  - Command files exist for each command                 │ │
│  │  - No trigger conflicts with existing skills            │ │
│  └──────────────────────┬──────────────────────────────────┘ │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SKILL.md     │  │  commands/    │  │  validation   │
│  (main file)  │  │  *.md files  │  │  Result       │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Descrição

A task `createSkill()` gera skills para o Claude Code seguindo o formato de custom agents. Skills são **capacidades especializadas** que podem ser ativadas automaticamente por trigger conditions ou manualmente por comando. Cada skill inclui um arquivo principal (SKILL.md) e arquivos de persona por comando.

### Responsabilidades

1. **Validação e Planejamento** — Verificar inputs e planejar a estrutura:
   - Verificar unicidade do nome no targetPath
   - Detectar conflitos de trigger com skills existentes
   - Classificar comandos como operacionais (produzem output) ou utility (*help, *exit)
   - Determinar path de deploy (.claude/agents/ ou squads/{squad}/skills/)

2. **Geração do SKILL.md** — Criar o arquivo principal com 2 blocos:

   **YAML Frontmatter da Skill:**
   ```yaml
   name: "skill-name"
   description: "Descrição completa do que a skill faz"
   version: "1.0.0"

   trigger:
     conditions:
       - "Quando o usuário pede X"
       - "Quando o contexto envolve Y"
     keywords:
       - "keyword1"
       - "keyword2"
     auto_activate: true | false

   persona:
     tone: "professional | casual | technical | friendly"
     expertise: "Área de expertise principal"
     constraints:
       - "Constraint 1 — o que NÃO fazer"
       - "Constraint 2"

   commands:
     - name: "/command-name"
       description: "O que faz"
       args:
         - name: "arg1"
           type: "string"
           required: true
           description: "Descrição do argumento"
       persona_file: "commands/command-name.md"
   ```

   **Markdown Body:**

   | Seção | Conteúdo | Obrigatório |
   |-------|----------|-------------|
   | Usage Guide | Como usar a skill, quando ativar, exemplos de invocação | SIM |
   | Commands | Tabela com todos os comandos, args e descrições | SIM |
   | Agent Collaboration | Como a skill interage com outros agentes/skills | SIM |
   | Examples | Exemplos reais de uso com input → output | NÃO (recomendado) |
   | Limitations | O que a skill NÃO faz | NÃO (recomendado) |

3. **Geração de Command Persona Files** — Para cada comando operacional:

   Cada comando gera um arquivo `commands/{command-name}.md` contendo:

   ```markdown
   # /command-name

   ## Propósito
   Descrição detalhada do que este comando faz.

   ## Instruções de Execução
   Passo a passo de como executar este comando:
   1. Step 1: ...
   2. Step 2: ...
   3. Step 3: ...

   ## Contexto e Constraints
   - Constraint 1
   - Constraint 2

   ## Output Format
   Formato esperado do output:
   (template ou exemplo)

   ## Error Handling
   - Se X acontecer: fazer Y
   - Se Z acontecer: fazer W
   ```

   **Regras para Command Personas:**
   - Instruções devem ser detalhadas o suficiente para execução determinística
   - Output format deve ser claro e consistente
   - Error handling deve cobrir os 3 erros mais comuns
   - Constraints devem prevenir comportamento indesejado

4. **Validação Final** — Antes de finalizar:
   - SKILL.md tem YAML válido
   - Cada comando operacional tem arquivo de persona correspondente
   - Triggers não conflitam com skills existentes no mesmo scope
   - Formato é compatível com deploy target

### Deployment Models

Skills podem ser deployadas em 2 modelos:

| Modelo | Path | Visibilidade | Uso |
|--------|------|-------------|-----|
| **Global** | `.claude/agents/{skill-name}/` | Disponível em todos os projetos | Skills utilitárias gerais |
| **Squad** | `squads/{squad}/skills/{skill-name}/` | Disponível apenas no contexto do squad | Skills especializadas |

### Trigger System

O sistema de triggers define quando a skill é automaticamente sugerida ou ativada:

```yaml
trigger:
  # Condições textuais — Claude Code avalia contra a mensagem do usuário
  conditions:
    - "Quando o usuário menciona 'code review' ou 'revisar código'"
    - "Quando o contexto envolve análise de qualidade de código"

  # Keywords — matching rápido antes de avaliação semântica
  keywords:
    - "code review"
    - "review"
    - "quality check"

  # Auto-ativação — se true, skill é ativada automaticamente quando trigger match
  # Se false, skill é sugerida mas requer confirmação do usuário
  auto_activate: false

  # Prioridade — quando múltiplas skills matcham, maior prioridade vence
  priority: 5  # 1-10, default 5
```

**Regras de Trigger:**
- Conditions devem ser mutuamente exclusivas com outras skills (sem overlap)
- Keywords devem ser específicas (evitar termos genéricos como "code" ou "help")
- `auto_activate: true` requer alta confiança no trigger (>= 0.9)
- Se trigger conflita com skill existente, RECUSAR e pedir refinamento

### Compatibilidade Claude Code

A skill gerada deve ser compatível com o formato de custom agents do Claude Code:

```
{skill-name}/
├── SKILL.md           # Arquivo principal com definição
├── commands/
│   ├── command-1.md   # Persona do comando 1
│   ├── command-2.md   # Persona do comando 2
│   └── ...
└── data/              # (opcional) Dados de referência
    └── reference.md
```

O Claude Code carrega SKILL.md como "agent file" e os arquivos de comando como "persona files" que são injetados no contexto quando o comando é invocado.

### Integração com Outros Tasks

| Task Relacionada | Relação |
|-----------------|---------|
| `createAgent()` | Agents são mais completos que skills — skill é agent "lightweight" |
| `createTask()` | Commands da skill referenciam tasks para operações complexas |
| `createSquad()` | Squads podem incluir skills como componente |
| `validateArtifact()` | Valida skills geradas contra formato Claude Code |
| `analyzeAiosComponent()` | Analisa skills existentes para referência e conflito de trigger |
