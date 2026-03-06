import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import chalk from 'chalk';
import fse from 'fs-extra';
import semver from 'semver';
import { printError } from '../ui/messages.js';
import { getInstalledGodModeVersion, installGodMode } from '../core/god-mode-installer.js';
import { resolveCoreConfigPath } from '../utils/platform.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_JSON = path.join(__dirname, '..', 'template.json');

/**
 * Comando update: verifica e aplica atualizações ao God Mode do projeto AIOS.
 *
 * Compara a versão instalada com a versão bundled no CLI
 * e atualiza se houver versão mais nova.
 *
 * @param {object} [options]
 */
export async function updateCommand(options = {}) {
  const cwd = process.cwd();

  // 1. Detecta se estamos dentro de um projeto AIOS
  const configPath = await resolveCoreConfigPath(cwd);
  const isAiosProject = await fse.pathExists(configPath);

  if (!isAiosProject) {
    printError(
      'Not inside a Synkra AIOS project. ' +
      'Could not find core-config.yaml in the current directory.'
    );
    process.exit(1);
  }

  // 2. Verifica versão atual do God Mode
  const currentVersion = await getInstalledGodModeVersion(cwd);

  if (currentVersion) {
    console.log(chalk.dim(`Current God Mode version: v${currentVersion}`));
  } else {
    console.log(chalk.dim('No God Mode version detected (first install or missing version file)'));
  }

  // 3. Lê versão bundled do template
  const spinner = ora('Checking for updates...').start();

  let bundledVersion = null;

  try {
    if (await fse.pathExists(TEMPLATE_JSON)) {
      const templateInfo = await fse.readJson(TEMPLATE_JSON);
      bundledVersion = templateInfo.version || null;
    }

    if (!bundledVersion) {
      spinner.warn('Could not determine bundled template version');
      return;
    }

    spinner.text = `Bundled template version: v${bundledVersion}`;

    // 4. Compara versões
    const needsUpdate = !currentVersion || !semver.valid(currentVersion) || !semver.valid(bundledVersion)
      ? currentVersion !== bundledVersion
      : semver.gt(bundledVersion, currentVersion);

    if (!needsUpdate) {
      spinner.succeed(`Already up to date ${chalk.dim(`(v${currentVersion})`)}`);
      return;
    }

    spinner.info(
      `Update available: ${chalk.dim(`v${currentVersion || 'unknown'}`)} → ${chalk.green(`v${bundledVersion}`)}`
    );

    // 5. Instala a versão bundled
    const installSpinner = ora('Installing update...').start();

    try {
      const { version, filesInstalled } = await installGodMode(cwd);

      installSpinner.succeed(
        `God Mode updated to v${version} ${chalk.dim(`(${filesInstalled} files)`)}`
      );

      console.log('');
      console.log(chalk.green('\u2713') + ' Update complete!');
      console.log('');
      console.log('  Updated components:');
      console.log(`    ${chalk.cyan('God Mode')} v${currentVersion || 'unknown'} → v${version}`);
      console.log('');
      console.log(chalk.dim('  Tip: Run `npx create-aios-god-mode@latest update` to get the newest template.'));
      console.log('');
    } catch (error) {
      installSpinner.fail('Failed to install update');
      printError('Update installation failed.', error);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Failed to check for updates');
    printError('Could not check for updates.', error);
    process.exit(1);
  }
}
