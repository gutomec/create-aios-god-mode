import fse from 'fs-extra';
import path from 'node:path';
import { getToolPaths, resolveToolKey } from './tool-paths.js';

/**
 * Converte skills do formato Claude Code para a ferramenta de IA selecionada.
 *
 * - Claude Code: skills já estão em .claude/skills/ — nada a fazer
 * - Codex: copia para .codex/skills/<nome>/, gera agents/openai.yaml por skill
 * - Outras: copia para o diretório correto da ferramenta
 *
 * @param {string} sourceDir - Diretório fonte das skills (.claude/skills/)
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} aiTool - Ferramenta de IA selecionada
 * @returns {Promise<string|null>} Path do diretório de destino ou null se não suporta skills
 */
export async function convertSkills(sourceDir, projectDir, aiTool) {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);

  if (!toolPaths.skills) {
    // Ferramenta não suporta skills (ex: github-copilot, antigravity)
    return null;
  }

  const targetDir = path.join(projectDir, toolPaths.skills);

  if (resolved === 'claude-code') {
    // Claude Code: skills já estão no lugar certo
    return targetDir;
  }

  // Copiar para o diretório correto
  if (await fse.pathExists(sourceDir)) {
    await fse.ensureDir(targetDir);
    await fse.copy(sourceDir, targetDir);

    // Codex: gerar agents/openai.yaml dentro de cada skill
    if (resolved === 'codex') {
      await generateCodexAgentYamls(targetDir);
    }
  }

  return targetDir;
}

/**
 * Gera agents/openai.yaml dentro de cada skill para compatibilidade com Codex.
 *
 * Codex espera a estrutura:
 *   .codex/skills/<nome>/SKILL.md
 *   .codex/skills/<nome>/agents/openai.yaml
 *
 * O openai.yaml referencia o SKILL.md da mesma skill.
 *
 * @param {string} skillsDir - Diretório base das skills (.codex/skills/)
 */
async function generateCodexAgentYamls(skillsDir) {
  const entries = await fse.readdir(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(skillsDir, entry.name);
    const skillMd = path.join(skillDir, 'SKILL.md');
    const agentsDir = path.join(skillDir, 'agents');
    const yamlPath = path.join(agentsDir, 'openai.yaml');

    // Só gera se existe SKILL.md e ainda não existe openai.yaml
    if (!(await fse.pathExists(skillMd)) || await fse.pathExists(yamlPath)) {
      continue;
    }

    // Extrair name e description do frontmatter do SKILL.md
    const content = await fse.readFile(skillMd, 'utf-8');
    const { name, description } = parseSkillFrontmatter(content, entry.name);

    const yaml = [
      `name: "${name}"`,
      `description: "${description}"`,
      `instructions: |`,
      `  Follow all instructions in SKILL.md located at .codex/skills/${entry.name}/SKILL.md`,
      `  Read and execute the skill exactly as documented.`,
      `tools:`,
      `  - type: file_search`,
      `  - type: code_interpreter`,
    ].join('\n') + '\n';

    await fse.ensureDir(agentsDir);
    await fse.writeFile(yamlPath, yaml, 'utf-8');
  }
}

/**
 * Extrai name e description do frontmatter YAML de um SKILL.md.
 *
 * @param {string} content - Conteúdo do SKILL.md
 * @param {string} fallbackName - Nome fallback (nome do diretório)
 * @returns {{ name: string, description: string }}
 */
