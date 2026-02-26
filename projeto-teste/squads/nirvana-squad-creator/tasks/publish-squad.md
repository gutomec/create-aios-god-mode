---
task: publishSquad()
responsavel: "Publisher"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: squadDir
    tipo: file
    descricao: "squads/<nome>/ ou repositório local"
    obrigatorio: true
  - nome: squadYaml
    tipo: file
    descricao: "squadDir/squad.yaml"
    obrigatorio: true
  - nome: userConfirmation
    tipo: boolean
    descricao: "user input (AskUserQuestion)"
    obrigatorio: true

Saida:
  - nome: publishResult
    tipo: object
    descricao: "user notification"
    obrigatorio: false
  - nome: marketplaceUrl
    tipo: string
    descricao: "user notification"
    obrigatorio: false

Checklist:
  pre-conditions:
    - "[ ] CLI `squads` disponível no PATH do sistema"
    - "[ ] Usuário autenticado no squads.sh (squads login)"
    - "[ ] squad.yaml válido com campos obrigatórios: name, version, description"
    - "[ ] Diretório do squad contém estrutura mínima: agents/, squad.yaml"
    - "[ ] Usuário confirmou publicação explicitamente"
  post-conditions:
    - "[ ] Squad publicado no squads.sh marketplace"
    - "[ ] URL do marketplace retornada e informada ao usuário"
    - "[ ] Versão publicada corresponde ao version do squad.yaml"
    - "[ ] Nenhum arquivo sensível publicado (.env, credentials, etc.)"

Performance:
  duration_expected: "1-3 minutos"
  cost_estimated: "~500 tokens + squads.sh API call"
  cacheable: false
  parallelizable: false
  skippable_when: "Usuário recusar publicação ou CLI squads não disponível"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "10s"
  fallback: "Gerar instruções manuais de publicação se CLI falhar"
  notification: "orchestrator"

Metadata:
  story: "Como criador de squad, quero publicar meu squad no marketplace squads.sh"
  version: "1.0.0"
  dependencies:
    - validateSquad()
  author: "Squad Creator"
  created_at: "2026-02-22T00:00:00Z"
  updated_at: "2026-02-22T00:00:00Z"
---

# publishSquad()

## Pipeline Diagram

```
┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐
│ squads/<nome>/   │  │ squad.yaml   │  │ userConfirmation   │
│ (diretório       │  │ (validado)   │  │ (boolean)          │
│  completo)       │  │              │  │                    │
└────────┬─────────┘  └──────┬───────┘  └─────────┬──────────┘
         │                   │                    │
         └───────────┬───────┴────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   Publisher      │
            │  (squad-         │
            │   publisher)     │
            └────────┬─────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
     ┌─────────────┐  ┌──────────────────┐
     │ squads.sh   │  │ marketplaceUrl   │
     │ publish     │  │ (string)         │
     │ result      │  │                  │
     └─────────────┘  └──────────────────┘
```

## Descrição

A task `publishSquad()` é a **nona fase** do pipeline e é **opcional**. Publica o squad validado no marketplace squads.sh para compartilhamento com a comunidade.

### Responsabilidades

1. **Pré-validação** — Antes de publicar:
   - Verificar que CLI `squads` está disponível (`which squads`)
   - Verificar autenticação (`squads whoami`)
   - Validar squad.yaml contra requisitos do marketplace
   - Verificar que nenhum arquivo sensível será publicado

2. **Confirmação do Usuário** — Publicação requer confirmação explícita:
   - Apresentar resumo do que será publicado (nome, versão, descrição)
   - Listar arquivos incluídos
   - Perguntar: "Confirma publicação no squads.sh?" (sim/não)

3. **Publicação** — Se confirmado:
   - Executar `squads publish <squadDir>` (ou equivalente)
   - Capturar output com URL do marketplace
   - Registrar resultado

4. **Notificação** — Informar ao usuário:
   - Status da publicação (sucesso/falha)
   - URL do marketplace para acesso público
   - Versão publicada
   - Instruções para atualização futura

### Fluxo de Publicação

```
1. Verificar CLI squads → disponível?
   ├── NÃO → Instruções de instalação + skip
   └── SIM ↓
2. Verificar autenticação → autenticado?
   ├── NÃO → Instruções de login + skip
   └── SIM ↓
3. Validar squad.yaml → válido?
   ├── NÃO → Lista de erros + skip
   └── SIM ↓
4. Confirmar com usuário → confirmado?
   ├── NÃO → Skip registrado
   └── SIM ↓
5. Publicar → sucesso?
   ├── NÃO → Retry ou instruções manuais
   └── SIM → URL do marketplace
```

### Segurança

Antes de publicar, verificar ausência de:
- Arquivos `.env` ou `.env.*`
- Credenciais hardcoded (API keys, tokens)
- Diretórios `node_modules/`, `.git/`
- Arquivos temporários do workspace

### Requisitos do Marketplace

O squads.sh requer:
- `name` único no marketplace
- `version` semver válido
- `description` não-vazio (mín. 10 caracteres)
- Pelo menos 1 agente definido
- `squad.yaml` com `aios.type: squad`

