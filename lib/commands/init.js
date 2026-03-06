import path from 'node:path';
import fse from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { showLogo } from '../ui/logo.js';
import { printSuccess, printError, printStep, printWarning } from '../ui/messages.js';
import { validateProjectName, validateDirectoryEmpty, checkNetworkAccess } from '../utils/validators.js';
import { resolveProjectDir, resolveCoreDir, resolveCoreConfigPath } from '../utils/platform.js';
import { bootstrapAios } from '../core/aios-bootstrap.js';
import { installGodMode } from '../core/god-mode-installer.js';
import { configureMcps, installFindSkills, installGsd, installOhMyClaudeCode, cleanupSkillsStructure } from '../core/ecosystem-installer.js';
import { postSetup } from '../core/post-setup.js';

const TOTAL_STEPS = 8;

/**
 * Reads selected IDE tools from core-config.yaml written by aios-core init.
 *
 * @param {string} projectDir - Absolute path to the project directory
 * @returns {Promise<string[]>} List of selected tool keys (e.g. ['claude-code', 'codex'])
 */
async function readSelectedTools(projectDir) {
  const configPath = await resolveCoreConfigPath(projectDir);

  if (!(await fse.pathExists(configPath))) {
    return ['claude-code'];
  }

  const content = await fse.readFile(configPath, 'utf-8');

  // Parse ide.selected list from YAML
  const match = content.match(/ide:\s*\n\s+selected:\s*\n((?:\s+-\s+.+\n?)+)/);
  if (!match) {
    return ['claude-code'];
  }

  const tools = match[1]
    .split('\n')
    .map((line) => line.match(/^\s+-\s+(.+)$/))
    .filter(Boolean)
    .map((m) => m[1].trim());

  return tools.length > 0 ? tools : ['claude-code'];
}

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
        'Ensure you have internet connectivity for installing dependencies.'
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

    // ── Read selected IDEs from core-config.yaml ──
    const selectedTools = await readSelectedTools(projectDir);
    const primaryTool = selectedTools[0] || 'claude-code';

    // ── Step 3: Install God Mode (for each selected IDE) ──
    printStep(3, TOTAL_STEPS, 'Installing God Mode...');

    for (const tool of selectedTools) {
      spinner = ora(`Installing God Mode (${tool})...`).start();

      try {
        const { version, filesInstalled } = await installGodMode(projectDir, { aiTool: tool });
        spinner.succeed(`God Mode (${tool}) ${chalk.dim(`v${version}, ${filesInstalled} files`)}`);
      } catch (error) {
        spinner.fail(`Failed to install God Mode (${tool})`);
        printError(`God Mode installation failed for ${tool}.`, error);
        process.exit(1);
      }
    }

    // ── Install find-skills (Vercel Labs) ──
    spinner = ora('Installing find-skills...').start();

    const findSkillsInstalled = await installFindSkills(projectDir);
    if (findSkillsInstalled) {
      spinner.succeed('find-skills installed');
    } else {
      spinner.warn('find-skills not installed (install manually: npx skills add https://github.com/vercel-labs/skills --skill find-skills)');
    }

    // ── Squads directory (empty) ──
    const squadsDir = path.join(projectDir, 'squads');
    await fse.ensureDir(squadsDir);

    // ── Step 4: Configure MCP Servers (for each selected IDE) ──
    printStep(4, TOTAL_STEPS, 'Configuring MCP servers...');

    for (const tool of selectedTools) {
      spinner = ora(`Configuring MCP servers (${tool})...`).start();

      try {
        const mcpResult = await configureMcps(projectDir, tool);
        spinner.succeed(`MCP servers (${tool}) ${chalk.dim(`${mcpResult.count} configured`)}`);
        if (mcpResult.warning) {
          printWarning(mcpResult.warning);
        }
      } catch (error) {
        spinner.fail(`Failed to configure MCP servers (${tool})`);
        printWarning(`MCP configuration failed for ${tool}: ${error.message}. You can configure manually.`);
      }
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

    // ── Step 7: Cleanup & Converting (for each selected IDE) ──
    printStep(7, TOTAL_STEPS, 'Cleaning up...');

    const hasClaudeCode = selectedTools.includes('claude-code');
    const multiTool = selectedTools.length > 1;

    for (const tool of selectedTools) {
      try {
        // Keep .claude/ during cleanup: either claude-code is selected, or
        // multiple tools need .claude/ as conversion source
        await cleanupSkillsStructure(projectDir, tool, { keepClaudeDir: hasClaudeCode || multiTool });
        console.log(chalk.green('  \u2713') + ` Cleaned up (${tool})`);
      } catch (error) {
        printWarning(`Directory cleanup failed for ${tool}: ${error.message}`);
      }
    }

    // If claude-code is NOT selected, remove .claude/ after all conversions are done
    if (!hasClaudeCode) {
      const claudeDir = path.join(projectDir, '.claude');
      if (await fse.pathExists(claudeDir)) {
        await fse.remove(claudeDir);
      }
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
        printWarning('Dependencies installation skipped (no package.json in core dir)');
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
    printSuccess(name, primaryTool);
  } catch (error) {
    printError('An unexpected error occurred during project creation.', error);
    process.exit(1);
  }
}