function parseSkillFrontmatter(content, fallbackName) {
  let name = fallbackName;
  let description = `Skill: ${fallbackName}`;

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const yaml = fmMatch[1];
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '');

    const descMatch = yaml.match(/^description:\s*(.+)$/m);
    if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '');
  }

  // Escapar aspas duplas para segurança no YAML gerado
  name = name.replace(/"/g, '\\"');
  description = description.replace(/"/g, '\\"');

  return { name, description };
}

/**
 * Converte a configuração MCP do formato Claude Code para a ferramenta selecionada.
 *
 * - Claude Code: .mcp.json (JSON)
 * - Gemini: global only — emite aviso
 * - Antigravity: global only — emite aviso
 * - GitHub Copilot: não suporta MCP per-project — emite aviso
 * - Codex: .codex/config.toml [mcp_servers.*] (TOML)
 * - Cursor: .cursor/mcp.json (JSON, formato similar a Claude Code)
 *
 * @param {object} mcpConfig - Configuração MCP em formato Claude Code
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} aiTool - Ferramenta de IA selecionada
 * @returns {Promise<{ written: boolean, path: string|null, warning: string|null }>}
 */
export async function convertMcpConfig(mcpConfig, projectDir, aiTool) {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);

  if (resolved === 'claude-code') {
    const mcpPath = path.join(projectDir, toolPaths.mcp);
    await fse.writeJson(mcpPath, mcpConfig, { spaces: 2 });
    return { written: true, path: mcpPath, warning: null };
  }

  if (resolved === 'gemini' || resolved === 'antigravity') {
    return {
      written: false,
      path: null,
      warning: `${resolved} não suporta MCP per-project. Configure manualmente no diretório global.`,
    };
  }

  if (resolved === 'github-copilot') {
    return {
      written: false,
      path: null,
      warning: 'GitHub Copilot não suporta MCP per-project. Configure manualmente nas settings do VS Code.',
    };
  }

  if (resolved === 'codex') {
    // Codex: converter JSON → TOML no .codex/config.toml
    const configDir = path.join(projectDir, '.codex');
    await fse.ensureDir(configDir);
    const configPath = path.join(configDir, 'config.toml');

    let toml = '';
    const servers = mcpConfig.mcpServers || {};
    for (const [name, config] of Object.entries(servers)) {
      toml += `[mcp_servers.${name}]\n`;
      if (config.command) toml += `command = "${config.command}"\n`;
      if (config.args) toml += `args = [${config.args.map((a) => `"${a}"`).join(', ')}]\n`;
      if (config.env) {
        toml += `[mcp_servers.${name}.env]\n`;
        for (const [k, v] of Object.entries(config.env)) {
          toml += `${k} = "${v}"\n`;
        }
      }
      toml += '\n';
    }

    // Merge com config.toml existente se houver
    let existingContent = '';
    if (await fse.pathExists(configPath)) {
      existingContent = await fse.readFile(configPath, 'utf-8');
    }
    await fse.writeFile(configPath, existingContent + toml, 'utf-8');
    return { written: true, path: configPath, warning: null };
  }

  if (resolved === 'cursor') {
    // Cursor: .cursor/mcp.json (formato similar a Claude Code)
    const cursorDir = path.join(projectDir, '.cursor');
    await fse.ensureDir(cursorDir);
    const mcpPath = path.join(cursorDir, 'mcp.json');
    await fse.writeJson(mcpPath, mcpConfig, { spaces: 2 });
    return { written: true, path: mcpPath, warning: null };
  }

  // Fallback: escreve como Claude Code
  const mcpPath = path.join(projectDir, '.mcp.json');
  await fse.writeJson(mcpPath, mcpConfig, { spaces: 2 });
  return { written: true, path: mcpPath, warning: null };
}

/**
 * Converte CLAUDE.md para o nome de instruções da ferramenta selecionada.
 * Para Codex: também appenda a lista de "Available skills" no AGENTS.md.
 *
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} aiTool - Ferramenta de IA selecionada
 */
export async function convertProjectInstructions(projectDir, aiTool) {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);
  const claudeMd = path.join(projectDir, 'CLAUDE.md');
  const targetName = toolPaths.instructions;

  if (resolved === 'claude-code' || targetName === 'CLAUDE.md') {
    return; // Nada a fazer
  }

  const targetPath = path.join(projectDir, targetName);

  if (await fse.pathExists(claudeMd)) {
    // Garantir que o diretório pai existe (ex: .github/copilot-instructions.md)
    await fse.ensureDir(path.dirname(targetPath));
    await fse.copy(claudeMd, targetPath);
    // Manter CLAUDE.md original se AGENTS.md for o target (Codex/Cursor/Antigravity suportam ambos)
    if (targetName !== 'AGENTS.md') {
      await fse.remove(claudeMd);
    }
  }

  // Codex: appendar lista de skills disponíveis no AGENTS.md
  if (resolved === 'codex' && toolPaths.skills) {
    await appendCodexSkillsList(projectDir, toolPaths.skills, targetPath);
  }
}

/**
 * Appenda uma seção "Available skills" no AGENTS.md do Codex,
 * listando todas as skills instaladas em .codex/skills/ com seus paths.
 *
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} skillsRelPath - Path relativo das skills (ex: '.codex/skills')
 * @param {string} agentsMdPath - Path absoluto do AGENTS.md
 */
async function appendCodexSkillsList(projectDir, skillsRelPath, agentsMdPath) {
  const skillsDir = path.join(projectDir, skillsRelPath);

  if (!(await fse.pathExists(skillsDir))) {
    return;
  }

  const entries = await fse.readdir(skillsDir, { withFileTypes: true });
  const skillEntries = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (!(await fse.pathExists(skillMd))) continue;

    // Extrair description do frontmatter
    const content = await fse.readFile(skillMd, 'utf-8');
    const { name, description } = parseSkillFrontmatter(content, entry.name);
    skillEntries.push({ name, description, dir: entry.name });
  }

  if (skillEntries.length === 0) {
    return;
  }

  // Montar seção markdown
  let section = '\n\n---\n\n## Available Skills\n\n';
  section += '| Skill | Path | Description |\n';
  section += '|-------|------|-------------|\n';

  for (const s of skillEntries) {
    section += `| \`${s.name}\` | \`${skillsRelPath}/${s.dir}/SKILL.md\` | ${s.description} |\n`;
  }

  section += '\nTo use a skill, read the SKILL.md file at the path indicated above.\n';

  // Appendar no AGENTS.md
  await fse.ensureDir(path.dirname(agentsMdPath));
  let existing = '';
  if (await fse.pathExists(agentsMdPath)) {
    existing = await fse.readFile(agentsMdPath, 'utf-8');
  }

  // Evitar duplicação: não appendar se já tem a seção
  if (!existing.includes('## Available Skills')) {
    await fse.writeFile(agentsMdPath, existing + section, 'utf-8');
  }
}

