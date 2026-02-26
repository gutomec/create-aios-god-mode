import semver from 'semver';
import fse from 'fs-extra';

/**
 * Regex para nomes de projeto em kebab-case.
 * Deve começar com letra minúscula, seguida de letras, números ou hifens.
 */
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9-]*$/;

/** Limite máximo de caracteres para nomes de pacotes npm */
const NPM_NAME_MAX_LENGTH = 214;

/**
 * Valida o nome do projeto conforme regras npm e convenções AIOS.
 *
 * @param {string} name - Nome do projeto a validar
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateProjectName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Project name is required.' };
  }

  if (name.length > NPM_NAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `Project name must be ${NPM_NAME_MAX_LENGTH} characters or fewer (got ${name.length}).`,
    };
  }

  if (name.startsWith('-')) {
    return { valid: false, message: 'Project name cannot start with a hyphen.' };
  }

  if (name.endsWith('-')) {
    return { valid: false, message: 'Project name cannot end with a hyphen.' };
  }

  if (!KEBAB_CASE_REGEX.test(name)) {
    return {
      valid: false,
      message: 'Project name must be kebab-case (lowercase letters, numbers, and hyphens only, starting with a letter).',
    };
  }

  return { valid: true };
}

/**
 * Verifica se a versão atual do Node.js atende ao requisito mínimo.
 *
 * @param {string} required - Range semver requerido (default: '>=18.0.0')
 * @returns {boolean}
 */
export function validateNodeVersion(required = '>=18.0.0') {
  return semver.satisfies(process.version, required);
}

/**
 * Verifica se o diretório não existe ou está vazio.
 *
 * @param {string} dirPath - Caminho do diretório a verificar
 * @returns {Promise<boolean>} true se o diretório não existe ou está vazio
 */
export async function validateDirectoryEmpty(dirPath) {
  const exists = await fse.pathExists(dirPath);

  if (!exists) {
    return true;
  }

  const contents = await fse.readdir(dirPath);
  return contents.length === 0;
}

/**
 * Verifica se há acesso à rede tentando alcançar a API do GitHub.
 *
 * @returns {Promise<boolean>} true se a API está acessível
 */
export async function checkNetworkAccess() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.github.com', {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'create-aios-cli/1.0',
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
