---
task: analyzeAiosComponent()
responsavel: "Oracle"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: componentPath
    tipo: string
    descricao: "Caminho absoluto ou relativo para o componente AIOS a ser analisado"
    obrigatorio: true
    validacao: "Deve ser um path válido para um artefato AIOS existente (agent, task, workflow, squad, core module)"
  - nome: analysisType
    tipo: string
    descricao: "Tipo de análise a executar: architecture | performance | quality | dependencies"
    obrigatorio: true
    validacao: "Deve ser um dos valores: architecture, performance, quality, dependencies"
  - nome: depth
    tipo: string
    descricao: "Profundidade da análise: shallow (overview) | deep (completa)"
    obrigatorio: false
    validacao: "Default: deep"
  - nome: outputFormat
    tipo: string
    descricao: "Formato do relatório: markdown | yaml | json"
    obrigatorio: false
    validacao: "Default: markdown"

Saida:
  - nome: analysisReport
    tipo: file
    descricao: "Relatório detalhado da análise do componente"
    destino: "squads/aios-forge-squad/outputs/analysis/"
    persistido: true
  - nome: recommendations
    tipo: file
    descricao: "Lista de recomendações acionáveis para melhorias"
    destino: "squads/aios-forge-squad/outputs/analysis/"
    persistido: true
  - nome: dependencyGraph
    tipo: object
    descricao: "Grafo de dependências do componente (quando analysisType=dependencies)"
    destino: "Memory"
    persistido: false

Checklist:
  pre-conditions:
    - "[ ] componentPath existe e é acessível no filesystem"
    - "[ ] componentPath aponta para um artefato AIOS válido (agent .md, task .md, workflow .yaml, squad dir, core module)"
    - "[ ] analysisType é um dos valores permitidos"
    - "[ ] Permissão de leitura no componente e seus artefatos relacionados"
  post-conditions:
    - "[ ] analysisReport cobre TODAS as dimensões do analysisType selecionado"
    - "[ ] recommendations contém pelo menos 1 recomendação acionável"
    - "[ ] Nenhum artefato referenciado no report aponta para paths inexistentes"
    - "[ ] Se analysisType=dependencies, dependencyGraph é um DAG válido (sem ciclos indetectáveis)"
    - "[ ] Report identifica a camada AIOS correta (L1/L2/L3/L4) do componente"

Performance:
  duration_expected: "2-5 minutos"
  cost_estimated: "~3000 tokens (Opus)"
  cacheable: true
  parallelizable: true
  skippable_when: "Nunca — análise é prerequisito para qualquer otimização ou modernização"

Error Handling:
  strategy: retry
  retry:
    max_attempts: 2
    delay: "3s"
  fallback: "Executar análise manual com escopo reduzido ao analysisType principal"
  notification: "orchestrator"
  common_errors:
    - error: "Component Not Found"
      cause: "componentPath inválido ou artefato removido"
      resolution: "Validar path e listar artefatos disponíveis"
    - error: "Invalid Artifact Format"
      cause: "Arquivo não segue formato AIOS esperado"
      resolution: "Identificar formato atual e reportar divergências"
    - error: "Circular Dependency Detected"
      cause: "Grafo de dependências contém ciclo"
      resolution: "Reportar ciclo com path completo e sugerir breaking point"

Metadata:
  story: "Como mantenedor do AIOS, preciso analisar componentes para entender arquitetura, performance e qualidade"
  version: "1.0.0"
  dependencies:
    - "Acesso ao filesystem do projeto"
    - "Conhecimento do modelo de 4 camadas AIOS (L1-L4)"
  tags:
    - analysis
    - architecture
    - performance
    - quality
    - dependencies
  author: "AIOS Forge Squad"
  created_at: "2026-02-24T00:00:00Z"
  updated_at: "2026-02-24T00:00:00Z"
---

# analyzeAiosComponent()

## Pipeline Diagram

```
┌───────────────────┐     ┌──────────────┐
│  componentPath     │────▶│              │
│  (string)          │     │   Oracle /   │
└───────────────────┘     │   Architect  │
                          │              │
┌───────────────────┐     │  ┌────────┐  │     ┌──────────────────────┐
│  analysisType      │────▶│  │ Router │  │────▶│  analysisReport      │
│  (string)          │     │  └────────┘  │     │  (detailed .md file) │
└───────────────────┘     │              │     └──────────────────────┘
                          │  ┌────────┐  │
┌───────────────────┐     │  │ Engine │  │     ┌──────────────────────┐
│  depth             │────▶│  └────────┘  │────▶│  recommendations     │
│  (shallow|deep)    │     │              │     │  (actionable .md)    │
└───────────────────┘     │  ┌────────┐  │     └──────────────────────┘
                          │  │ Graph  │  │
┌───────────────────┐     │  └────────┘  │     ┌──────────────────────┐
│  outputFormat      │────▶│              │────▶│  dependencyGraph     │
│  (md|yaml|json)    │     └──────────────┘     │  (in-memory object)  │
└───────────────────┘                           └──────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │ L1 Core  │ │ L2 Tmpl  │ │ L3/L4    │
             │ Analysis │ │ Analysis │ │ Analysis │
             └──────────┘ └──────────┘ └──────────┘
```

