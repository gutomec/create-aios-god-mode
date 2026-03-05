import ora from 'ora';
import chalk from 'chalk';
import { showLogo } from '../ui/logo.js';
import { promptProjectConfig, getDefaultConfig } from '../ui/prompts.js';
import { printSuccess, printError, printStep, printWarning } from '../ui/messages.js';
import { validateProjectName, validateDirectoryEmpty, checkNetworkAccess } from '../utils/validators.js';
import { resolveProjectDir } from '../utils/platform.js';
import { bootstrapAios } from '../core/aios-bootstrap.js';
import { installGodMode } from '../core/god-mode-installer.js';
import { installSquads } from '../core/squad-installer.js';
import { configureMcps, installGsd, installOhMyClaudeCode, cleanupSkillsStructure } from '../core/ecosystem-installer.js';
import { postSetup } from '../core/post-setup.js';

const TOTAL_STEPS = 10;

/**
 * Comando principal: inicializa um novo projeto Synkra AIOS.
 *
 * Orquestra todo o fluxo de bootstrap — coleta de configuração, validação,
 * instalação do framework, God Mode, squads, ecossistema e pós-setup.
 *
 * @param {string} [projectName] - Nome do projeto (pode vir do argumento CLI)
 * @param {object} [options]
 * @param {boolean} [options.yes] - Pular prompts e usar configuração padrão
 */
export async function initCommand(projectName, options = {}) {
  try {
    // ── Step 1: Banner ──
    await showLogo();

    // ── Step 2: Collect Config ──
    const config = options.yes
      ? getDefaultConfig(projectName)
      : await promptProjectConfig(projectName);

    const { name, squads, aiTool = 'claude-code', installOmc } = config;

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
      const resultDir = await bootstrapAios(name, process.cwd());
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
      const { version, filesInstalled } = await installGodMode(projectDir, { aiTool });
      spinner.succeed(`God Mode installed ${chalk.dim(`(v${version}, ${filesInstalled} files)`)}`);
    } catch (error) {
      spinner.fail('Failed to install God Mode');
      printError('God Mode installation failed.', error);
      process.exit(1);
    }

    // ── Step 4: Install Squads ──
    printStep(4, TOTAL_STEPS, 'Installing squads...');

    if (squads && squads.length > 0) {
      const squadResults = await installSquads(squads, projectDir, (index, total, squadName) => {
        console.log(chalk.dim(`  Installing squad ${index + 1}/${total}: ${squadName}`));
      });

      const successes = squadResults.filter((r) => r.success);
      const failures = squadResults.filter((r) => !r.success);

      if (successes.length > 0) {
        console.log(
          chalk.green('  \u2713') +
          ` ${successes.length}/${squads.length} squads installed successfully`
        );
      }

      if (failures.length > 0) {
        for (const failure of failures) {
          printWarning(`Squad "${failure.squadName}" failed: ${failure.error}`);
        }
      }
    } else {
      console.log(chalk.dim('  No squads selected, skipping.'));
    }

    // ── Step 5: Configure MCP Servers ──
    printStep(5, TOTAL_STEPS, 'Configuring MCP servers...');

    spinner = ora('Configuring MCP servers...').start();

    try {
      const mcpResult = await configureMcps(projectDir, aiTool);
      spinner.succeed(`${mcpResult.count} MCP servers configured ${chalk.dim('(nano-banana-pro, context7, 21st-dev)')}`);
      if (mcpResult.warning) {
        printWarning(mcpResult.warning);
      }
    } catch (error) {
      spinner.fail('Failed to configure MCP servers');
      printWarning(`MCP configuration failed: ${error.message}. You can configure manually.`);
    }

    // ── Step 6: Install GSD ──
    printStep(6, TOTAL_STEPS, 'Installing GSD framework...');

    spinner = ora('Installing GSD (Get Shit Done)...').start();

    const gsdInstalled = await installGsd(projectDir);
    if (gsdInstalled) {
      spinner.succeed('GSD framework installed');
    } else {
      spinner.fail('GSD installation failed');
      printWarning('GSD not installed. You can install manually: npx get-shit-done-cc --local');
    }

    // ── Step 7: Install oh-my-claudecode ──
    if (installOmc) {
      printStep(7, TOTAL_STEPS, 'Installing oh-my-claudecode...');

      spinner = ora('Installing oh-my-claudecode...').start();

      const omcInstalled = await installOhMyClaudeCode();
      if (omcInstalled) {
        spinner.succeed('oh-my-claudecode installed');
      } else {
        spinner.warn('oh-my-claudecode not installed (install manually: npx oh-my-claude-sisyphus install)');
      }
    } else {
      console.log(chalk.dim('  oh-my-claudecode skipped.'));
    }

    // ── Step 8: Cleanup & Converting ──
    printStep(8, TOTAL_STEPS, 'Cleaning up & converting...');

    try {
      await cleanupSkillsStructure(projectDir, aiTool);
      console.log(chalk.green('  \u2713') + ' Cleaned up directory structure');
    } catch (error) {
      printWarning(`Directory cleanup failed: ${error.message}`);
    }

    // ── Step 9: Post-Setup ──
    printStep(9, TOTAL_STEPS, 'Installing dependencies...');

    spinner = ora('Installing npm dependencies...').start();

    spinner.text = 'Running post-setup tasks...';

    try {
      const { depsInstalled, gitInitialized } = await postSetup(projectDir, config);

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

    // ── Step 10: Done ──
    printStep(TOTAL_STEPS, TOTAL_STEPS, 'Done!');
    printSuccess(name, aiTool);
  } catch (error) {
    printError('An unexpected error occurred during project creation.', error);
    process.exit(1);
  }
}
