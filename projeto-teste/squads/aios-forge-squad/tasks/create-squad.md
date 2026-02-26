---
task: createSquad()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: squadName
    tipo: string
    descricao: "Nome do squad em kebab-case — ex: aios-forge-squad, data-pipeline-squad"
    obrigatorio: true
    validacao: "Deve seguir convenção kebab-case, terminar em -squad, ser único em squads/"
  - nome: description
    tipo: string
    descricao: "Descrição completa do domínio e propósito do squad"
    obrigatorio: true
    validacao: "Mínimo 50 caracteres, deve definir claramente o domínio de atuação"
  - nome: agentCount
    tipo: number
    descricao: "Número de agentes especializados no squad (mínimo 3)"
    obrigatorio: true
    validacao: "Deve ser >= 3. Squads com < 3 agentes são tasks, não squads"
  - nome: domain
    tipo: string
    descricao: "Domínio de atuação do squad (ex: devops, data-engineering, frontend, aios-framework)"
    obrigatorio: true
    validacao: "Deve ser identificável e não genérico"
  - nome: agentSpecs
    tipo: array
    descricao: "Especificações de cada agente: name, role, archetype, key_commands"
    obrigatorio: false
    validacao: "Se fornecido, cada spec deve ter name e role. Se não fornecido, Forge infere do domain"
  - nome: workflowPatterns
    tipo: array
    descricao: "Padrões de workflow desejados: sequential, fan-out, pipeline"
    obrigatorio: false
    validacao: "Default: [sequential]. Cada pattern gera pelo menos 1 workflow"
  - nome: useNirvanaCreator
    tipo: boolean
    descricao: "Se true, usa o pipeline completo do Nirvana Squad Creator"
    obrigatorio: false
    validacao: "Default: false. Se true, delega para nirvana-squad-creator/"

Saida:
  - nome: squadDirectory
    tipo: directory
    descricao: "Diretório completo do squad com toda a estrutura de arquivos"
    destino: "squads/{squadName}/"
    persistido: true
  - nome: squadYaml
    tipo: file
    descricao: "Manifesto do squad (squad.yaml) com todos os componentes listados"
    destino: "squads/{squadName}/squad.yaml"
    persistido: true
  - nome: creationReport
    tipo: object
    descricao: "Relatório de criação com contagens, status e recomendações"
    destino: "Memory"
    persistido: false

Checklist:
  pre-conditions:
    - "[ ] squadName segue convenção kebab-case e termina em -squad"
    - "[ ] Não existe squad com mesmo nome em squads/"
    - "[ ] agentCount >= 3 (mínimo para justificar um squad)"
    - "[ ] domain é identificável e não genérico"
    - "[ ] Se useNirvanaCreator=true, squad nirvana-squad-creator existe e está funcional"
  post-conditions:
    - "[ ] Diretório squads/{squadName}/ criado com estrutura completa"
    - "[ ] squad.yaml existe com todos os components listados"
    - "[ ] agents/ contém N arquivos .md (1 por agente)"
    - "[ ] tasks/ contém pelo menos N tasks (mínimo 1 por agente)"
    - "[ ] workflows/ contém pelo menos 1 workflow .yaml"
    - "[ ] config/ contém coding-standards.md, tech-stack.md, source-tree.md"
    - "[ ] README.md existe com descrição, agentes, tasks e instruções de uso"
    - "[ ] Cada agente tem pelo menos 3 comandos (*help, *exit + operacionais)"
    - "[ ] Cada task segue TASK-FORMAT-SPECIFICATION-V1"
    - "[ ] Workflow(s) conectam os agentes em processo coerente"

