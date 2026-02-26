---
task: optimizeComponent()
responsavel: "Catalyst"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: componentPath
    tipo: string
    descricao: "Caminho do componente AIOS a ser otimizado"
    obrigatorio: true
  - nome: metric
    tipo: string
    descricao: "Métrica alvo da otimização: tokens|speed|quality|context"
    obrigatorio: true
  - nome: preserveBackwardCompat
    tipo: boolean
    descricao: "Se true, preserva compatibilidade retroativa (default: true)"
    obrigatorio: false

Saida:
  - nome: optimizedComponent
    tipo: file
    descricao: "Versão otimizada do componente"
    obrigatorio: true
  - nome: optimizationReport
    tipo: file
    descricao: "Relatório com métricas antes/depois e detalhes das otimizações aplicadas"
    obrigatorio: true

Checklist:
  pre-conditions:
    - "[ ] Componente existe e é acessível no caminho especificado"
    - "[ ] Métrica é uma das 4 válidas: tokens, speed, quality, context"
    - "[ ] Backup do componente original criado antes de qualquer modificação"
    - "[ ] Componente é de camada mutável (L3 ou L4) ou possui autorização explícita"
  post-conditions:
    - "[ ] Versão otimizada passa em todas as validações do validateArtifact()"
    - "[ ] Métricas da métrica alvo apresentam melhoria mensurável"
    - "[ ] Compatibilidade retroativa preservada (se preserveBackwardCompat = true)"
    - "[ ] Relatório inclui delta quantitativo (antes/depois)"
    - "[ ] Nenhuma funcionalidade removida sem autorização"
    - "[ ] Referências cruzadas intactas"

Performance:
  duration_expected: "3-8 minutos"
  cost_estimated: "~5000 tokens"
  cacheable: false
  parallelizable: false
  skippable_when: "Quando componente já está no estado ótimo para a métrica alvo"

Error Handling:
  strategy: rollback
  fallback: "Retornar componente original com relatório de sugestões de otimização para aplicação manual"
  notification: "orchestrator"

Metadata:
  story: "Como framework, preciso que componentes sejam otimizados para métricas específicas sem perda de funcionalidade"
  version: "1.0.0"
  dependencies:
    - analyzeAiosComponent()
    - validateArtifact()
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# optimizeComponent()

## Pipeline Diagram

```
┌─────────────────┐     ┌───────────────────┐
│ componentPath   │────▶│    Catalyst        │
│ metric          │     │  (aios-catalyst)   │
│ backwardCompat  │     └────────┬───────────┘
└─────────────────┘              │
                         ┌───────┴───────┐
                         │   Backup      │
                         │   Original    │
                         └───────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────┴─────┐ ┌───┴────┐ ┌─────┴─────┐
              │  Measure  │ │Optimize│ │  Measure  │
              │  BEFORE   │ │ Apply  │ │  AFTER    │
              └─────┬─────┘ └───┬────┘ └─────┬─────┘
                    │           │             │
                    └───────────┼─────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                 ┌─────┴──────┐   ┌──────┴─────┐
                 │ optimized  │   │ optimization│
                 │ Component  │   │ Report.md   │
                 └────────────┘   └────────────┘
```

## Descrição

A task `optimizeComponent()` é a **ferramenta de otimização cirúrgica** do AIOS Forge Squad. Recebe um componente e uma métrica alvo, mede o estado atual, aplica otimizações específicas e verifica a melhoria, seguindo o padrão measure → optimize → verify.

### Responsabilidades

1. **Criação de Backup** — Antes de qualquer modificação, cria cópia de segurança do componente original em memória para possível rollback.

2. **Medição BEFORE** — Coleta métricas do componente no estado original:

   | Métrica | O que Mede | Como Mede |
   |---------|-----------|-----------|
   | `tokens` | Contagem de tokens do artefato | Estimativa via caracteres/4 |
   | `speed` | Indicadores de performance | Lazy loading, caching, paralelismo |
   | `quality` | Score de qualidade | Error handling, docs, cobertura |
   | `context` | Uso de context window | Tamanho de personas, handoffs |

3. **Aplicação de Otimizações por Métrica**:

   #### Métrica: `tokens`
   - Comprimir descrições verbose mantendo semântica
   - Eliminar redundâncias e repetições
   - Consolidar seções similares
   - Remover whitespace excessivo
   - Simplificar tabelas e listas sem perder informação

   #### Métrica: `speed`
   - Identificar operações sequenciais que podem ser paralelas
   - Adicionar lazy loading onde aplicável
   - Sugerir caching para dados frequentemente acessados
   - Otimizar order de execução em workflows
   - Reduzir número de transições em pipelines

   #### Métrica: `quality`
   - Adicionar error handling onde ausente
   - Completar documentação incompleta
   - Adicionar pre/post-conditions faltantes
   - Melhorar mensagens de erro e feedback
   - Adicionar validações de input

   #### Métrica: `context`
   - Compactar handoff artifacts
   - Minimizar tamanho de personas sem perder identidade
   - Reduzir greeting_levels a essencial
   - Comprimir listas de dependências
   - Eliminar seções não essenciais para operação

4. **Medição AFTER** — Coleta as mesmas métricas após otimização e calcula delta.

5. **Verificação de Integridade** — Garante que:
   - Componente otimizado é sintaticamente válido
   - Referências cruzadas permanecem intactas
   - Funcionalidade core não foi afetada
   - Backward compatibility preservada (se flag ativa)

### Formato do Relatório de Otimização

```markdown
# Optimization Report — {componentName}

**Date:** ISO-8601
**Metric:** {metric}
**Backward Compatible:** {yes/no}

## Summary
| Aspecto | Before | After | Delta | Melhoria |
|---------|--------|-------|-------|----------|
| {métrica principal} | {valor} | {valor} | {diff} | {%} |

## Otimizações Aplicadas
1. {Descrição da otimização 1} — Impacto: {delta}
2. {Descrição da otimização 2} — Impacto: {delta}
...

## Otimizações Não Aplicadas (preservação de compatibilidade)
1. {Descrição} — Motivo: {razão}
...

## Validation
- Format compliance: PASSED/FAILED
- Cross-references: PASSED/FAILED
- Backward compatibility: PASSED/FAILED/N/A
```

### Regras de Rollback

- Se a otimização causar falha na validação → rollback automático ao original
- Se a métrica piorar após otimização → rollback automático ao original
- Se backward compatibility quebrar e flag está ativa → rollback automático
- Em qualquer caso de rollback, relatório é gerado com sugestões para otimização manual

### Integração com Pipeline

- **optimize-framework workflow**: optimizeComponent() é a Fase 4 principal
- **forge-artifact workflow**: optimizeComponent() é a Fase 5 opcional
- Pós-otimização, o componente é enviado para validateArtifact() para verificação
- Se a validação falhar, rollback é executado e Oracle é notificado
