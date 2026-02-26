# Guia para Contribuição — Renato

Fala Renato! Esse documento explica como os dois repositórios funcionam juntos e onde você vai trabalhar para adicionar suporte ao Antigravity e ao Codex.

---

## Como Tudo Funciona

Quando alguém roda `npx create-aios-god-mode meu-projeto`, acontece isso:

```
┌─────────────────────────────────────────────────────────────────┐
│                    O USUÁRIO EXECUTA:                            │
│            npx create-aios-god-mode meu-projeto                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              REPO 1: create-aios-god-mode                       │
│                   (O INSTALADOR / CLI)                          │
│                                                                 │
│  É o código que roda no terminal do usuário.                    │
│  Ele orquestra todo o processo de instalação:                   │
│                                                                 │
│  1. Mostra logo e coleta configuração (prompts interativos)     │
│  2. Roda `npx aios-core init` (baixa o framework Synkra AIOS)  │
│  3. Baixa o template do GitHub (REPO 2) ───────────────────┐    │
│  4. Copia skills, rules e config para o projeto             │    │
│  5. Instala squads selecionados                             │    │
│  6. Configura MCPs (.mcp.json)                              │    │
│  7. Instala 22 skills da comunidade                         │    │
│  8. Instala GSD e cc-deploy                                 │    │
│  9. Roda npm install + git init                             │    │
│  10. Projeto pronto!                                        │    │
└─────────────────────────────────────────────────────────────┘    │
                                                                   │
                           ┌───────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│             REPO 2: aios-god-mode-template                      │
│                   (O TEMPLATE / CONTEÚDO)                       │
│                                                                 │
│  Contém os ARQUIVOS que serão copiados para o projeto:          │
│                                                                 │
│  template/                                                      │
│  ├── skills/aios-god-mode/   → .claude/skills/aios-god-mode/   │
│  ├── rules/                  → .claude/rules/                   │
│  └── config/settings.json    → .claude/settings.json            │
│                                                                 │
│  O CLI (REPO 1) faz download desse repo como tarball            │
│  via GitHub API e extrai os arquivos no projeto do usuário.     │
└─────────────────────────────────────────────────────────────────┘
```

**Resumo simples:**
- **REPO 1** (`create-aios-god-mode`) = o **programa** que instala tudo
- **REPO 2** (`aios-god-mode-template`) = os **arquivos** que são instalados

---

## Estrutura do REPO 1 (CLI)

```
create-aios-god-mode/
├── bin/index.js                    # Entry point do CLI
├── lib/
│   ├── cli.js                      # Define os 4 comandos (init, update, doctor, add-squad)
│   ├── commands/
│   │   ├── init.js                 # ⭐ Orquestra os 10 passos de instalação
│   │   ├── update.js               # Atualiza projeto existente
│   │   ├── doctor.js               # Diagnóstico de saúde
│   │   └── add-squad.js            # Adiciona squad a projeto existente
│   ├── core/
│   │   ├── aios-bootstrap.js       # Roda `npx aios-core init`
│   │   ├── god-mode-installer.js   # Baixa e instala o template (REPO 2)
│   │   ├── squad-installer.js      # Instala squads via `npx squads add`
│   │   ├── ecosystem-installer.js  # ⭐ Define MCPs, skills e instala tudo
│   │   └── post-setup.js           # npm install + git init
│   ├── ui/
│   │   ├── prompts.js              # ⭐ Prompts interativos (nome, tipo, idioma, squads)
│   │   ├── messages.js             # Mensagens de sucesso/erro/progresso
│   │   └── logo.js                 # Banner ASCII
│   └── utils/
│       ├── download.js             # Download de tarball via GitHub API
│       ├── validators.js           # Validação de nome, diretório, rede
│       └── platform.js             # Helpers de plataforma (TTY, paths)
└── package.json
```

---

## Onde Você Vai Trabalhar

Para adicionar suporte ao **Antigravity** e ao **Codex**, você provavelmente vai precisar mexer nos dois repos:

### No REPO 1 (`create-aios-god-mode`) — O PRINCIPAL

| Arquivo | O Que Fazer |
|---------|-------------|
| `lib/ui/prompts.js` | Adicionar prompt perguntando qual ferramenta de IA usar (Claude Code / Antigravity / Codex) |
| `lib/commands/init.js` | Passar a escolha da ferramenta para os instaladores |
| `lib/core/ecosystem-installer.js` | Configurar MCPs/skills específicos para cada ferramenta |
| `lib/core/god-mode-installer.js` | Possivelmente adaptar a instalação de rules/config por ferramenta |
| `lib/ui/messages.js` | Ajustar mensagem de sucesso com instruções específicas por ferramenta |

### No REPO 2 (`aios-god-mode-template`) — SE NECESSÁRIO

Se o Antigravity ou Codex precisarem de arquivos de configuração próprios (equivalentes ao `.claude/settings.json` ou `.claude/rules/`), você adiciona esses arquivos aqui dentro de `template/`.

---

## Como Contribuir (Passo a Passo)

### 1. Faça fork dos repos

Você vai receber um convite de colaborador. Aceite em:
https://github.com/notifications

### 2. Clone e crie uma branch

```bash
# Clone o repo do CLI (onde vai ser a maior parte do trabalho)
git clone https://github.com/gutomec/create-aios-god-mode.git
cd create-aios-god-mode

# Crie uma branch para sua feature
git checkout -b feature/antigravity-codex-support

# Instale dependências
npm install
```

### 3. Faça suas alterações

Edite os arquivos necessários (veja a tabela acima).

### 4. Teste localmente

```bash
# Testar o CLI localmente sem publicar no npm
node bin/index.js test-project

# Ou com link global
npm link
create-aios-god-mode test-project
```

### 5. Abra um PR

```bash
git add .
git commit -m "feat: add Antigravity and Codex support"
git push origin feature/antigravity-codex-support
```

Depois abra o PR no GitHub. O **CodeRabbit** vai revisar automaticamente e o Guto vai aprovar.

---

## Regras Importantes

1. **Nunca faça push direto na `main`** — sempre via PR
2. **O CodeRabbit vai revisar seu código automaticamente** — leia os comentários dele
3. **Mantenha compatibilidade** — o fluxo atual com Claude Code deve continuar funcionando
4. **Nomes de variáveis em inglês** — padrão do projeto
5. **Acentuação correta em textos PT-BR** — strings que o usuário vê devem ter acentos

---

## Dúvidas?

Abre uma issue no repo ou fala com o Guto direto.
