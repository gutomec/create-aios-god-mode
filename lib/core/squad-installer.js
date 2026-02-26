import { spawnSync } from 'node:child_process';
import { getTtyFd, closeTtyFd } from '../utils/platform.js';

/**
 * Instala um único squad no projeto via `npx squads add`.
 *
 * @param {string} squadSource - Nome/fonte do squad (ex: "aios-forge-squad")
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {Promise<{ success: boolean, squadName: string }>}
 * @throws {Error} Se o comando falhar
 */
export async function installSquad(squadSource, projectDir) {
  let stdinFd = null;

  try {
    stdinFd = getTtyFd();
    const stdinOption = stdinFd !== null ? stdinFd : 'inherit';

    const result = spawnSync(
      'npx',
      ['squads', 'add', squadSource, '--aios', 'existing', '--aios-path', '.'],
      {
        cwd: projectDir,
        stdio: [stdinOption, 'inherit', 'inherit'],
        shell: true,
      }
    );

    if (result.error) {
      throw new Error(
        `Failed to execute 'npx squads add ${squadSource}': ${result.error.message}`
      );
    }

    if (result.status !== 0) {
      throw new Error(
        `'npx squads add ${squadSource}' exited with code ${result.status}`
      );
    }

    return { success: true, squadName: squadSource };
  } finally {
    closeTtyFd(stdinFd);
  }
}

/**
 * Instala múltiplos squads sequencialmente, reportando progresso.
 *
 * Não falha em erros individuais — coleta e retorna todos os resultados.
 *
 * @param {string[]} squads - Lista de nomes/fontes dos squads
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {function} [onProgress] - Callback de progresso: (index, total, squadName) => void
 * @returns {Promise<Array<{ success: boolean, squadName: string, error?: string }>>}
 */
export async function installSquads(squads, projectDir, onProgress) {
  const results = [];

  for (let i = 0; i < squads.length; i++) {
    const squadSource = squads[i];

    if (typeof onProgress === 'function') {
      onProgress(i, squads.length, squadSource);
    }

    try {
      const result = await installSquad(squadSource, projectDir);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        squadName: squadSource,
        error: error.message,
      });
    }
  }

  return results;
}