Performance:
  duration_expected: "10-20 minutos"
  cost_estimated: "~15000 tokens (Opus)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — squad é a unidade organizacional do AIOS"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 1
    delay: "10s"
  fallback: "Gerar scaffold mínimo com TODO markers em artefatos incompletos"
  notification: "orchestrator"
  common_errors:
    - error: "Duplicate Squad Name"
      cause: "Já existe squad com mesmo nome"
      resolution: "Listar squads existentes e sugerir nome alternativo"
    - error: "Insufficient Agent Count"
      cause: "agentCount < 3"
      resolution: "Explicar mínimo de 3 agentes e sugerir roles adicionais"
    - error: "Nirvana Creator Unavailable"
      cause: "useNirvanaCreator=true mas squad creator não existe"
      resolution: "Fallback para geração direta pelo Forge"
    - error: "Incomplete Agent Specs"
      cause: "agentSpecs fornecido mas incompleto"
      resolution: "Inferir campos faltantes do domain e confirmar com usuário"
    - error: "Disk Space / Permissions"
      cause: "Falha ao criar diretórios ou arquivos"
      resolution: "Verificar permissões e espaço disponível, reportar ao usuário"

Metadata:
  story: "Como Forge Squad, preciso criar squads completos com agentes, tasks, workflows e configuração"
  version: "1.0.0"
  dependencies:
    - createAgent()
    - createTask()
    - createWorkflow()
    - createTemplate()
    - "Conhecimento da estrutura de squads AIOS"
  tags:
    - creation
    - squad
    - scaffold
    - ecosystem
    - multi-agent
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# createSquad()

## Pipeline Diagram

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ squadName   │  │ description │  │ agentCount  │  │ domain     │
│ (string)    │  │ (string)    │  │ (number)    │  │ (string)   │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │               │
      └───────┬───────┴───────────────┴───────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Forge Agent                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Phase 1: VALIDATE & PLAN                                  │ │
│  │  - Verify squad name uniqueness                           │ │
│  │  - Validate agent count >= 3                              │ │
│  │  - Domain analysis → infer agent roles                    │ │
│  │  - Plan directory structure                               │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 2: SCAFFOLD DIRECTORY                               │ │
│  │                                                            │ │
│  │  squads/{squadName}/                                       │ │
│  │  ├── squad.yaml          ← manifesto                      │ │
│  │  ├── README.md           ← documentação                   │ │
│  │  ├── agents/             ← N agent .md files              │ │
│  │  ├── tasks/              ← N+ task .md files              │ │
│  │  ├── workflows/          ← 1+ workflow .yaml              │ │
│  │  └── config/             ← coding-standards, tech-stack   │ │
│  │       ├── coding-standards.md                              │ │
│  │       ├── tech-stack.md                                    │ │
│  │       └── source-tree.md                                   │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 3: GENERATE AGENTS                                  │ │
│  │                                                            │ │
│  │  Para cada agente (N = agentCount):                        │ │
│  │  ┌─────────────┐                                          │ │
│  │  │ createAgent()│  ← Invoca task do Forge Squad            │ │
│  │  │  - name      │                                          │ │
│  │  │  - role      │  Gera arquivo completo .md               │ │
│  │  │  - archetype │  com AGENT-PERSONALIZATION-STANDARD-V1   │ │
│  │  │  - commands  │                                          │ │
│  │  └─────────────┘                                          │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 4: GENERATE TASKS                                   │ │
│  │                                                            │ │
│  │  Para cada agente, pelo menos 1 task:                      │ │
│  │  ┌─────────────┐                                          │ │
│  │  │ createTask() │  ← Invoca task do Forge Squad            │ │
│  │  │  - taskName  │                                          │ │
│  │  │  - inputs    │  Gera .md com contratos Entrada/Saída    │ │
│  │  │  - outputs   │  Pipeline Diagram e Descrição            │ │
│  │  └─────────────┘                                          │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 5: GENERATE WORKFLOWS                               │ │
│  │                                                            │ │
│  │  Pelo menos 1 workflow conectando os agentes:              │ │
│  │  ┌────────────────┐                                       │ │
│  │  │ createWorkflow()│  ← Invoca task do Forge Squad         │ │
│  │  │  - name         │                                       │ │
│  │  │  - type         │  Gera .yaml com transitions           │ │
│  │  │  - sequence     │                                       │ │
│  │  └────────────────┘                                       │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 6: GENERATE CONFIG & README                         │ │
│  │                                                            │ │
│  │  - coding-standards.md (convenções do domínio)             │ │
│  │  - tech-stack.md (tecnologias utilizadas)                  │ │
│  │  - source-tree.md (estrutura de diretórios)                │ │
│  │  - README.md (documentação completa)                       │ │
│  │  - squad.yaml (manifesto com todos os components)          │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
│  ┌──────────────────────────▼────────────────────────────────┐ │
│  │ Phase 7: VALIDATE & REPORT                                │ │
│  │                                                            │ │
│  │  - Verificar todos os arquivos existem                     │ │
│  │  - squad.yaml lista todos os components                    │ │
│  │  - Cross-reference agents ↔ tasks ↔ workflows             │ │
│  │  - Gerar creation report                                   │ │
│  └──────────────────────────┬────────────────────────────────┘ │
│                             │                                  │
└─────────────────────────────┼────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ squadDirectory│  │ squad.yaml   │  │ creation     │
   │ (complete)    │  │ (manifest)   │  │ Report       │
   └──────────────┘  └──────────────┘  └──────────────┘
