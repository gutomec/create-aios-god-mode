import chalk from 'chalk';

/**
 * Exibe a mensagem de sucesso com os próximos passos.
 *
 * @param {string} projectName - Nome do projeto criado
 */
export function printSuccess(projectName) {
  console.log('');
  console.log(chalk.green('\u2713') + ' AIOS project created successfully!');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log(`    ${chalk.cyan(`cd ${projectName}`)}`);
  console.log(`    ${chalk.cyan('cp .env.example .env')}          ${chalk.dim('# Configure API keys')}`);
  console.log(`    ${chalk.cyan('claude')}                         ${chalk.dim('# Start Claude Code')}`);
  console.log('');
  console.log('  Quick start:');
  console.log('');
  console.log(`    ${chalk.cyan('/aios-god-mode')}                 ${chalk.dim('# Activate God Mode')}`);
  console.log(`    ${chalk.cyan('*create-agent security')}         ${chalk.dim('# Create a new agent')}`);
  console.log(`    ${chalk.cyan('*create-squad my-squad')}         ${chalk.dim('# Create a new squad')}`);
  console.log(`    ${chalk.cyan('@dev *help')}                     ${chalk.dim('# Developer agent')}`);
  console.log('');
  console.log(`  Docs: ${chalk.dim('.aios-core/user-guide.md')}`);
  console.log('');
}

/**
 * Exibe uma mensagem de erro formatada.
 *
 * @param {string} message - Mensagem de erro
 * @param {Error} [error] - Objeto de erro opcional com stack trace
 */
export function printError(message, error) {
  console.error('');
  console.error(chalk.red('Error:') + ' ' + message);

  if (error && process.env.DEBUG) {
    console.error('');
    console.error(chalk.dim('Stack trace:'));
    console.error(chalk.dim(error.stack || error.message));
  }

  console.error('');
}

/**
 * Exibe um indicador de progresso por etapa.
 *
 * @param {number} step - Etapa atual (1-based)
 * @param {number} total - Total de etapas
 * @param {string} description - Descrição da etapa
 */
export function printStep(step, total, description) {
  console.log(chalk.dim(`[${step}/${total}]`) + ' ' + description);
}

/**
 * Exibe uma mensagem de aviso.
 *
 * @param {string} message - Mensagem de aviso
 */
export function printWarning(message) {
  console.log(chalk.yellow('Warning:') + ' ' + message);
}
