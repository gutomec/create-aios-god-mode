import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { getTtyFd, closeTtyFd } from '../utils/platform.js';

/**
 * Executa `npx aios-core init` para inicializar a estrutura do projeto AIOS.
 *
 * Abre /dev/tty para stdin quando disponível (necessário para prompts interativos
 * do aios-core init). No Windows, usa 'inherit' como fallback.
 *
 * @param {string} projectName - Nome do projeto a ser criado
 * @param {string} [parentDir] - Diretório pai onde o projeto será criado (default: cwd)
 * @returns {string} Caminho absoluto do diretório do projeto criado
 * @throws {Error} Se o comando falhar ou retornar código de saída diferente de zero
 */
export async function bootstrapAios(projectName, parentDir) {
  const cwd = parentDir || process.cwd();
  const projectDir = path.resolve(cwd, projectName);

  let stdinFd = null;

  try {
    // Abre TTY para input interativo (necessário quando stdin é pipe)
    stdinFd = getTtyFd();

    const stdinOption = stdinFd !== null ? stdinFd : 'inherit';

    const result = spawnSync('npx', ['aios-core', 'init', projectName], {
      cwd,
      stdio: [stdinOption, 'inherit', 'inherit'],
      shell: true,
    });

    if (result.error) {
      throw new Error(
        `Failed to execute 'npx aios-core init': ${result.error.message}. ` +
        `Ensure npx is available and you have network access.`
      );
    }

    if (result.status !== 0) {
      throw new Error(
        `'npx aios-core init ${projectName}' exited with code ${result.status}. ` +
        `Check the output above for details.`
      );
    }
  } finally {
    closeTtyFd(stdinFd);
  }

  // Garante que core-config.yaml tenha campo 'version' no nível raiz
  // O CLI squads exige isso para validar o projeto AIOS
  await ensureRootVersion(projectDir);

  return projectDir;
}

/**
 * Garante que core-config.yaml tenha um campo 'version' no nível raiz.
 *
 * O aios-core init coloca version dentro de 'project.version', mas o CLI squads
 * espera um 'version:' top-level. Adiciona se não existir.
 *
 * @param {string} projectDir - Caminho absoluto do projeto
 */
async function ensureRootVersion(projectDir) {
  const configPath = path.join(projectDir, '.aios-core', 'core-config.yaml');

  try {
    if (!(await fse.pathExists(configPath))) return;

    let content = await fse.readFile(configPath, 'utf-8');

    // Verifica se já tem 'version:' no nível raiz (sem indentação)
    if (/^version:\s/m.test(content)) return;

    // Extrai version de project.version se existir
    const projectVersionMatch = content.match(/^\s+version:\s*(.+)$/m);
    const version = projectVersionMatch
      ? projectVersionMatch[1].trim().replace(/^['"]|['"]$/g, '')
      : '1.0.0';

    // Adiciona version no topo do arquivo
    content = `version: '${version}'\n${content}`;
    await fse.writeFile(configPath, content, 'utf-8');
  } catch {
    // Não falha se não conseguir atualizar — squads reportará o erro
  }
}