```

## Descrição

A task `createSquad()` é a **task mais complexa** do AIOS Forge Squad. Orquestra a criação completa de um squad AIOS, incluindo agentes, tasks, workflows, configuração e documentação. Um squad é a **unidade organizacional** do AIOS — um grupo especializado de agentes que colaboram em um domínio específico.

### Responsabilidades

1. **Validação e Planejamento (Phase 1)** — Verificar viabilidade e planejar a estrutura:
   - Verificar unicidade do nome em squads/
   - Validar que agentCount >= 3
   - Analisar o domain para inferir roles se agentSpecs não fornecido
   - Planejar estrutura de diretórios

   **Inferência de Roles por Domain:**

   | Domain | Roles Típicos | Workflow Pattern |
   |--------|--------------|-----------------|
   | devops | orchestrator, builder, validator, deployer | pipeline |
   | data-engineering | analyzer, transformer, validator, loader | pipeline |
   | frontend | designer, developer, reviewer | sequential |
   | backend | architect, developer, tester | sequential |
   | aios-framework | oracle, forge, sentinel | fan-out |
   | security | scanner, analyzer, reporter | sequential |
   | content | researcher, writer, editor | pipeline |

2. **Scaffold de Diretório (Phase 2)** — Criar a estrutura de diretórios:

   ```
   squads/{squadName}/
   ├── squad.yaml              # Manifesto principal
   ├── README.md               # Documentação do squad
   ├── agents/                 # Definições de agentes
   │   ├── agent-1.md
   │   ├── agent-2.md
   │   └── agent-N.md
   ├── tasks/                  # Definições de tasks
   │   ├── task-1.md
   │   ├── task-2.md
   │   └── task-N.md
   ├── workflows/              # Definições de workflows
   │   └── main-workflow.yaml
   └── config/                 # Configurações do squad
       ├── coding-standards.md
       ├── tech-stack.md
       └── source-tree.md
   ```

3. **Geração de Agentes (Phase 3)** — Para cada agente no squad:
   - Invoca `createAgent()` com specs derivadas do domain
   - Cada agente recebe persona, comandos, command_loader
   - Agentes são coerentes entre si (não overlap de responsabilidade)
   - Handoffs entre agentes são explícitos

4. **Geração de Tasks (Phase 4)** — Para cada agente, pelo menos 1 task:
   - Invoca `createTask()` com contratos Entrada/Saída
   - Tasks são encadeáveis — output de task N alimenta input de task N+1
   - Contratos são tipados e validados
   - Pipeline diagram em cada task

5. **Geração de Workflows (Phase 5)** — Pelo menos 1 workflow:
   - Invoca `createWorkflow()` conectando os agentes
   - Transitions com trigger, confidence, greeting_message
   - Tipo de workflow derivado do domain
   - Success indicators definidos

6. **Configuração e Documentação (Phase 6)** — Arquivos de suporte:

   **squad.yaml** — Manifesto com estrutura:
   ```yaml
   name: squad-name
   version: 1.0.0
   author: "Author"
   description: "..."

   components:
     agents:
       - agent-1.md
       - agent-2.md
     tasks:
       - task-1.md
       - task-2.md
     workflows:
       - main-workflow.yaml
     checklists: []
     templates: []

   config:
     coding-standards: config/coding-standards.md
     tech-stack: config/tech-stack.md
     source-tree: config/source-tree.md

   tags:
     - domain-tag
   ```

   **config/coding-standards.md** — Convenções de código específicas do domínio
   **config/tech-stack.md** — Stack tecnológica utilizada
   **config/source-tree.md** — Mapa de diretórios com descrições
   **README.md** — Documentação completa com:
   - Descrição do squad e domínio
   - Lista de agentes com roles
   - Lista de tasks disponíveis
   - Workflows e como executá-los
   - Instruções de uso e exemplos

7. **Validação e Report (Phase 7)** — Validação final:
   - Todos os arquivos listados em squad.yaml existem
   - Cross-reference agents ↔ tasks ↔ workflows é consistente
   - Nenhum agente sem task
   - Nenhuma task sem agente responsável
   - Workflow referencia agentes existentes

### Modo Nirvana Creator

Se `useNirvanaCreator=true`, delega todo o processo para o Nirvana Squad Creator:

```
createSquad(useNirvanaCreator=true)
    │
    ▼
