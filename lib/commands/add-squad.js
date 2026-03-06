import path from 'node:path';
import ora from 'ora';
import chalk from 'chalk';
import fse from 'fs-extra';
import { printError } from '../ui/messages.js';
import { installSquad } from '../core/squad-installer.js';
import { resolveCoreConfigPath } from '../utils/platform.js';

/**
 * Comando add-squad: instala um squad adicional no projeto AIOS existente.
 *
 * @param {string} squadName - Nome/fonte do squad a instalar
 * @param {object} [options] - Reservado para uso futuro
 */
export async function addSquadCommand(squadName, options = {}) {
  const cwd = process.cwd();

  // 1. Detecta se estamos dentro de um projeto AIOS
  const configPath = await resolveCoreConfigPath(cwd);
  const isProject = await fse.pathExists(configPath);

  if (!isProject) {
    printError(
      'Not inside a Synkra AIOS project. ' +
      'Could not find core-config.yaml in the current directory.'
    );
    process.exit(1);
  }

  // 2. Instala o squad
  const spinner = ora(`Installing squad "${squadName}"...`).start();

  try {
    const result = await installSquad(squadName, cwd);

    if (result.success) {
      spinner.succeed(`Squad "${squadName}" installed successfully`);
      console.log('');
      console.log(
        chalk.dim('  Squad directory: ') +
        chalk.cyan(`squads/${squadName}/`)
      );
      console.log('');
    } else {
      spinner.fail(`Failed to install squad "${squadName}"`);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail(`Failed to install squad "${squadName}"`);
    printError(`Squad installation failed: ${error.message}`, error);
    process.exit(1);
  }
}
