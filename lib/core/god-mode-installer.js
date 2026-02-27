import path from 'node:path';
import fse from 'fs-extra';
import { downloadTemplate, cleanupTemp } from '../utils/download.js';
import { getToolPaths } from '../utils/tool-paths.js';

const GOD_MODE_OWNER = 'gutomec';
const GOD_MODE_REPO = 'aios-god-mode-template';
const VERSION_FILE = '.version';

/**
 * Faz download e instala o template God Mode no projeto.
 *
 * Estrutura de cópia:
 *   template/skills/aios-god-mode/ → .claude/skills/aios-god-mode/
 *   template/rules/               → .claude/rules/ (merge, sem sobrescrever existentes)
 *   template/config/              → tratado separadamente (merge de settings.json)
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {object} [options]
 * @param {string} [options.tag] - Tag específica da release (default: 'latest')
 * @param {string} [options.aiTool] - Ferramenta de IA selecionada (default: 'claude')
 * @returns {Promise<{ version: string, filesInstalled: number }>}
 */
export async function installGodMode(projectDir, options = {}) {
  const { tag = 'latest', aiTool = 'claude' } = options;
  const toolPaths = getToolPaths(aiTool);
  let tmpDir = null;
  let filesInstalled = 0;

  try {
    // Download e extração do template
    tmpDir = await downloadTemplate(GOD_MODE_OWNER, GOD_MODE_REPO, tag);

    // Lê informações de versão do template
    let version = 'unknown';
    const templateJsonPath = path.join(tmpDir, 'template.json');

    if (await fse.pathExists(templateJsonPath)) {
      const templateInfo = await fse.readJson(templateJsonPath);
      version = templateInfo.version || version;
    }

    // Garante que o diretório base existe (para Claude é .claude/, para outros varia)
    const skillsBaseDir = path.join(projectDir, toolPaths.skills);
    await fse.ensureDir(skillsBaseDir);

    // 1. Copia skills/aios-god-mode/
    const skillsSrc = path.join(tmpDir, 'template', 'skills', 'aios-god-mode');
    const skillsDest = path.join(projectDir, toolPaths.skills, 'aios-god-mode');

    if (await fse.pathExists(skillsSrc)) {
      await fse.copy(skillsSrc, skillsDest);
      filesInstalled += await countFiles(skillsDest);
    }

    // 2. Copia rules/ (merge: não sobrescreve arquivos existentes)
    const rulesSrc = path.join(tmpDir, 'template', 'rules');
    const rulesDest = path.join(projectDir, toolPaths.rules);

    if (await fse.pathExists(rulesSrc)) {
      await fse.ensureDir(rulesDest);
      const ruleFiles = await fse.readdir(rulesSrc);

      for (const file of ruleFiles) {
        const srcFile = path.join(rulesSrc, file);
        const destFile = path.join(rulesDest, file);
        const stat = await fse.stat(srcFile);

        if (stat.isFile()) {
          // Não sobrescreve arquivos existentes
          await fse.copy(srcFile, destFile, { overwrite: false });
          filesInstalled++;
        }
      }
    }

    // 3. Copia config/ (tratamento especial para settings.json)
    // Config sempre vai para .claude/ pois é configuração do Claude Code
    const configSrc = path.join(tmpDir, 'template', 'config');
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
    const versionFilePath = path.join(skillsDest, VERSION_FILE);
    await fse.ensureDir(path.dirname(versionFilePath));
    await fse.writeFile(versionFilePath, version, 'utf-8');

    return { version, filesInstalled };
  } finally {
    // Limpa diretório temporário
    if (tmpDir) {
      await cleanupTemp(tmpDir);
    }
  }
}

/**
 * Retorna a versão do God Mode instalada no projeto, se existir.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {string} [aiTool='claude'] - Ferramenta de IA selecionada
 * @returns {Promise<string | null>} Versão instalada ou null
 */
export async function getInstalledGodModeVersion(projectDir, aiTool = 'claude') {
  const toolPaths = getToolPaths(aiTool);
  const versionFilePath = path.join(
    projectDir,
    toolPaths.skills,
    'aios-god-mode',
    VERSION_FILE
  );

  try {
    if (await fse.pathExists(versionFilePath)) {
      const version = await fse.readFile(versionFilePath, 'utf-8');
      return version.trim();
    }
  } catch {
    // Arquivo de versão corrompido ou inacessível
  }

  return null;
}

/**
 * Faz merge de settings.json do template com o existente no projeto.
 * Campos do template são adicionados, mas campos existentes não são sobrescritos.
 *
 * @param {string} srcPath - Caminho do settings.json do template
 * @param {string} destPath - Caminho do settings.json do projeto
 */
async function mergeSettingsJson(srcPath, destPath) {
  const srcSettings = await fse.readJson(srcPath);

  if (await fse.pathExists(destPath)) {
    const destSettings = await fse.readJson(destPath);
    // Merge superficial: campos do template são adicionados apenas se não existem
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
