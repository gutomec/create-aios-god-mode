import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { convertSkills, convertMcpConfig, convertProjectInstructions, convertRules } from '../utils/skill-converter.js';
import { getToolPaths, resolveToolKey } from '../utils/tool-paths.js';

/**
 * Configuração dos MCP servers a serem instalados no projeto.
 */
const MCP_CONFIG = {
  mcpServers: {
    'nano-banana-pro': {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@rafarafarafa/nano-banana-pro-mcp'],
      env: {
        GEMINI_API_KEY: '${GEMINI_API_KEY}',
      },
    },
    context7: {
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp@latest'],
    },
    '21st-dev': {
      command: 'npx',
      args: ['-y', '@21st-dev/magic@latest'],
    },
  },
};

/**
 * Configura os MCP servers para a ferramenta de IA selecionada.
 *
 * Faz merge com configuração existente se o arquivo já existir.
 * Usa convertMcpConfig para adaptar o formato por ferramenta.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {string} [aiTool='claude-code'] - Ferramenta de IA selecionada
 * @returns {Promise<{ count: number, warning: string|null }>} Número de MCPs e aviso opcional
 */
export async function configureMcps(projectDir, aiTool = 'claude-code') {
  const resolved = resolveToolKey(aiTool);

  if (resolved === 'claude-code') {
    // Claude Code: manter lógica original de merge
    const mcpPath = path.join(projectDir, '.mcp.json');

    if (await fse.pathExists(mcpPath)) {
      const existing = await fse.readJson(mcpPath);
      const merged = {
        mcpServers: {
          ...(existing.mcpServers || {}),
          ...MCP_CONFIG.mcpServers,
        },
      };
      await fse.writeJson(mcpPath, merged, { spaces: 2 });
    } else {
      await fse.writeJson(mcpPath, MCP_CONFIG, { spaces: 2 });
    }

    return { count: Object.keys(MCP_CONFIG.mcpServers).length, warning: null };
  }

  // Outras ferramentas: usar conversor
  const result = await convertMcpConfig(MCP_CONFIG, projectDir, resolved);
  return {
    count: Object.keys(MCP_CONFIG.mcpServers).length,
    warning: result.warning,
  };
}

/**
 * Instala o GSD (Get Shit Done) framework no projeto.
 *
 * Usa `npx get-shit-done-cc --local` para instalação local no projeto.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {Promise<boolean>} true se instalado com sucesso
 */
export async function installGsd(projectDir) {
  try {
    const result = spawnSync('npx', ['-y', 'get-shit-done-cc', '--local'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 120_000,
    });

    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Instala oh-my-claudecode globalmente via npx.
 *
 * @returns {Promise<boolean>} true se instalado com sucesso
 */
export async function installOhMyClaudeCode() {
  try {
    const result = spawnSync('npx', ['-y', 'oh-my-claude-sisyphus', 'install', '--skip-claude-check'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 120_000,
    });

    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Corrige a estrutura de diretórios após instalação de skills.
 *
 * O `npx skills add` cria arquivos em `.agents/skills/` e symlinks em `.claude/skills/`.
 * Esta função substitui os symlinks por diretórios reais, converte skills/rules/instructions
 * para a ferramenta de IA selecionada, e limpa diretórios desnecessários.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {string} [aiTool='claude-code'] - Ferramenta de IA selecionada
 * @param {object} [options]
 * @param {boolean} [options.keepClaudeDir=false] - Não remover .claude/ mesmo para outras ferramentas (multi-IDE)
 */
export async function cleanupSkillsStructure(projectDir, aiTool = 'claude-code', options = {}) {
  const { keepClaudeDir = false } = options;
  const resolved = resolveToolKey(aiTool);
  const claudeSkillsDir = path.join(projectDir, '.claude', 'skills');
  const agentsDir = path.join(projectDir, '.agents');
  const claudeSquadsDir = path.join(projectDir, '.claude', 'squads');

  // 1. Substituir symlinks por diretórios reais em .claude/skills/
  if (await fse.pathExists(claudeSkillsDir)) {
    const entries = await fse.readdir(claudeSkillsDir);
    for (const entry of entries) {
      const entryPath = path.join(claudeSkillsDir, entry);
      const stat = await fse.lstat(entryPath);
      if (stat.isSymbolicLink()) {
        const target = await fse.realpath(entryPath);
        await fse.remove(entryPath);
        await fse.copy(target, entryPath);
      }
    }
  }

  // 2. Converter skills para a ferramenta de IA escolhida
  if (resolved !== 'claude-code' && await fse.pathExists(claudeSkillsDir)) {
    await convertSkills(claudeSkillsDir, projectDir, resolved);
  }

  // 3. Converter rules
  const claudeRulesDir = path.join(projectDir, '.claude', 'rules');
  if (resolved !== 'claude-code' && await fse.pathExists(claudeRulesDir)) {
    await convertRules(claudeRulesDir, projectDir, resolved);
  }

  // 4. Converter project instructions (CLAUDE.md → GEMINI.md / AGENTS.md / etc.)
  await convertProjectInstructions(projectDir, resolved);

  // 5. Remover .agents/ da raiz (criado pelo npx skills add)
  if (await fse.pathExists(agentsDir)) {
    // Para ferramentas que usam .agents/ de alguma forma, verificar
    const toolPaths = getToolPaths(resolved);
    const usesAgentsDir = (toolPaths.skills && toolPaths.skills.startsWith('.agents'))
      || (toolPaths.agents && toolPaths.agents.startsWith('.agents'));

    if (!usesAgentsDir) {
      await fse.remove(agentsDir);
    }
  }

  // 6. Remover .claude/squads/ (squads ficam só em squads/)
  if (await fse.pathExists(claudeSquadsDir)) {
    await fse.remove(claudeSquadsDir);
  }

  // 7. Limpar diretório .claude/ se não for Claude Code (e não estiver em modo multi-IDE)
  if (resolved !== 'claude-code' && !keepClaudeDir) {
    const claudeDir = path.join(projectDir, '.claude');
    if (await fse.pathExists(claudeDir)) {
      await fse.remove(claudeDir);
    }
  }
}
