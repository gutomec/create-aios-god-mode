import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';

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
 * Definição de todas as skills do ecossistema.
 * Cada entrada especifica a fonte (repo GitHub) e opcionalmente o nome da skill.
 */
const SKILLS = [
  // Design & Frontend
  { source: 'nextlevelbuilder/ui-ux-pro-max-skill', name: 'ui-ux-pro-max' },
  { source: 'anthropics/skills', skill: 'frontend-design', name: 'frontend-design' },
  { source: 'vercel-labs/agent-skills', skill: 'web-design-guidelines', name: 'web-design-guidelines' },
  { source: 'vercel-labs/agent-skills', skill: 'vercel-react-best-practices', name: 'vercel-react-best-practices' },
  { source: 'vercel-labs/agent-skills', skill: 'vercel-composition-patterns', name: 'vercel-composition-patterns' },
  // SEO & Marketing
  { source: 'coreyhaines31/marketingskills', skill: 'seo-audit', name: 'seo-audit' },
  { source: 'coreyhaines31/marketingskills', skill: 'programmatic-seo', name: 'programmatic-seo' },
  { source: 'coreyhaines31/marketingskills', skill: 'schema-markup', name: 'schema-markup' },
  // CI/CD & Deploy
  { source: 'wshobson/agents', skill: 'github-actions-templates', name: 'github-actions-templates' },
  { source: 'wshobson/agents', skill: 'deployment-pipeline-design', name: 'deployment-pipeline-design' },
  // Payments
  { source: 'wshobson/agents', skill: 'stripe-integration', name: 'stripe-integration' },
  // Backend & Clean Code
  { source: 'wshobson/agents', skill: 'nodejs-backend-patterns', name: 'nodejs-backend-patterns' },
  { source: 'wshobson/agents', skill: 'api-design-principles', name: 'api-design-principles' },
  { source: 'wshobson/agents', skill: 'architecture-patterns', name: 'architecture-patterns' },
  { source: 'wshobson/agents', skill: 'error-handling-patterns', name: 'error-handling-patterns' },
  { source: 'ratacat/claude-skills', skill: 'clean-code', name: 'clean-code' },
  // Prompt Engineering
  { source: 'wshobson/agents', skill: 'prompt-engineering-patterns', name: 'prompt-engineering-patterns' },
  // Media (Video & Image)
  { source: 'inference-sh/skills', skill: 'ai-video-generation', name: 'ai-video-generation' },
  { source: 'inference-sh/skills', skill: 'ai-image-generation', name: 'ai-image-generation' },
  // Documents (PDF, DOCX, XLSX, PPTX)
  { source: 'anthropics/skills', skill: 'pdf', name: 'pdf' },
  { source: 'anthropics/skills', skill: 'docx', name: 'docx' },
  { source: 'anthropics/skills', skill: 'xlsx', name: 'xlsx' },
  { source: 'anthropics/skills', skill: 'pptx', name: 'pptx' },
];

/**
 * Configura os MCP servers no arquivo .mcp.json do projeto.
 *
 * Faz merge com configuração existente se o arquivo já existir.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {Promise<number>} Número de MCPs configurados
 */
export async function configureMcps(projectDir) {
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

  return Object.keys(MCP_CONFIG.mcpServers).length;
}

/**
 * Instala uma única skill via `npx skills add`.
 *
 * @param {object} skillDef - Definição da skill (source, skill?, name)
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {{ success: boolean, name: string, error?: string }}
 */
function installSingleSkill(skillDef, projectDir) {
  try {
    const args = ['skills', 'add', skillDef.source, '-y'];
    if (skillDef.skill) {
      args.push('--skill', skillDef.skill);
    }

    const result = spawnSync('npx', args, {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      timeout: 120_000,
    });

    return {
      success: result.status === 0,
      name: skillDef.name,
      error: result.status !== 0 ? `Exit code ${result.status}` : undefined,
    };
  } catch (err) {
    return {
      success: false,
      name: skillDef.name,
      error: err.message,
    };
  }
}

/**
 * Instala todas as skills do ecossistema sequencialmente.
 *
 * Não falha em erros individuais — coleta e retorna todos os resultados.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {function} [onProgress] - Callback: (index, total, skillName) => void
 * @returns {Promise<Array<{ success: boolean, name: string, error?: string }>>}
 */
export async function installSkills(projectDir, onProgress) {
  const results = [];

  for (let i = 0; i < SKILLS.length; i++) {
    const skillDef = SKILLS[i];

    if (typeof onProgress === 'function') {
      onProgress(i, SKILLS.length, skillDef.name);
    }

    const result = installSingleSkill(skillDef, projectDir);
    results.push(result);
  }

  return results;
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
 * Instala o cc-deploy (VPS Deploy) como skill global.
 *
 * @returns {Promise<boolean>} true se instalado com sucesso
 */
export async function installCcDeploy() {
  try {
    const result = spawnSync(
      'bash',
      ['-c', 'curl -fsSL https://raw.githubusercontent.com/saadnvd1/cc-deploy/main/install.sh | bash'],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
        timeout: 120_000,
      }
    );

    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Corrige a estrutura de diretórios após instalação de skills.
 *
 * O `npx skills add` cria arquivos em `.agents/skills/` e symlinks em `.claude/skills/`.
 * Esta função substitui os symlinks por diretórios reais, remove `.agents/` da raiz
 * e remove `.claude/squads/` (squads ficam somente em `squads/`).
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 */
export async function cleanupSkillsStructure(projectDir) {
  const claudeSkillsDir = path.join(projectDir, '.claude', 'skills');
  const agentsDir = path.join(projectDir, '.agents');
  const claudeSquadsDir = path.join(projectDir, '.claude', 'squads');

  // 1. Substituir symlinks por diretórios reais
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

  // 2. Remover .agents/ da raiz
  if (await fse.pathExists(agentsDir)) {
    await fse.remove(agentsDir);
  }

  // 3. Remover .claude/squads/ (squads ficam só em squads/)
  if (await fse.pathExists(claudeSquadsDir)) {
    await fse.remove(claudeSquadsDir);
  }
}

/**
 * Retorna o total de skills configuradas.
 *
 * @returns {number}
 */
export function getSkillCount() {
  return SKILLS.length;
}
