/**
 * Mapeamento de diretórios e arquivos por AI Tool.
 *
 * Alinhado com ide-configs.js do aiox-core (6 IDEs).
 *
 * @type {Record<string, { skills: string, rules: string, agents: string|null, mcp: string|null, instructions: string, ignore: string, startCommand: string, specialAgents: string|null }>}
 */
export const TOOL_PATHS = {
  'claude-code': {
    skills: '.claude/skills',
    rules: '.claude/rules',
    agents: '.claude/commands/AIOX/agents',
    mcp: '.mcp.json',
    instructions: 'CLAUDE.md',
    ignore: '.claudeignore',
    startCommand: 'claude',
  },
  codex: {
    skills: '.codex/skills',
    agents: '.codex/agents',
    rules: null,
    mcp: '.codex/config.toml',
    instructions: 'AGENTS.md',
    ignore: '.codexignore',
    startCommand: 'codex',
  },
  gemini: {
    skills: '.gemini/skills',
    agents: '.gemini/rules/AIOX/agents',
    rules: '.gemini/rules',
    mcp: null,
    instructions: 'GEMINI.md',
    ignore: '.geminiignore',
    startCommand: 'gemini',
  },
  cursor: {
    skills: '.cursor/skills',
    agents: '.cursor/rules',
    rules: '.cursor/rules',
    mcp: '.cursor/mcp.json',
    instructions: 'AGENTS.md',
    ignore: '.cursorignore',
    startCommand: 'cursor',
  },
  'github-copilot': {
    skills: null,
    agents: '.github/agents',
    rules: null,
    mcp: null,
    instructions: '.github/copilot-instructions.md',
    ignore: null,
    startCommand: 'code',
  },
  antigravity: {
    skills: null,
    agents: '.agent/workflows',
    specialAgents: '.antigravity/agents',
    rules: '.antigravity/rules',
    mcp: null,
    instructions: 'AGENTS.md',
    ignore: null,
    startCommand: 'antigravity',
  },
};

/**
 * Backward compat: mapeia keys legadas para as novas.
 */
const LEGACY_MAP = {
  claude: 'claude-code',
};

/**
 * Retorna os paths para uma ferramenta de IA.
 *
 * @param {string} aiTool - Identificador da ferramenta
 * @returns {typeof TOOL_PATHS['claude-code']}
 */
export function getToolPaths(aiTool) {
  const resolved = LEGACY_MAP[aiTool] || aiTool;
  return TOOL_PATHS[resolved] || TOOL_PATHS['claude-code'];
}

/**
 * Retorna a key normalizada da ferramenta (resolvendo legados).
 *
 * @param {string} aiTool - Identificador da ferramenta (pode ser legado)
 * @returns {string}
 */
export function resolveToolKey(aiTool) {
  return LEGACY_MAP[aiTool] || aiTool;
}

/**
 * Retorna todas as keys de ferramentas disponíveis.
 *
 * @returns {string[]}
 */
export function getAvailableTools() {
  return Object.keys(TOOL_PATHS);
}
