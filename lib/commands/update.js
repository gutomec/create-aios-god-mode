import path from 'node:path';
import ora from 'ora';
import chalk from 'chalk';
import fse from 'fs-extra';
import semver from 'semver';
import { printError, printStep, printWarning } from '../ui/messages.js';
import { getInstalledGodModeVersion, installGodMode } from '../core/god-mode-installer.js';
import { downloadTemplate, cleanupTemp } from '../utils/download.js';

const GOD_MODE_OWNER = 'gutomec';
const GOD_MODE_REPO = 'aios-god-mode-template';
const CORE_CONFIG_PATH = '.aios-core/core-config.yaml';

/**
 * Comando update: verifica e aplica atualizações ao God Mode do projeto AIOS.
 *
 * Compara a versão instalada com a mais recente disponível no GitHub
 * e atualiza se houver versão mais nova.
 *
 * @param {object} [options]
 * @param {string} [options.tag] - Tag específica para atualizar (default: 'latest')
 */
export async function updateCommand(options = {}) {
  const cwd = process.cwd();

  // 1. Detecta se estamos dentro de um projeto AIOS
  const configPath = path.join(cwd, CORE_CONFIG_PATH);
  const isAiosProject = await fse.pathExists(configPath);

  if (!isAiosProject) {
    printError(
      'Not inside a Synkra AIOS project. ' +
      `Could not find "${CORE_CONFIG_PATH}" in the current directory.`
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

  // 3. Verifica atualizações disponíveis
  const spinner = ora('Checking for updates...').start();

  let tmpDir = null;
  let latestVersion = null;

  try {
    tmpDir = await downloadTemplate(GOD_MODE_OWNER, GOD_MODE_REPO, options.tag || 'latest');

    // Lê versão do template baixado
    const templateJsonPath = path.join(tmpDir, 'template.json');

    if (await fse.pathExists(templateJsonPath)) {
      const templateInfo = await fse.readJson(templateJsonPath);
      latestVersion = templateInfo.version || null;
    }

    if (!latestVersion) {
      spinner.warn('Could not determine latest version from template');
      await cleanupTemp(tmpDir);
      return;
    }

    spinner.text = `Latest available version: v${latestVersion}`;

    // 4. Compara versões
    const needsUpdate = !currentVersion || !semver.valid(currentVersion) || !semver.valid(latestVersion)
      ? currentVersion !== latestVersion
      : semver.gt(latestVersion, currentVersion);

    await cleanupTemp(tmpDir);
    tmpDir = null;

    if (!needsUpdate) {
      spinner.succeed(`Already up to date ${chalk.dim(`(v${currentVersion})`)}`);
      return;
    }

    spinner.info(
      `Update available: ${chalk.dim(`v${currentVersion || 'unknown'}`)} → ${chalk.green(`v${latestVersion}`)}`
    );

    // 5. Instala a versão mais recente
    const installSpinner = ora('Installing update...').start();

    try {
      const { version, filesInstalled } = await installGodMode(cwd, {
        tag: options.tag || 'latest',
      });

      installSpinner.succeed(
        `God Mode updated to v${version} ${chalk.dim(`(${filesInstalled} files)`)}`
      );

      console.log('');
      console.log(chalk.green('\u2713') + ' Update complete!');
      console.log('');
      console.log('  Updated components:');
      console.log(`    ${chalk.cyan('God Mode')} v${currentVersion || 'unknown'} → v${version}`);
      console.log('');
    } catch (error) {
      installSpinner.fail('Failed to install update');
      printError('Update installation failed.', error);
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Failed to check for updates');

    if (tmpDir) {
      await cleanupTemp(tmpDir).catch(() => {});
    }

    printError('Could not check for updates. Verify your network connection.', error);
    process.exit(1);
  }
}
