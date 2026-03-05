import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fse from 'fs-extra';
import { getToolPaths, resolveToolKey } from '../utils/tool-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, '..', 'template');
const TEMPLATE_JSON = path.join(__dirname, '..', 'template.json');
const VERSION_FILE = '.version';

/**
 * Instala o template God Mode no projeto a partir de arquivos locais.
 *
 * Estrutura de cópia:
 *   template/skills/aios-god-mode/ → {skills}/aios-god-mode/
 *   template/rules/               → {rules}/ (merge, sem sobrescrever existentes)
 *   template/config/              → tratado separadamente (merge de settings.json)
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {object} [options]
 * @param {string} [options.aiTool] - Ferramenta de IA selecionada (default: 'claude-code')
 * @returns {Promise<{ version: string, filesInstalled: number }>}
 */
export async function installGodMode(projectDir, options = {}) {
  const { aiTool = 'claude-code' } = options;
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);
  let filesInstalled = 0;

  // Lê informações de versão do template
  let version = 'unknown';
  if (await fse.pathExists(TEMPLATE_JSON)) {
    const templateInfo = await fse.readJson(TEMPLATE_JSON);
    version = templateInfo.version || version;
  }

  // Garante que o diretório base de skills existe (se a ferramenta suporta)
  const skillsPath = toolPaths.skills;
  let skillsBaseDir = null;
  if (skillsPath) {
    skillsBaseDir = path.join(projectDir, skillsPath);
    await fse.ensureDir(skillsBaseDir);
  }

  // 1. Copia skills do template
  const templateSkillsDir = path.join(TEMPLATE_DIR, 'skills');
  if (skillsBaseDir && await fse.pathExists(templateSkillsDir)) {
    const skillDirs = await fse.readdir(templateSkillsDir, { withFileTypes: true });
    for (const dir of skillDirs) {
      if (!dir.isDirectory()) continue;
      const skillSrc = path.join(templateSkillsDir, dir.name);
      const skillDest = path.join(skillsBaseDir, dir.name);
      await fse.copy(skillSrc, skillDest);
      filesInstalled += await countFiles(skillDest);
    }
  }

  // 2. Copia rules/ (merge: não sobrescreve arquivos existentes)
  if (toolPaths.rules) {
    const rulesSrc = path.join(TEMPLATE_DIR, 'rules');
    const rulesDest = path.join(projectDir, toolPaths.rules);

    if (await fse.pathExists(rulesSrc)) {
      await fse.ensureDir(rulesDest);
      const ruleFiles = await fse.readdir(rulesSrc);

      for (const file of ruleFiles) {
        const srcFile = path.join(rulesSrc, file);
        const destFile = path.join(rulesDest, file);
        const stat = await fse.stat(srcFile);

        if (stat.isFile()) {
          await fse.copy(srcFile, destFile, { overwrite: false });
          filesInstalled++;
        }
      }
    }
  }

  // 3. Copia config/ (tratamento especial para settings.json)
  const configSrc = path.join(TEMPLATE_DIR, 'config');
  const configDestDir = path.join(projectDir, '.claude');
  await fse.ensureDir(configDestDir);

  if (await fse.pathExists(configSrc)) {
    const configFiles = await fse.readdir(configSrc);

    for (const file of configFiles) {
      const srcFile = path.join(configSrc, file);
      const stat = await fse.stat(srcFile);

      if (!stat.isFile()) continue;

      if (file === 'settings.json') {
        await mergeSettingsJson(srcFile, path.join(configDestDir, 'settings.json'));
      } else {
        await fse.copy(srcFile, path.join(configDestDir, file), { overwrite: false });
      }

      filesInstalled++;
    }
  }

  // Salva arquivo de versão para futuras verificações
  const versionDir = skillsBaseDir
    ? path.join(skillsBaseDir, 'aios-god-mode')
    : path.join(projectDir, '.claude', 'skills', 'aios-god-mode');
  const versionFilePath = path.join(versionDir, VERSION_FILE);
  await fse.ensureDir(path.dirname(versionFilePath));
  await fse.writeFile(versionFilePath, version, 'utf-8');

  return { version, filesInstalled };
}

/**
 * Retorna a versão do God Mode instalada no projeto, se existir.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {string} [aiTool='claude-code'] - Ferramenta de IA selecionada
 * @returns {Promise<string | null>} Versão instalada ou null
 */
export async function getInstalledGodModeVersion(projectDir, aiTool = 'claude-code') {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);

  const skillsBase = toolPaths.skills || '.claude/skills';
  const candidates = [
    path.join(projectDir, skillsBase, 'aios-god-mode', VERSION_FILE),
    path.join(projectDir, skillsBase, 'aiox-god-mode', VERSION_FILE),
  ];

  for (const versionFilePath of candidates) {
    try {
      if (await fse.pathExists(versionFilePath)) {
        const version = await fse.readFile(versionFilePath, 'utf-8');
        return version.trim();
      }
    } catch {
      // Arquivo de versão corrompido ou inacessível
    }
  }

  return null;
}

/**
 * Faz merge de settings.json do template com o existente no projeto.
 *
 * @param {string} srcPath - Caminho do settings.json do template
 * @param {string} destPath - Caminho do settings.json do projeto
 */
async function mergeSettingsJson(srcPath, destPath) {
  const srcSettings = await fse.readJson(srcPath);

  if (await fse.pathExists(destPath)) {
    const destSettings = await fse.readJson(destPath);
    const merged = { ...srcSettings, ...destSettings };
    await fse.writeJson(destPath, merged, { spaces: 2 });
  } else {
    await fse.copy(srcPath, destPath);
  }
}

/**
 * Conta recursivamente o número de arquivos em um diretório.
 *
 * @param {string} dirPath - Caminho do diretório
 * @returns {Promise<number>}
 */
async function countFiles(dirPath) {
  let count = 0;

  if (!(await fse.pathExists(dirPath))) {
    return count;
  }

  const entries = await fse.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      count++;
    } else if (entry.isDirectory()) {
      count += await countFiles(path.join(dirPath, entry.name));
    }
  }

  return count;
}
