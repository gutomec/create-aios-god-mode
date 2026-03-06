import { openSync, closeSync } from 'node:fs';
import path from 'node:path';

/**
 * Verifica se o sistema operacional é Windows.
 *
 * @returns {boolean}
 */
export function isWindows() {
  return process.platform === 'win32';
}

/**
 * Abre /dev/tty para leitura (necessário para prompts interativos quando
 * stdin está sendo usado como pipe).
 *
 * No Windows, retorna null pois /dev/tty não existe.
 *
 * @returns {number | null} File descriptor ou null em caso de falha
 */
export function getTtyFd() {
  if (isWindows()) {
    return null;
  }

  try {
    const fd = openSync('/dev/tty', 'r');
    return fd;
  } catch {
    return null;
  }
}

/**
 * Fecha o file descriptor do TTY, se não for null.
 *
 * @param {number | null} fd - File descriptor retornado por getTtyFd()
 */
export function closeTtyFd(fd) {
  if (fd !== null && fd !== undefined) {
    try {
      closeSync(fd);
    } catch {
      // Ignora erros ao fechar — o fd pode já ter sido fechado
    }
  }
}

/**
 * Resolve o caminho absoluto do diretório do projeto.
 *
 * @param {string} name - Nome do projeto
 * @param {string} [parentDir] - Diretório pai (default: cwd)
 * @returns {string} Caminho absoluto do diretório do projeto
 */
export function resolveProjectDir(name, parentDir) {
  return path.resolve(parentDir || process.cwd(), name);
}

/**
 * Resolve o diretório core do projeto (.aiox-core/ ou .aios-core/).
 *
 * O bootstrap tenta 'aiox-core' primeiro, criando '.aiox-core/'. Se não existir,
 * tenta '.aios-core/'. Retorna o nome do diretório que existe.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {Promise<string>} Nome do diretório core (e.g. '.aiox-core' ou '.aios-core')
 */
export async function resolveCoreDir(projectDir) {
  const { existsSync } = await import('node:fs');
  const candidates = ['.aiox-core', '.aios-core'];

  for (const dir of candidates) {
    if (existsSync(path.join(projectDir, dir))) {
      return dir;
    }
  }

  // Fallback: retorna .aios-core como padrão
  return '.aios-core';
}

/**
 * Resolve o caminho do core-config.yaml do projeto.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @returns {Promise<string>} Caminho absoluto do core-config.yaml
 */
export async function resolveCoreConfigPath(projectDir) {
  const coreDir = await resolveCoreDir(projectDir);
  return path.join(projectDir, coreDir, 'core-config.yaml');
}
