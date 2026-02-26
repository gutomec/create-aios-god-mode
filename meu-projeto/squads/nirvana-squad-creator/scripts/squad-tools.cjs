#!/usr/bin/env node
// squad-tools.cjs — CLI de estado atômico para o pipeline de squads
// Zero dependências externas. Node.js puro.
// Uso: node scripts/squad-tools.cjs <comando> [args]

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_DIR = path.resolve(process.cwd(), '.squad-workspace');

// 9 phases of the squad creation pipeline
// File ownership:
//   Phase 1 (Analyzer):         writes analysis.md, component-registry.md
//   Phase 2 (Agent Creator):    writes agents/*.md
//   Phase 3 (Task Creator):     writes tasks/*.md
//   Phase 4 (Workflow Creator): writes workflows/*.yaml, config/*.md, squad.yaml
//   Phase 5 (Optimizer):        edits all generated files, writes optimization-report.md
//   Phase 6 (Validator):        writes validation-report.md (read-only access to rest)
//   Phase 7 (README Creator):   writes README.md, README.en.md, README.zh.md, etc.
//   Phase 8 (Deploy):           deploys squad to AIOS project, enables slash commands
//   Phase 9 (Publisher):        publishes squad to squads.sh marketplace
const PHASES = {
  1: { name: 'Analyzer', outputDir: null, outputFile: 'analysis.md' },
  2: { name: 'Agent Creator', outputDir: 'agents', outputFile: null },
  3: { name: 'Task Creator', outputDir: 'tasks', outputFile: null },
  4: { name: 'Workflow Creator', outputDir: 'workflows', outputFile: null },
  5: { name: 'Optimizer', outputDir: null, outputFile: 'optimization-report.md' },
  6: { name: 'Validator', outputDir: null, outputFile: 'validation-report.md' },
  7: { name: 'README Creator', outputDir: null, outputFile: null },
  8: { name: 'Deploy', outputDir: null, outputFile: null },
  9: { name: 'Publisher', outputDir: null, outputFile: null },
};

// Expected outputs per phase for validation
const REQUIRED_OUTPUTS = {
  1: { files: ['analysis.md', 'component-registry.md'] },
  2: { dirs: ['agents'], minFiles: 1 },
  3: { dirs: ['tasks'], minFiles: 1 },
  4: { dirs: ['workflows'], minFiles: 1, files: ['squad.yaml'] },
  5: { files: ['optimization-report.md'] },
  6: { files: ['validation-report.md'] },
  7: { files: ['README.md', 'README.en.md'] },
  8: {},
  9: {},
};

const PRESETS = {
  rapido: { model_base: 'sonnet', optimizer: false, auto_advance: true },
  padrao: { model_base: 'opus', optimizer: true, auto_advance: false },
  profundo: { model_base: 'opus', optimizer: true, auto_advance: false },
};

// ============================================================================
// UTILITIES
// ============================================================================

function sessionDir(name) {
  return path.join(BASE_DIR, name);
}

function configPath(name) {
  return path.join(sessionDir(name), 'config.json');
}

function statePath(name) {
  return path.join(sessionDir(name), 'STATE.md');
}

function readJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch {
    return null;
  }
}

function writeFile(filepath, content) {
  fs.writeFileSync(filepath, content, 'utf8');
}

function timestamp() {
  return new Date().toISOString();
}

function parseArgs(args) {
  const result = { _positional: [] };
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valParts] = arg.slice(2).split('=');
      const val = valParts.length > 0 ? valParts.join('=') : 'true';
      result[key] = val;
    } else {
      result._positional.push(arg);
    }
  }
  return result;
}

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function fail(msg) {
  output({ ok: false, error: msg });
  process.exit(1);
}

