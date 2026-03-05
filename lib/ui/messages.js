import chalk from 'chalk';
import { getToolPaths, resolveToolKey } from '../utils/tool-paths.js';

/**
 * Labels amigáveis para cada ferramenta.
 */
const TOOL_LABELS = {
  'claude-code': 'Claude Code',
  codex: 'Codex',
  gemini: 'Gemini',
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  antigravity: 'Antigravity',
};

/**
 * Exibe a mensagem de sucesso com os próximos passos.
 *
 * @param {string} projectName - Nome do projeto criado
 * @param {string} [aiTool='claude-code'] - Ferramenta de IA selecionada
 */
export function printSuccess(projectName, aiTool = 'claude-code') {
  const resolved = resolveToolKey(aiTool);
  const toolPaths = getToolPaths(resolved);
  const cmd = toolPaths.startCommand;
  const toolLabel = TOOL_LABELS[resolved] || resolved;
  const pad = ' '.repeat(Math.max(0, 29 - cmd.length));

  console.log('');
  console.log(chalk.green('\u2713') + ' AIOS project created successfully!');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log(`    ${chalk.cyan(`cd ${projectName}`)}`);
  console.log(`    ${chalk.cyan('cp .env.example .env')}          ${chalk.dim('# Configure API keys')}`);
  console.log(`    ${chalk.cyan(cmd)}${pad}${chalk.dim(`# Start ${toolLabel}`)}`);
  console.log('');
  console.log('  Quick start:');
  console.log('');
  console.log(`    ${chalk.cyan('/aiox-god-mode')}                 ${chalk.dim('# Activate God Mode')}`);
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