## Descrição

A task `analyzeAiosComponent()` é o **ponto de entrada analítico** do AIOS Forge Squad. Recebe qualquer componente AIOS e produz um relatório abrangente com recomendações acionáveis. É utilizada como prerequisito para tasks de otimização (`optimize-component`), modernização (`modernize-component`) e auditoria (`audit-framework`).

### Responsabilidades

1. **Identificação do Artefato** — Determinar o tipo do componente (agent, task, workflow, squad, core module) e sua camada no modelo AIOS (L1 Core, L2 Templates, L3 Config, L4 Runtime).

2. **Roteamento por Tipo de Análise** — Direcionar para o engine correto baseado no `analysisType`:

   | analysisType | Engine | Foco |
   |-------------|--------|------|
   | `architecture` | ArchitectureEngine | Dependências, camadas, interações entre subsistemas, acoplamento |
   | `performance` | PerformanceEngine | Uso de tokens, complexidade, tempo de carregamento, overhead |
   | `quality` | QualityEngine | Conformidade de formato, check constitucional, compliance IDS |
   | `dependencies` | DependencyEngine | Grafo, dependências circulares, referências órfãs |

3. **Análise de Arquitetura** — Quando `analysisType=architecture`:
   - Mapear todas as dependências diretas e transitivas
   - Identificar a camada AIOS (L1/L2/L3/L4) e verificar boundary compliance
   - Analisar interações com outros subsistemas (agents, tasks, workflows)
   - Avaliar acoplamento (tight vs loose) e coesão
   - Verificar aderência ao modelo de 4 camadas (L1 read-only, L2 extend-only, etc.)
   - Detectar violações de boundary (ex: task L4 modificando artefato L1)

4. **Análise de Performance** — Quando `analysisType=performance`:
   - Estimar token usage para execução completa
   - Analisar complexidade computacional (linear, quadrática, etc.)
   - Avaliar tempo de carregamento (quantos arquivos precisam ser lidos)
   - Identificar gargalos (steps que consomem mais tokens)
   - Comparar com benchmarks de componentes similares
   - Recomendar otimizações de context window

5. **Análise de Qualidade** — Quando `analysisType=quality`:
   - Verificar conformidade com o formato esperado (TASK-FORMAT-V1, AGENT-PERSONALIZATION-STANDARD-V1, etc.)
   - Check constitucional (6 artigos da Constituição AIOS)
   - Compliance IDS (Incremental Development System)
   - Validar YAML frontmatter (campos obrigatórios, tipos corretos)
   - Avaliar completude (seções presentes vs seções esperadas)
   - Verificar qualidade da documentação (descrições, diagramas, exemplos)

6. **Análise de Dependências** — Quando `analysisType=dependencies`:
   - Construir grafo de dependências (directed acyclic graph)
   - Detectar dependências circulares
   - Identificar referências órfãs (aponta para artefatos inexistentes)
   - Calcular fan-in (quantos artefatos dependem deste) e fan-out (de quantos este depende)
   - Sugerir refatorações para reduzir acoplamento

### Classificação de Camada

O engine identifica automaticamente a camada do componente:

| Camada | Path Pattern | Mutabilidade | Ação da Análise |
|--------|-------------|-------------|----------------|
| L1 Core | `.aios-core/core/` | NEVER modify | Verificar integridade, reportar como referência |
| L2 Templates | `.aios-core/development/` | Extend-only | Verificar se extensões não quebram base |
| L3 Config | `.aios-core/data/`, `agents/*/MEMORY.md` | Mutable (exceções) | Validar configurações |
| L4 Runtime | `docs/stories/`, `packages/`, `squads/` | ALWAYS modify | Análise completa, recomendações livres |

### Geração de Recomendações

Cada recomendação segue o formato:

```yaml
recommendation:
  id: "REC-001"
  severity: critical | high | medium | low
  category: architecture | performance | quality | dependency
  title: "Descrição curta"
  description: "Explicação detalhada do problema"
  impact: "O que acontece se não corrigir"
  action: "Passos concretos para resolver"
  effort: low | medium | high
  related_artifacts:
    - "path/to/related.md"
```

### Critérios de Qualidade do Report

- Cada seção do report deve ter pelo menos 3 bullets de análise
- Recomendações devem ser SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Nenhum statement sem evidência (path, contagem, comparação)
- Severidade deve refletir impacto real no framework
- Referências a paths devem ser verificáveis

### Integração com Outros Tasks

| Task Consumidora | Como Usa o Output |
|-----------------|------------------|
| `optimizeComponent()` | Usa recommendations com severity>=high como input |
| `modernizeComponent()` | Usa analysisReport para planejar modernização |
| `auditFramework()` | Agrega múltiplos analysisReports em audit geral |
| `validateArtifact()` | Usa quality analysis como referência de validação |
