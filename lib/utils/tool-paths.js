/**
 * Mapeamento de diretórios e arquivos por AI Tool.
 *
 * Baseado na pesquisa: research/AI_CODING_TOOLS_DIRECTORY_STRUCTURES.md
 *
 * @type {Record<string, { skills: string, rules: string, mcp: string|null, instructions: string, ignore: string, startCommand: string }>}
 */
export const TOOL_PATHS = {
  claude: {
    skills: '.claude/skills',
    rules: '.claude/rules',
    mcp: '.mcp.json',
    instructions: 'CLAUDE.md',
    ignore: '.claudeignore',
    startCommand: 'claude',
  },
  antigravity: {
    skills: '.agents/skills',
    rules: '.agents/rules',
    mcp: null, // Global only: ~/.gemini/antigravity/mcp_config.json
    instructions: 'GEMINI.md',
    ignore: '.geminiignore',
    startCommand: 'antigravity',
  },
  codex: {
    skills: '.agents/skills',
    rules: '.codex/rules',
    mcp: '.codex/config.toml',
    instructions: 'AGENTS.md',
    ignore: '.codexignore',
    startCommand: 'codex',
  },
  cursor: {
    skills: '.cursor/skills',
    rules: '.cursor/rules',
    mcp: '.cursor/mcp.json',
    instructions: 'AGENTS.md',
    ignore: '.cursorignore',
    startCommand: 'cursor',
  },
};

/**
 * Retorna os paths para uma ferramenta de IA.
 *
 * @param {string} aiTool - Identificador da ferramenta (claude|antigravity|codex|cursor)
 * @returns {typeof TOOL_PATHS.claude}
 */
export function getToolPaths(aiTool) {
  return TOOL_PATHS[aiTool] || TOOL_PATHS.claude;
}
