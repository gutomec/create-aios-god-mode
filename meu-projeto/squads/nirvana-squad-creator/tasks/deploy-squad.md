---
task: deploySquad()
responsavel: "Orchestrator"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: allWorkspaceFiles
    tipo: array<file>
    descricao: ".squad-workspace/<session>/ (todos os artefatos gerados e validados)"
    obrigatorio: true
  - nome: targetProject
    tipo: string
    descricao: "user input (AskUserQuestion)"
    obrigatorio: true

Saida:
  - nome: deployedSquadDir
    tipo: file
    descricao: "publishSquad() task (se publicação for solicitada)"
    obrigatorio: true
  - nome: enabledCommands
    tipo: array<string>
    descricao: "user notification"
    obrigatorio: false

Checklist:
  pre-conditions:
    - "[ ] Squad validado com status PASSED (fase 6)"
    - "[ ] READMEs multilíngues gerados (fase 7)"
    - "[ ] Projeto destino informado pelo usuário (novo ou existente)"
    - "[ ] Se projeto existente: diretório existe e contém .aios-core/"
    - "[ ] Se projeto novo: diretório pai é gravável"
  post-conditions:
    - "[ ] Squad copiado para squads/<nome>/ no projeto destino"
    - "[ ] Estrutura completa: agents/, tasks/, workflows/, config/, squad.yaml, README*.md"
    - "[ ] Slash commands habilitados em .claude/commands/SQUADS/<prefix>/"
    - "[ ] .aios-sync.yaml criado/atualizado na raiz do projeto"
    - "[ ] Se projeto novo: npx aios-core init executado (ou setup manual se não-interativo)"

Performance:
  duration_expected: "1-3 minutos"
  cost_estimated: "~500 tokens (operações de filesystem)"
  cacheable: false
  parallelizable: false
  skippable_when: "Nunca — deploy é obrigatório para uso do squad"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "5s"
  fallback: "Gerar instruções manuais de deploy se operação automatizada falhar"
  notification: "orchestrator"

Metadata:
  story: "Como usuário, preciso do squad deployado em meu projeto AIOS com slash commands funcionando"
  version: "1.0.0"
  dependencies:
    - validateSquad()
    - createMultilingualReadme()
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# deploySquad()

## Pipeline Diagram

```
┌──────────────────────────┐     ┌─────────────────────┐
│ .squad-workspace/<session>│     │ targetProject       │
│ ├── agents/*.md          │     │ (user input)        │
│ ├── tasks/*.md           │     │                     │
│ ├── workflows/*.yaml     │     │ Novo? Existente?    │
│ ├── config/*.md          │     └──────────┬──────────┘
│ ├── squad.yaml           │                │
│ └── README*.md           │                │
└────────────┬─────────────┘                │
             │                              │
             └──────────┬───────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  Orchestrator    │
               │  (deploy logic)  │
               └────────┬─────────┘
                        │
           ┌────────────┼────────────────┐
           │            │                │
           ▼            ▼                ▼
    ┌─────────────┐ ┌──────────────┐ ┌───────────────┐
    │ squads/     │ │ .claude/     │ │ .aios-sync    │
    │ <nome>/     │ │ commands/    │ │ .yaml         │
    │ (full squad)│ │ <prefix>/   │ │               │
    │             │ │ agents/*.md  │ │ squad_aliases │
    └─────────────┘ └──────────────┘ └───────────────┘
```

## Descrição

A task `deploySquad()` é a **oitava fase** do pipeline. Deploya o squad validado em um projeto AIOS (novo ou existente) e habilita os slash commands no Claude Code.

### Responsabilidades

1. **Determinar Tipo de Deploy** — Perguntar ao usuário:
   - **Novo projeto AIOS**: Criar diretório, inicializar AIOS Core, deployar squad
   - **Projeto AIOS existente**: Validar que `.aios-core/` existe, deployar squad

2. **Copiar Artefatos** — Do workspace para o projeto destino:
   ```
   .squad-workspace/<session>/ → <projeto>/squads/<nome>/
   ```
   - `agents/*.md` → `squads/<nome>/agents/`
   - `tasks/*.md` → `squads/<nome>/tasks/`
   - `workflows/*.yaml` → `squads/<nome>/workflows/`
   - `config/*.md` → `squads/<nome>/config/`
   - `squad.yaml` → `squads/<nome>/squad.yaml`
   - `README*.md` → `squads/<nome>/`

3. **Habilitar Slash Commands** — Mecanismo de habilitação:
   - Ler `slashPrefix` do `squad.yaml` (ex: `nsc` para Nirvana Squad Creator)
   - Criar diretório `.claude/commands/SQUADS/<prefix>/`
   - Copiar cada agent `.md` para o diretório de commands
   - Após isso, Claude Code reconhece `/SQUADS:<prefix>:<agent-id>`

4. **Criar/Atualizar .aios-sync.yaml** — Arquivo de mapeamento:
   ```yaml
   active_ides:
     - claude
   squad_aliases:
     <nome-do-squad>: <prefix>
   sync_mappings:
     squad_agents:
       source: 'squads/*/agents/'
       destinations:
         claude:
           - path: '.claude/commands/SQUADS/{squad_alias}/'
             format: 'md'
   ```

5. **Setup de Projeto Novo** (se aplicável):
   - Criar diretório do projeto
   - Executar `npx aios-core init` (atenção: é interativo)
   - Se ambiente não-interativo, gerar setup manual com instruções

### Opções de Deploy

| Opção | Descrição | Ação |
|-------|-----------|------|
| Novo projeto | Diretório não existe | mkdir + aios-core init + deploy |
| Projeto existente | `.aios-core/` presente | Validar + deploy |
| Projeto sem AIOS | Diretório existe, sem `.aios-core/` | Perguntar se quer instalar AIOS Core |

### Verificação Pós-Deploy

Após o deploy, verificar:
- Todos os arquivos copiados existem no destino
- `.claude/commands/SQUADS/<prefix>/` contém os agents
- `.aios-sync.yaml` contém o mapeamento correto
- Listar slash commands habilitados para o usuário