function calcDuration(start, end) {
  try {
    const diff = new Date(end) - new Date(start);
    if (isNaN(diff) || diff < 0) return '—';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins === 0) return `${secs}s`;
    return `${mins}m${secs}s`;
  } catch {
    return '—';
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// CONFIG V2
// ============================================================================

function createConfigV2(name, presetName) {
  const preset = PRESETS[presetName] || PRESETS.padrao;
  return {
    version: 2,
    name,
    preset: presetName,
    created_at: timestamp(),
    model_base: preset.model_base,
    workflow: {
      auto_advance: preset.auto_advance,
      max_retries: 1,
    },
    gates: {
      phase_4: false,
    },
    current_phase: 0,
    phases_complete: [],
    metrics: {},
    gates_log: [],
    decisions: {},
  };
}

function isV1(config) {
  return !config.version || config.version < 2;
}

function migrateV1toV2(config) {
  return {
    version: 2,
    name: config.name || config.nome || 'unknown',
    preset: config.preset || 'padrao',
    created_at: config.created_at || config.criado_em || timestamp(),
    model_base: config.model_base || config.modelo_base || 'sonnet',
    workflow: {
      auto_advance: false,
      max_retries: 1,
    },
    gates: {
      phase_4: false,
    },
    current_phase: config.current_phase || config.fase_atual || 0,
    phases_complete: config.phases_complete || config.fases_completas || [],
    metrics: config.metrics || config.metricas || {},
    gates_log: config.gates_log || [],
    decisions: config.decisions || config.decisoes || {},
  };
}

// ============================================================================
// STATE.MD
// ============================================================================

function createStateMd(name, presetName) {
  const ts = timestamp();
  return `# Squad Session: ${name}

## Metadados

- **Versão**: 2
- **Sessão**: ${name}
- **Preset**: ${presetName}
- **Criado em**: ${ts}
- **Última atualização**: ${ts}

## Fases

| Fase | Agente | Status | Início | Fim | Notas |
|------|--------|--------|--------|-----|-------|
| 1 | Analyzer | pendente | — | — | — |
| 2 | Agent Creator | pendente | — | — | — |
| 3 | Task Creator | pendente | — | — | — |
| 4 | Workflow Creator | pendente | — | — | — |
| 5 | Optimizer | pendente | — | — | — |
| 6 | Validator | pendente | — | — | — |
| 7 | README Creator | pendente | — | — | — |
| 8 | Deploy | pendente | — | — | — |
| 9 | Publisher | pendente | — | — | — |

## Decisões

(nenhuma ainda)

## Gates

| Fase | Resultado | Notas | Timestamp |
|------|-----------|-------|-----------|

## Anti-loop

Fases completas: nenhuma
`;
}

function updateStatePhase(stateContent, phase, status, ts, notes) {
  const phaseStr = String(phase);
  const phaseRegex = new RegExp(
    `^(\\| ${escapeRegex(phaseStr)} \\|[^|]*\\|)\\s*\\w+\\s*(\\|[^|]*\\|[^|]*\\|[^|]*\\|)`,
    'm'
  );

  if (status === 'em_progresso') {
    stateContent = stateContent.replace(phaseRegex, `$1 em_progresso | ${ts} | — | — |`);
  } else if (status === 'completa') {
    // Capture existing start time
    const matchStart = stateContent.match(
      new RegExp(`^\\| ${escapeRegex(phaseStr)} \\|[^|]*\\|[^|]*\\|\\s*([^|]*)\\|`, 'm')
    );
    const start = matchStart ? matchStart[1].trim() : ts;
    const duration = (start !== '—' && start !== ts) ? calcDuration(start, ts) : '—';
    const notesStr = notes || '—';
    stateContent = stateContent.replace(phaseRegex, `$1 completa | ${start} | ${ts} | ${notesStr} |`);
  }

  // Update last updated timestamp
  stateContent = stateContent.replace(
    /\*\*Última atualização\*\*: .*/,
    `**Última atualização**: ${ts}`
  );

  return stateContent;
}

function updateStateAntiLoop(stateContent, phasesComplete) {
  const list = phasesComplete.length > 0 ? phasesComplete.join(', ') : 'nenhuma';
  return stateContent.replace(
    /Fases completas: .*/,
    `Fases completas: ${list}`
  );
}

function addStateGate(stateContent, phase, result, notes, ts) {
  const gateLine = `| ${phase} | ${result} | ${notes} | ${ts} |`;
  return stateContent.replace(
    /(## Gates\n\n\|[^\n]+\n\|[^\n]+\n)/,
    `$1${gateLine}\n`
  );
}

function addStateDecision(stateContent, key, value) {
  const marker = '(nenhuma ainda)';
  if (stateContent.includes(marker)) {
    return stateContent.replace(marker, `- **${key}**: ${value}`);
  }
  // Append after last decision line under ## Decisões
  return stateContent.replace(
    /(## Decisões\n(?:[\s\S]*?))((?:\n## ))/,
    `$1- **${key}**: ${value}\n$2`
  );
}

// ============================================================================
// COMMANDS
// ============================================================================

const COMMANDS = {};

// --- init ---
COMMANDS.init = function (args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: init <session> [--preset=padrao]');

  const dir = sessionDir(name);
  if (fs.existsSync(dir)) fail(`Sessão "${name}" já existe em ${dir}`);

  const presetName = parsed.preset || 'padrao';
  if (!PRESETS[presetName]) fail(`Preset inválido: ${presetName}. Use: rapido, padrao, profundo`);

  // Create session directory + subdirectories
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'workflows'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'config'), { recursive: true });

  const config = createConfigV2(name, presetName);
  writeJSON(configPath(name), config);

  const state = createStateMd(name, presetName);
  writeFile(statePath(name), state);

  output({
    ok: true,
    command: 'init',
    session: name,
    path: dir,
    config,
  });
};

// --- resume ---
COMMANDS.resume = function (args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: resume <session>');

  const dir = sessionDir(name);
  if (!fs.existsSync(dir)) fail(`Sessão "${name}" não encontrada em ${dir}`);

  let config = readJSON(configPath(name));
  if (!config) fail(`config.json não encontrado em ${dir}`);

  let migrated = false;
  if (isV1(config)) {
    config = migrateV1toV2(config);
    migrated = true;
    // Do NOT write — preserve original (backward compatibility)
  }

  output({
    ok: true,
    command: 'resume',
    session: name,
    config,
    resumed_from_phase: config.current_phase,
    migrated,
  });
};

// --- state (router) ---
COMMANDS.state = function (args) {
  const subcommand = args[0];
  const subArgs = args.slice(1);

  if (!subcommand) fail('Uso: state <get|advance|gate|add-decision> <session> [flags]');

  const handlers = {
    get: stateGet,
    advance: stateAdvance,
    gate: stateGate,
    'add-decision': stateAddDecision,
  };

  if (!handlers[subcommand]) fail(`Subcomando inválido: ${subcommand}. Use: get, advance, gate, add-decision`);
  handlers[subcommand](subArgs);
};

function stateGet(args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: state get <session>');

  let config = readJSON(configPath(name));
  if (!config) fail(`Sessão "${name}" não encontrada`);

  if (isV1(config)) config = migrateV1toV2(config);

  output({
    ok: true,
    command: 'state get',
    session: name,
    config,
  });
}

function stateAdvance(args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: state advance <session> --phase=N [--notes="..."]');

  const phase = parsed.phase !== undefined ? parseInt(parsed.phase, 10) : null;
  if (phase === null || isNaN(phase)) fail('Flag --phase é obrigatória (número inteiro)');
  const notes = parsed.notes || '';

  let config = readJSON(configPath(name));
  if (!config) fail(`Sessão "${name}" não encontrada`);

  if (isV1(config)) config = migrateV1toV2(config);

  // Anti-loop: fail if phase <= current_phase
  if (phase <= config.current_phase) {
    fail(`Anti-loop: fase ${phase} <= fase atual ${config.current_phase}. Não é permitido retroceder.`);
  }

  // Anti-loop: fail if phase already complete
  if (config.phases_complete.includes(phase)) {
    fail(`Anti-loop: fase ${phase} já está completa.`);
  }

  const ts = timestamp();
  const previousPhase = config.current_phase;

  // Update config
  config.phases_complete.push(phase);
  config.phases_complete.sort((a, b) => a - b);
  config.current_phase = phase;

  if (!config.metrics) config.metrics = {};
  if (!config.metrics[String(phase)]) config.metrics[String(phase)] = {};
  config.metrics[String(phase)].completed_at = ts;
  config.metrics[String(phase)].notes = notes;

  writeJSON(configPath(name), config);

  // Update STATE.md
  let state = readFile(statePath(name));
  if (state) {
    state = updateStatePhase(state, phase, 'completa', ts, notes || null);
    state = updateStateAntiLoop(state, config.phases_complete);
    writeFile(statePath(name), state);
  }

  output({
    ok: true,
    command: 'state advance',
    session: name,
    previous_phase: previousPhase,
    new_phase: phase,
    notes,
    phases_complete: config.phases_complete,
    timestamp: ts,
  });
}

function stateGate(args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: state gate <session> --phase=N --result=approved|rejected [--notes="..."]');

  const phase = parsed.phase !== undefined ? parseInt(parsed.phase, 10) : null;
  if (phase === null || isNaN(phase)) fail('Flag --phase é obrigatória');
  const result = parsed.result || 'approved';
  const notes = parsed.notes || '';

  let config = readJSON(configPath(name));
  if (!config) fail(`Sessão "${name}" não encontrada`);

  if (isV1(config)) config = migrateV1toV2(config);

  const ts = timestamp();

  if (!config.gates_log) config.gates_log = [];
  config.gates_log.push({ phase, result, notes, timestamp: ts });

  writeJSON(configPath(name), config);

  // Update STATE.md
  let state = readFile(statePath(name));
  if (state) {
    state = addStateGate(state, phase, result, notes, ts);
    writeFile(statePath(name), state);
  }

  output({
    ok: true,
    command: 'state gate',
    session: name,
    gate: { phase, result, notes },
    timestamp: ts,
  });
}

function stateAddDecision(args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: state add-decision <session> --key="..." --value="..."');

  const key = parsed.key;
  const value = parsed.value;
  if (!key || !value) fail('Flags --key e --value são obrigatórias');

  let config = readJSON(configPath(name));
  if (!config) fail(`Sessão "${name}" não encontrada`);

  if (isV1(config)) config = migrateV1toV2(config);

  if (!config.decisions) config.decisions = {};
  config.decisions[key] = value;

  writeJSON(configPath(name), config);

  // Update STATE.md
  let state = readFile(statePath(name));
  if (state) {
    state = addStateDecision(state, key, value);
    writeFile(statePath(name), state);
  }

  output({
    ok: true,
    command: 'state add-decision',
    session: name,
    key,
    value,
  });
}

// --- validate ---
COMMANDS.validate = function (args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: validate <session> --phase=N');

  const phase = parsed.phase !== undefined ? parseInt(parsed.phase, 10) : null;
  if (phase === null || isNaN(phase)) fail('Flag --phase é obrigatória');

  const phaseInfo = PHASES[phase];
  if (!phaseInfo) fail(`Fase ${phase} não reconhecida. Fases válidas: 1-9`);

  const requirements = REQUIRED_OUTPUTS[phase];
  if (!requirements) fail(`Sem requisitos de validação para fase ${phase}`);

  const dir = sessionDir(name);
  if (!fs.existsSync(dir)) fail(`Sessão "${name}" não encontrada em ${dir}`);

  const checks = [];

  // Check required files
  if (requirements.files) {
    for (const file of requirements.files) {
      const filepath = path.join(dir, file);
      const exists = fs.existsSync(filepath);
      checks.push({
        type: 'file',
        path: file,
        exists,
        detail: exists ? `Arquivo encontrado` : `Arquivo não encontrado: ${file}`,
      });
    }
  }

  // Check required directories
  if (requirements.dirs) {
    for (const dirName of requirements.dirs) {
      const dirPath = path.join(dir, dirName);
      const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
      let fileCount = 0;
      if (exists) {
        fileCount = fs.readdirSync(dirPath).filter(f => {
          const fp = path.join(dirPath, f);
          return fs.statSync(fp).isFile();
        }).length;
      }
      const minFiles = requirements.minFiles || 0;
      const meetsMinimum = exists && fileCount >= minFiles;

      checks.push({
        type: 'directory',
        path: dirName,
        exists,
        file_count: fileCount,
        min_files: minFiles,
        meets_minimum: meetsMinimum,
        detail: !exists
          ? `Diretório não encontrado: ${dirName}`
          : !meetsMinimum
            ? `Diretório ${dirName} tem ${fileCount} arquivo(s), mínimo: ${minFiles}`
            : `Diretório ${dirName} com ${fileCount} arquivo(s)`,
      });
    }
  }

  const allPassed = checks.every(c => {
    if (c.type === 'file') return c.exists;
    if (c.type === 'directory') return c.meets_minimum;
    return true;
  });

  output({
    ok: allPassed,
    command: 'validate',
    session: name,
    phase,
    phase_name: phaseInfo.name,
    checks,
  });
};

// --- snapshot ---
COMMANDS.snapshot = function (args) {
  const parsed = parseArgs(args);
  const name = parsed._positional[0];
  if (!name) fail('Uso: snapshot <session>');

  const dir = sessionDir(name);
  if (!fs.existsSync(dir)) fail(`Sessão "${name}" não encontrada em ${dir}`);

  let config = readJSON(configPath(name));
  if (!config) fail(`config.json não encontrado`);

  const originalV1 = isV1(config);
  if (originalV1) config = migrateV1toV2(config);

  // Recursive file inventory
  const files = [];
  function walkDir(currentDir, prefix) {
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const relativePath = prefix ? `${prefix}/${entry}` : entry;
      const stats = fs.statSync(fullPath);
      if (stats.isFile()) {
        files.push({
          path: relativePath,
          bytes: stats.size,
          modified: stats.mtime.toISOString(),
        });
      } else if (stats.isDirectory()) {
        walkDir(fullPath, relativePath);
      }
    }
  }
  walkDir(dir, '');

  output({
    ok: true,
    command: 'snapshot',
    session: name,
    config_v1: originalV1,
    config,
    files,
    metrics: config.metrics || {},
    gates: config.gates_log || [],
  });
};

// ============================================================================
// MAIN
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`squad-tools.cjs — CLI de estado atômico para o pipeline de squads (9 fases)

Comandos:
  init <session> [--preset=padrao]                    Criar nova sessão
  resume <session>                                     Restaurar estado (retrocompatível v1->v2)
  state get <session>                                  Estado atual como JSON
  state advance <session> --phase=N [--notes="..."]    Avançar fase atomicamente
  state gate <session> --phase=N --result=... [--notes]  Registrar gate
  state add-decision <session> --key=... --value=...   Adicionar decisão
  validate <session> --phase=N                         Validar outputs esperados por fase (1-9)
  snapshot <session>                                   Config + state + inventário completo

Todas as saídas são JSON. Erros retornam { ok: false, error: "..." }.`);
    process.exit(0);
  }

  const command = args[0];
  const restArgs = args.slice(1);

  if (!COMMANDS[command]) {
    fail(`Comando desconhecido: "${command}". Execute sem argumentos para ver a ajuda.`);
  }

  try {
    COMMANDS[command](restArgs);
  } catch (err) {
    fail(`Erro interno: ${err.message}`);
  }
}

main();
