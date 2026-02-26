---
task: validateArtifact()
responsavel: "Sentinel"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: artifactPath
    tipo: string
    descricao: "Caminho absoluto ou relativo do artefato a ser validado"
    obrigatorio: true
  - nome: artifactType
    tipo: string
    descricao: "Tipo do artefato: agent|task|workflow|skill|squad|template|rule"
    obrigatorio: true
  - nome: strict
    tipo: boolean
    descricao: "Modo estrito — se true, warnings são tratados como erros (default: true)"
    obrigatorio: false

Saida:
  - nome: validationReport
    tipo: file
    descricao: "Relatório detalhado de validação com issues linha-a-linha"
    obrigatorio: true
  - nome: verdict
    tipo: string
    descricao: "Veredito final: PASSED|CONCERNS|FAILED"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Caminho do artefato existe e é acessível"
    - "[ ] Tipo do artefato é especificado e é um dos 7 tipos válidos"
    - "[ ] Constituição AIOS está acessível para verificação de compliance"
    - "[ ] Referências de formato estão disponíveis para o tipo especificado"
  post-conditions:
    - "[ ] Todas as verificações de formato executadas para o tipo"
    - "[ ] Compliance constitucional verificada contra os 6 artigos"
    - "[ ] Referências cruzadas validadas (dependências existem, comandos referenciam tasks válidas)"
    - "[ ] Compliance IDS verificada (sem duplicatas, REUSE > ADAPT > CREATE)"
    - "[ ] Quality gate checks executados (completude, documentação, error handling)"
    - "[ ] Relatório gerado com issues específicas e localização"
    - "[ ] Veredito final emitido: PASSED, CONCERNS ou FAILED"

Performance:
  duration_expected: "1-3 minutos"
  cost_estimated: "~2000 tokens"
  cacheable: false
  parallelizable: true
  skippable_when: "Nunca — validação é gate obrigatório para qualquer artefato"

Error Handling:
  strategy: continue
  fallback: "Se uma categoria de validação falhar, continuar com as demais e reportar falhas parciais"
  notification: "orchestrator"

Metadata:
  story: "Como framework, preciso que cada artefato seja validado contra todas as regras antes de ser aceito"
  version: "1.0.0"
  dependencies:
    - analyzeAiosComponent()
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# validateArtifact()

## Pipeline Diagram

```
┌─────────────────┐     ┌──────────────────────┐
│ artifactPath    │────▶│     Sentinel          │
│ artifactType    │     │  (aios-sentinel)      │
│ strict          │     └──────────┬────────────┘
└─────────────────┘                │
                          ┌────────┴────────┐
                          │                 │
                    ┌─────┴──────┐    ┌─────┴──────┐
                    │  5 Camadas │    │ Constituição│
                    │  de Check  │    │ 6 Artigos   │
                    └─────┬──────┘    └─────┬──────┘
                          │                 │
                          └────────┬────────┘
                                   │
                          ┌────────┴────────┐
                          │                 │
                    ┌─────┴──────┐    ┌─────┴──────┐    ┌──────────┐
                    │  PASSED    │    │  CONCERNS  │    │  FAILED  │
                    │            │    │  (warnings)│    │  (erros) │
                    └────────────┘    └────────────┘    └──────────┘
```

## Descrição

A task `validateArtifact()` é o **gate de qualidade universal** do AIOS Forge Squad. Valida qualquer artefato AIOS contra 5 camadas de verificação, garantindo conformidade total com o framework.

### Responsabilidades

1. **Validação de Formato** — Verifica conformidade estrutural por tipo:

   | Tipo | Verificações |
   |------|-------------|
   | `agent` | YAML frontmatter com `agent.name`, `agent.id`, `agent.title`, `persona_profile`, `greeting_levels` (3 níveis), `commands` |
   | `task` | YAML frontmatter com `task` (camelCase()), `responsavel`, `atomic_layer`, `Entrada`, `Saida`, `Checklist`, Pipeline Diagram no body |
   | `workflow` | YAML com `workflow_name` (snake_case), `description`, `agent_sequence`, `success_indicators`, `transitions` |
   | `skill` | Estrutura de skill Claude Code com manifest e handlers |
   | `squad` | `squad.yaml` com `name` (kebab-case), `version` (semver), `components`, `config` |
   | `template` | Frontmatter de template com `id`, `type`, variáveis de substituição |
   | `rule` | Frontmatter de rule com `paths:` (se contextual), seções obrigatórias |

2. **Compliance Constitucional** — Verificação contra os 6 artigos:

   | Artigo | Verificação |
   |--------|------------|
   | I — CLI First | Comandos são CLI-first, sem dependência de UI |
   | II — Agent Authority | Operações respeitam a delegation matrix |
   | III — Story-Driven | Artefato rastreável a uma story ou requisito |
   | IV — No Invention | Nenhuma feature inventada sem rastreabilidade |
   | V — Quality First | Error handling presente, validações definidas |
   | VI — Absolute Imports | Imports absolutos (quando aplicável) |

3. **Integridade de Referências Cruzadas** — Valida que:
   - Dependências listadas existem no filesystem
   - Comandos de agentes referenciam tasks existentes
   - `agent_sequence` em workflows referencia agent IDs existentes
   - `responsavel` em tasks corresponde a `agent.name` de agente existente
   - Contratos `Entrada`/`Saida` referenciam tasks existentes

4. **Compliance IDS** — Verifica aderência ao Incremental Development System:
   - Artefato não duplica funcionalidade existente
   - Princípio REUSE > ADAPT > CREATE respeitado
   - ID é único no registry
   - Versionamento semver aplicado

5. **Quality Gate Checks** — Verifica qualidade geral:
   - Completude: todas as seções obrigatórias presentes e não-vazias
   - Documentação: descrições claras e em PT-BR com acentuação correta
   - Error handling: estratégia de erro definida com fallback
   - Performance: estimativas de duração e custo presentes
   - Encoding: UTF-8 sem BOM

### Formato do Relatório

```markdown
# Validation Report — {artifactType}: {artifactName}

**Status:** PASSED | CONCERNS | FAILED
**Date:** ISO-8601
**Mode:** strict | lenient

## Summary
| Camada | Status | Issues |
|--------|--------|--------|
| Formato | PASSED/FAILED | N issues |
| Constituição | PASSED/FAILED | N issues |
| Referências | PASSED/FAILED | N issues |
| IDS | PASSED/FAILED | N issues |
| Qualidade | PASSED/FAILED | N issues |

## Issues
[Lista detalhada com linha, severidade (ERROR/WARNING), descrição e correção sugerida]

## Verdict
[Veredito final com justificativa]
```

### Regras de Veredito

| Veredito | Condição |
|----------|----------|
| **PASSED** | Zero erros, zero warnings (ou modo lenient sem erros) |
| **CONCERNS** | Zero erros, 1+ warnings (apenas em modo lenient) |
| **FAILED** | 1+ erros em qualquer camada |

### Integração com Pipeline

- **forge-artifact workflow**: validateArtifact() é a Fase 4 obrigatória
- **optimize-framework workflow**: validateArtifact() valida componente após otimização
- Se FAILED, o relatório retorna ao Oracle para roteamento de correção
- Se PASSED, o pipeline avança para a próxima fase (otimização ou integração)
