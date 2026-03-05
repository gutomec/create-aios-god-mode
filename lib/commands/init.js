import path from 'node:path';
import fse from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { showLogo } from '../ui/logo.js';
import { printSuccess, printError, printStep, printWarning } from '../ui/messages.js';
import { validateProjectName, validateDirectoryEmpty, checkNetworkAccess } from '../utils/validators.js';
import { resolveProjectDir } from '../utils/platform.js';
import { bootstrapAios } from '../core/aios-bootstrap.js';
import { installGodMode } from '../core/god-mode-installer.js';
import { configureMcps, installGsd, installOhMyClaudeCode, cleanupSkillsStructure } from '../core/ecosystem-installer.js';
import { postSetup } from '../core/post-setup.js';

const TOTAL_STEPS = 8;
const AI_TOOL = 'claude-code';

/**
 * Comando principal: inicializa um novo projeto Synkra AIOS.
 *
 * Orquestra todo o fluxo de bootstrap — validação, framework,
 * God Mode, ecossistema e pós-setup. Nenhum prompt interativo —
 * o aios-core init já possui seus próprios prompts.
 *
 * @param {string} [projectName] - Nome do projeto (argumento CLI)
 */
export async function initCommand(projectName) {
  try {
    // ── Banner ──
    await showLogo();

    const name = projectName;

    // ── Step 1: Validate ──
    printStep(1, TOTAL_STEPS, 'Validating environment...');

    const nameValidation = validateProjectName(name);
    if (!nameValidation.valid) {
      printError(nameValidation.message);
      process.exit(1);
    }

    const projectDir = resolveProjectDir(name);

    const isDirEmpty = await validateDirectoryEmpty(projectDir);
    if (!isDirEmpty) {
      printError(
        `Directory "${name}" already exists and is not empty. ` +
        `Choose a different name or remove the existing directory.`
      );
      process.exit(1);
    }

    const hasNetwork = await checkNetworkAccess();
    if (!hasNetwork) {
      printWarning(
        'No network access detected. Some operations may fail. ' +
        'Ensure you have internet connectivity for downloading templates.'
      );
    }

    // ── Step 2: Bootstrap AIOS ──
    printStep(2, TOTAL_STEPS, 'Initializing AIOS framework...');

    let spinner = ora('Initializing AIOS framework...').start();

    try {
      await bootstrapAios(name, process.cwd());
      spinner.succeed('AIOS framework initialized');
    } catch (error) {
      spinner.fail('Failed to initialize AIOS framework');
      printError('Bootstrap failed. Check the output above for details.', error);
      process.exit(1);
    }

    // ── Step 3: Install God Mode ──
    printStep(3, TOTAL_STEPS, 'Installing God Mode...');

    spinner = ora('Installing God Mode...').start();

    try {
      const { version, filesInstalled } = await installGodMode(projectDir, { aiTool: AI_TOOL });
      spinner.succeed(`God Mode installed ${chalk.dim(`(v${version}, ${filesInstalled} files)`)}`);
    } catch (error) {
      spinner.fail('Failed to install God Mode');
      printError('God Mode installation failed.', error);
      process.exit(1);
    }

    // ── Squads directory (empty) ──
    const squadsDir = path.join(projectDir, 'squads');
    await fse.ensureDir(squadsDir);

    // ── Step 4: Configure MCP Servers ──
    printStep(4, TOTAL_STEPS, 'Configuring MCP servers...');

    spinner = ora('Configuring MCP servers...').start();

    try {
      const mcpResult = await configureMcps(projectDir, AI_TOOL);
      spinner.succeed(`${mcpResult.count} MCP servers configured ${chalk.dim('(nano-banana-pro, context7, 21st-dev)')}`);
      if (mcpResult.warning) {
        printWarning(mcpResult.warning);
      }
    } catch (error) {
      spinner.fail('Failed to configure MCP servers');
      printWarning(`MCP configuration failed: ${error.message}. You can configure manually.`);
    }

    // ── Step 5: Install GSD ──
    printStep(5, TOTAL_STEPS, 'Installing GSD framework...');

    spinner = ora('Installing GSD (Get Shit Done)...').start();

    const gsdInstalled = await installGsd(projectDir);
    if (gsdInstalled) {
      spinner.succeed('GSD framework installed');
    } else {
      spinner.fail('GSD installation failed');
      printWarning('GSD not installed. You can install manually: npx get-shit-done-cc --local');
    }

    // ── Step 6: Install oh-my-claudecode (always) ──
    printStep(6, TOTAL_STEPS, 'Installing oh-my-claudecode...');

    spinner = ora('Installing oh-my-claudecode...').start();

    const omcInstalled = await installOhMyClaudeCode();
    if (omcInstalled) {
      spinner.succeed('oh-my-claudecode installed');
    } else {
      spinner.warn('oh-my-claudecode not installed (install manually: npx oh-my-claude-sisyphus install)');
    }

    // ── Step 7: Cleanup & Converting ──
    printStep(7, TOTAL_STEPS, 'Cleaning up...');

    try {
      await cleanupSkillsStructure(projectDir, AI_TOOL);
      console.log(chalk.green('  \u2713') + ' Cleaned up directory structure');
    } catch (error) {
      printWarning(`Directory cleanup failed: ${error.message}`);
    }

    // ── Step 8: Finalizing (deps + git) ──
    printStep(8, TOTAL_STEPS, 'Finalizing...');

    spinner = ora('Installing npm dependencies...').start();

    spinner.text = 'Running post-setup tasks...';

    try {
      const { depsInstalled, gitInitialized } = await postSetup(projectDir);

      spinner.stop();

      if (depsInstalled) {
        console.log(chalk.green('  \u2713') + ' Dependencies installed');
      } else {
        printWarning('Dependencies installation skipped (no package.json in .aios-core/)');
      }

      if (gitInitialized) {
        console.log(chalk.green('  \u2713') + ' Git repository initialized with initial commit');
      } else {
        printWarning('Git initialization skipped or failed. You can run "git init" manually.');
      }
    } catch (error) {
      spinner.fail('Post-setup failed');
      printError('Post-setup encountered an error.', error);
    }

    // ── Done! ──
    console.log('');
    printStep(TOTAL_STEPS, TOTAL_STEPS, 'Done!');
    printSuccess(name, AI_TOOL);
  } catch (error) {
    printError('An unexpected error occurred during project creation.', error);
    process.exit(1);
  }
}
