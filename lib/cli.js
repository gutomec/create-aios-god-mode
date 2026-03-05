import { Command } from 'commander';
import chalk from 'chalk';
import { showBanner } from './ui/logo.js';

const program = new Command();

program
  .name('create-aios-god-mode')
  .description('Bootstrap a Synkra AIOS project with God Mode — AI agent orchestration')
  .version('2.1.1', '-v, --version', 'Display the current version');

// Exibe banner antes do texto de help (sync, pois addHelpText não suporta async)
program.addHelpText('before', () => {
  return '\n  ' + chalk.bold.cyan('AIOS') + chalk.dim(' — AI-Orchestrated System by squads.sh') + '\n';
});

// Comando padrão: init (criar novo projeto)
program
  .argument('[project-name]', 'Name of the project to create')
  .option('--yes', 'Skip all prompts and use defaults', false)
  .action(async (projectName, options) => {
    const { initCommand } = await import('./commands/init.js');
    await initCommand(projectName, options);
  });

// Comando: update
program
  .command('update')
  .description('Update an existing AIOS project to the latest template version')
  .action(async (options) => {
    const { updateCommand } = await import('./commands/update.js');
    await updateCommand(options);
  });

// Comando: doctor
program
  .command('doctor')
  .description('Run health checks on the current AIOS project')
  .action(async (options) => {
    const { doctorCommand } = await import('./commands/doctor.js');
    await doctorCommand(options);
  });

// Comando: add-squad
program
  .command('add-squad <name>')
  .description('Add a new squad to the current AIOS project')
  .action(async (name, options) => {
    const { addSquadCommand } = await import('./commands/add-squad.js');
    await addSquadCommand(name, options);
  });

// Handler global de erros
program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed' || err.code === 'commander.version') {
    process.exit(0);
  }
  throw err;
});

/**
 * Executa o CLI, parseando os argumentos do processo.
 */
export async function run() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
