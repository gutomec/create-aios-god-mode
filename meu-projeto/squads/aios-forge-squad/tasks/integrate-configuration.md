---
task: integrateConfiguration()
responsavel: "Nexus"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: integrationType
    tipo: string
    descricao: "Tipo de integração: mcp|settings|rules|core-config|squad-deploy"
    obrigatorio: true
  - nome: source
    tipo: string
    descricao: "Caminho ou identificador da fonte de configuração"
    obrigatorio: true
  - nome: target
    tipo: string
    descricao: "Caminho ou identificador do destino da configuração"
    obrigatorio: true

Saida:
  - nome: configResult
    tipo: file
    descricao: "Configuração aplicada com resultado e estado final"
    obrigatorio: true
  - nome: integrationLog
    tipo: file
    descricao: "Log detalhado de todas as operações de integração executadas"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Source existe e é acessível"
    - "[ ] Target é gravável e está em camada mutável (L3 ou L4)"
    - "[ ] Tipo de integração é um dos 5 válidos"
    - "[ ] Não há conflitos conhecidos com configuração existente no target"
    - "[ ] Backup da configuração atual do target criado"
  post-conditions:
    - "[ ] Configuração aplicada com sucesso no target"
    - "[ ] Nenhum conflito com configuração existente (ou conflitos resolvidos)"
    - "[ ] Instruções de rollback documentadas no integration log"
    - "[ ] Integração validada via teste de sanidade"
    - "[ ] Log completo com cada operação, timestamp e resultado"

Performance:
  duration_expected: "2-5 minutos"
  cost_estimated: "~2000 tokens"
  cacheable: false
  parallelizable: false
  skippable_when: "Quando configuração já está aplicada e idêntica"

Error Handling:
  strategy: rollback
  fallback: "Gerar instruções manuais de integração com comandos passo-a-passo"
  notification: "orchestrator"

Metadata:
  story: "Como framework, preciso que configurações e integrações sejam aplicadas de forma segura e reversível"
  version: "1.0.0"
  dependencies: []
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# integrateConfiguration()

## Pipeline Diagram

```
┌─────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ integrationType │────▶│      Nexus         │◀────│ Target Config     │
│ source          │     │  (aios-nexus)      │     │ (estado atual)    │
│ target          │     └────────┬───────────┘     └───────────────────┘
└─────────────────┘              │
                         ┌───────┴───────┐
                         │   Backup      │
                         │   Target      │
                         └───────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────┴─────┐ ┌───┴────┐ ┌─────┴─────┐
              │  Detect   │ │ Apply  │ │  Verify   │
              │ Conflicts │ │ Config │ │  Sanity   │
              └─────┬─────┘ └───┬────┘ └─────┬─────┘
                    │           │             │
                    └───────────┼─────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                 ┌─────┴──────┐   ┌──────┴─────┐
                 │ config     │   │ integration│
                 │ Result     │   │ Log.md     │
                 └────────────┘   └────────────┘
```

## Descrição

A task `integrateConfiguration()` é o **ponto central de integração** do AIOS Forge Squad. Gerencia todas as operações de configuração e deployment, garantindo que mudanças são aplicadas de forma segura, rastreável e reversível.

### Responsabilidades por Tipo de Integração

1. **MCP Server Configuration** (`integrationType: mcp`):
   - Adicionar novo MCP server à configuração do Claude Code
   - Remover MCP server existente
   - Atualizar configuração de MCP server (credenciais, endpoints)
   - Validar conectividade após configuração
   - Atualizar `.claude.json` ou Docker MCP catalog conforme necessário

   ```yaml
   # Exemplo de operação MCP
   source: "context7"  # Nome do MCP server
   target: "~/.claude.json"  # Configuração global
   ```

2. **Settings Management** (`integrationType: settings`):
   - Atualizar `.claude/settings.json` com novas deny/allow rules
   - Gerenciar permissões de ferramentas
   - Configurar tool permissions e resource limits
   - Preservar settings existentes enquanto adiciona novos

   ```yaml
   # Exemplo de operação settings
   source: "new-deny-rules.json"
   target: ".claude/settings.json"
   ```

3. **Rules File Management** (`integrationType: rules`):
   - Criar ou atualizar arquivos em `.claude/rules/`
   - Configurar frontmatter `paths:` para regras contextuais
   - Validar que regras não conflitam entre si
   - Manter índice atualizado de regras ativas

   ```yaml
   # Exemplo de operação rules
   source: "new-rule-content.md"
   target: ".claude/rules/new-rule.md"
   ```

4. **Core Config Updates** (`integrationType: core-config`):
   - Atualizar `core-config.yaml` com novos parâmetros
   - Gerenciar feature flags e toggles
   - Atualizar boundary framework protection settings
   - Validar schema do core-config após mudança

   ```yaml
   # Exemplo de operação core-config
   source: "updated-params.yaml"
   target: "core-config.yaml"
   ```

5. **Squad Deployment** (`integrationType: squad-deploy`):
   - Copiar artefatos do squad para diretório de destino
   - Habilitar slash commands no projeto AIOS
   - Criar `.aios-sync.yaml` para rastreamento de sincronização
   - Registrar squad no IDS registry
   - Configurar agent IDs como comandos disponíveis

   ```yaml
   # Exemplo de operação squad-deploy
   source: "squads/aios-forge-squad/"
   target: "project-x/squads/aios-forge-squad/"
   ```

### Detecção e Resolução de Conflitos

| Tipo de Conflito | Estratégia |
|-----------------|-----------|
| Chave duplicada em JSON/YAML | Merge inteligente com preservação do existente |
| Regra contraditória | Notificar Oracle e aguardar decisão |
| Versão incompatível | Rollback e gerar instruções de upgrade |
| Permissão insuficiente | Gerar instruções manuais com sudo/admin |

### Formato do Integration Log

```markdown
# Integration Log — {integrationType}

**Date:** ISO-8601
**Source:** {source}
**Target:** {target}
**Status:** SUCCESS | PARTIAL | FAILED

## Operations
| # | Operation | Status | Details |
|---|-----------|--------|---------|
| 1 | Backup target | OK | backup-{timestamp} |
| 2 | Detect conflicts | OK | 0 conflicts |
| 3 | Apply config | OK | N changes applied |
| 4 | Verify sanity | OK | All checks passed |

## Rollback Instructions
[Comandos exatos para reverter todas as mudanças]

## Changes Applied
[Lista detalhada de cada mudança com before/after]
```

### Regras de Segurança

- **Nunca** modificar camadas L1 (Framework Core) ou L2 (Framework Templates)
- **Sempre** criar backup antes de qualquer modificação
- **Sempre** documentar instruções de rollback
- **Nunca** aplicar configuração que cause conflito sem resolução
- **Sempre** validar resultado após aplicação via teste de sanidade
- Operações em `.claude/settings.json` requerem validação extra de schema

### Integração com Pipeline

- **forge-artifact workflow**: integrateConfiguration() é a Fase 6 para deploy/integração
- **optimize-framework workflow**: integrateConfiguration() deploia mudanças após otimização
- Oracle pode invocar diretamente para operações de configuração standalone
- Nexus é o único agente com permissão para modificar arquivos de configuração do framework