/**
 * Converte rules de Claude Code para o formato da ferramenta.
 *
 * - Claude Code → Gemini: paths: → globs: (plain markdown com frontmatter convertido)
 * - Claude Code → Codex: Codex não usa rules dir — ignorar
 * - Claude Code → Cursor: paths: → globs: + alwaysApply: (.mdc format)
 * - Claude Code → GitHub Copilot: sem suporte a rules — ignorar
 * - Claude Code → Antigravity: copiar para .antigravity/rules/
 *
 * @param {string} sourceDir - Diretório fonte (.claude/rules/)
 * @param {string} projectDir - Diretório raiz do projeto
 * @param {string} aiTool - Ferramenta de IA selecionada
 */
export async function convertRules(sourceDir, projectDir, aiTool) {
  const resolved = resolveToolKey(aiTool);

  if (resolved === 'claude-code' || !(await fse.pathExists(sourceDir))) {
    return;
  }

  const toolPaths = getToolPaths(resolved);

  // Ferramentas sem suporte a rules
  if (!toolPaths.rules) {
    return;
  }

  const targetDir = path.join(projectDir, toolPaths.rules);
  await fse.ensureDir(targetDir);

  const entries = await fse.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;

    const content = await fse.readFile(path.join(sourceDir, entry.name), 'utf-8');

    if (resolved === 'gemini') {
      // Gemini: converter paths: → globs: (regras são plain markdown com frontmatter)
      const converted = convertClaudeToGeminiRule(content);
      await fse.writeFile(path.join(targetDir, entry.name), converted, 'utf-8');
    } else if (resolved === 'cursor') {
      // Cursor: converter paths: → globs: + adicionar alwaysApply: (.mdc format)
      const converted = convertClaudeToCursorRule(content);
      const mdcName = entry.name.replace('.md', '.mdc');
      await fse.writeFile(path.join(targetDir, mdcName), converted, 'utf-8');
    } else if (resolved === 'antigravity') {
      // Antigravity: copiar para .antigravity/rules/
      const converted = convertClaudeToGeminiRule(content);
      await fse.writeFile(path.join(targetDir, entry.name), converted, 'utf-8');
    }
    // codex e github-copilot: já retornaram acima (rules === null)
  }
}

/**
 * Converte frontmatter de rule Claude Code → Gemini/Antigravity.
 * Claude usa paths:, Gemini usa globs: ou plain markdown.
 *
 * @param {string} content - Conteúdo da rule em formato Claude Code
 * @returns {string} Conteúdo convertido
 */
function convertClaudeToGeminiRule(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) return content; // Sem frontmatter, retorna como está

  const yaml = fmMatch[1];
  const body = fmMatch[2];

  // Extrair paths: do Claude Code
  const pathsMatch = yaml.match(/^paths:\s*(.+)$/m);
  if (!pathsMatch) return content; // Sem paths:, retorna como está

  const pathsValue = pathsMatch[1].trim();

  // Converter para formato Gemini
  return `---\nglobs: ${pathsValue}\nalwaysApply: false\n---\n${body}`;
}

/**
 * Converte frontmatter de rule Claude Code → Cursor (.mdc format).
 * Claude usa paths:, Cursor usa globs: + alwaysApply: + description:.
 *
 * @param {string} content - Conteúdo da rule em formato Claude Code
 * @returns {string} Conteúdo convertido para Cursor (.mdc)
 */
function convertClaudeToCursorRule(content) {
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    // Sem frontmatter = always-on no Claude = alwaysApply: true no Cursor
    return `---\nalwaysApply: true\n---\n${content}`;
  }

  const yaml = fmMatch[1];
  const body = fmMatch[2];

  const pathsMatch = yaml.match(/^paths:\s*(.+)$/m);
  if (!pathsMatch) {
    return `---\nalwaysApply: true\n---\n${body}`;
  }

  const pathsValue = pathsMatch[1].trim();
  return `---\nglobs: ${pathsValue}\nalwaysApply: false\n---\n${body}`;
}
