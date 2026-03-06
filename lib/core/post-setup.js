import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fse from 'fs-extra';
import { resolveCoreDir } from '../utils/platform.js';

const ENV_EXAMPLE_CONTENT = `# Synkra AIOS Environment Configuration
# Copy this file to .env and fill in your values

# ANTHROPIC_API_KEY=your-key-here
# GITHUB_TOKEN=your-token-here
`;

/**
 * Executa tarefas de pós-instalação do projeto AIOS.
 *
 * 1. npm install dentro de .aios-core/ (se existir package.json)
 * 2. git init (se ainda não for um repositório)
 * 3. git add -A && git commit (commit inicial)
 * 4. Cria .env.example com placeholders
 *
 * Nenhuma operação individual causa falha total — erros são reportados no retorno.
 *
 * @param {string} projectDir - Caminho absoluto do diretório do projeto
 * @param {object} [config] - Configuração do projeto (reservado para uso futuro)
 * @returns {Promise<{ gitInitialized: boolean, depsInstalled: boolean }>}
 */
export async function postSetup(projectDir, config = {}) {
  let depsInstalled = false;
  let gitInitialized = false;

  // 1. npm install dentro de .aios-core/
  depsInstalled = await installDependencies(projectDir);

  // 2. Cria .env.example
  await createEnvExample(projectDir);

  // 3. Inicializa repositório git e faz commit inicial
  gitInitialized = await initializeGit(projectDir);

  return { gitInitialized, depsInstalled };
}

/**
 * Executa npm install dentro de .aios-core/ se existir package.json.
 *
 * @param {string} projectDir
 * @returns {Promise<boolean>}
 */
async function installDependencies(projectDir) {
  const coreDirName = await resolveCoreDir(projectDir);
  const aiosCoreDir = path.join(projectDir, coreDirName);
  const packageJsonPath = path.join(aiosCoreDir, 'package.json');

  try {
    if (!(await fse.pathExists(packageJsonPath))) {
      return false;
    }

    const result = spawnSync('npm', ['install'], {
      cwd: aiosCoreDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    if (result.error || result.status !== 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Inicializa o repositório git e faz o commit inicial.
 *
 * @param {string} projectDir
 * @returns {Promise<boolean>}
 */
async function initializeGit(projectDir) {
  try {
    // Verifica se já é um repositório git
    const checkResult = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    const isAlreadyRepo = checkResult.status === 0;

    // git init (se necessário)
    if (!isAlreadyRepo) {
      const initResult = spawnSync('git', ['init'], {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });

      if (initResult.error || initResult.status !== 0) {
        return false;
      }
    }

    // git add -A
    const addResult = spawnSync('git', ['add', '-A'], {
      cwd: projectDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    if (addResult.error || addResult.status !== 0) {
      return false;
    }

    // git commit
    const commitResult = spawnSync(
      'git',
      ['commit', '-m', 'chore: bootstrap Synkra AIOS via create-aios-god-mode'],
      {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      }
    );

    if (commitResult.error || commitResult.status !== 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Cria o arquivo .env.example com conteúdo placeholder.
 *
 * @param {string} projectDir
 */
async function createEnvExample(projectDir) {
  const envExamplePath = path.join(projectDir, '.env.example');

  try {
    await fse.writeFile(envExamplePath, ENV_EXAMPLE_CONTENT, 'utf-8');
  } catch {
    // Não falha se não conseguir criar o arquivo
  }
}
