# Pre-Publish Checklist

> Validação final antes de publicar um squad no squads.sh marketplace.
> Executado na Fase 9 (Publisher) antes do comando `squads publish`.
> Squad: nirvana-squad-creator
> Created: 2026-02-24

---

## Pre-Conditions

Before starting, verify:

- [ ] Squad passou no quality gate (Fase 6 — PASSED)
- [ ] READMEs multilíngue gerados (Fase 7)
- [ ] Deploy local concluído (Fase 8)
- [ ] Usuário solicitou publicação explicitamente

---

## Checklist Items

### Category 1: Marketplace Requirements

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 1.1 | `name` é único no marketplace squads.sh | [ ] | blocking | Verificar com `squads search <name>` |
| 1.2 | `version` é semver válido e maior que versão publicada anterior | [ ] | blocking | |
| 1.3 | `description` clara e informativa (mín. 10 chars) | [ ] | blocking | |
| 1.4 | `aios.type` é "squad" | [ ] | blocking | |
| 1.5 | Pelo menos 1 agente definido em components.agents | [ ] | blocking | |
| 1.6 | `author` definido | [ ] | recommended | |
| 1.7 | `license` definido | [ ] | recommended | |
| 1.8 | `tags` com pelo menos 3 tags descritivas | [ ] | recommended | |

### Category 2: Security Scan

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 2.1 | Nenhum arquivo `.env` ou `.env.*` presente | [ ] | blocking | |
| 2.2 | Nenhuma API key ou token hardcoded nos arquivos | [ ] | blocking | Scan: `grep -r "sk-\|api_key\|token\|secret\|password"` |
| 2.3 | Nenhum diretório `node_modules/` incluído | [ ] | blocking | |
| 2.4 | Nenhum diretório `.git/` incluído | [ ] | blocking | |
| 2.5 | Nenhum arquivo temporário (*.tmp, *.bak, *.swp) | [ ] | recommended | |
| 2.6 | Nenhum arquivo de debug ou log | [ ] | recommended | |

### Category 3: Documentation Completeness

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 3.1 | README.md principal existe com descrição completa | [ ] | blocking | |
| 3.2 | README inclui seção de instalação/uso | [ ] | blocking | |
| 3.3 | README inclui lista de agentes com descrição | [ ] | recommended | |
| 3.4 | README inclui pipeline/workflow diagram | [ ] | recommended | |
| 3.5 | READMEs multilíngue presentes (mín. en + pt) | [ ] | recommended | |

### Category 4: Structural Integrity

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 4.1 | squad.yaml é YAML válido (sem erros de sintaxe) | [ ] | blocking | |
| 4.2 | Todos os arquivos listados em components existem em disco | [ ] | blocking | |
| 4.3 | Nenhum arquivo em disco ausente do manifest | [ ] | recommended | |
| 4.4 | config/ com coding-standards, tech-stack, source-tree | [ ] | blocking | |
| 4.5 | Estrutura de diretórios segue padrão AIOS | [ ] | recommended | |

### Category 5: CLI & Authentication

| # | Item | Status | Type | Notes |
|---|------|--------|------|-------|
| 5.1 | CLI `squads` disponível no PATH | [ ] | blocking | `which squads` |
| 5.2 | Usuário autenticado no squads.sh | [ ] | blocking | `squads whoami` |
| 5.3 | Usuário confirmou publicação explicitamente | [ ] | blocking | AskUserQuestion obrigatório |

---

## Post-Conditions

After publication, verify:

- [ ] Squad publicado com sucesso no squads.sh
- [ ] URL do marketplace retornada e informada ao usuário
- [ ] Versão publicada corresponde ao squad.yaml
- [ ] Squad acessível publicamente via URL

---

## Scoring

| Score | Result | Action |
|-------|--------|--------|
| 100% blocking items pass | **READY** | Prosseguir com `squads publish` |
| 1+ blocking item fail | **NOT READY** | Corrigir issues antes de publicar |

**Blocking items:** 16
**Recommended items:** 9
**Total:** 25

---

## Rollback

Em caso de falha na publicação:

1. Verificar logs do CLI: `squads publish --verbose`
2. Tentar novamente (max 2 retries)
3. Se persistir: gerar instruções manuais de publicação
4. Notificar orquestrador do status

---

## Usage

```bash
# Use this checklist with:
*checklist pre-publish

# Or reference in tasks:
checklist: pre-publish-checklist.md

# Invoked automatically by:
# publishSquad() → Phase 9 of NSC pipeline
```

---

*Checklist created by squad-creator — Craft*