nirvana-squad-creator/
    │
    ├── analyzeRequirements()   → analysis.md + component-registry.md
    ├── createAgents()          → agents/*.md
    ├── createTasks()           → tasks/*.md (com contratos)
    ├── createWorkflows()       → workflows/*.yaml
    ├── optimizeSquad()         → otimização e validação
    └── deploySquad()           → deploy final
```

**Quando usar Nirvana Creator:**
- Squads complexos (> 5 agentes)
- Domínios novos que requerem research
- Quando se deseja pipeline completo com otimização

**Quando usar Geração Direta (Forge):**
- Squads simples (3-5 agentes)
- Domínios bem conhecidos
- Quando se deseja controle direto sobre cada artefato

### Critérios de Qualidade

| Check | Critério | Blocker |
|-------|----------|---------|
| Diretório completo | Todas as subpastas criadas | SIM |
| squad.yaml válido | YAML parseable, components listados | SIM |
| Agentes presentes | N arquivos em agents/ (N = agentCount) | SIM |
| Tasks presentes | >= N tasks em tasks/ | SIM |
| Workflow presente | >= 1 workflow em workflows/ | SIM |
| Config completo | 3 arquivos em config/ | NÃO (warning) |
| README presente | README.md com documentação | NÃO (warning) |
| Cross-reference | Agents ↔ tasks ↔ workflows consistente | SIM |
| No overlap | Agentes não têm responsabilidades sobrepostas | NÃO (warning) |

### Integração com Outros Tasks

| Task Relacionada | Relação |
|-----------------|---------|
| `createAgent()` | Chamada N vezes para gerar cada agente |
| `createTask()` | Chamada N+ vezes para gerar tasks |
| `createWorkflow()` | Chamada 1+ vezes para gerar workflows |
| `createTemplate()` | Chamada para gerar templates de config |
| `validateArtifact()` | Valida o squad completo após geração |
| `analyzeAiosComponent()` | Analisa squads existentes como referência |
| `optimizeComponent()` | Otimiza squad após criação se necessário |
