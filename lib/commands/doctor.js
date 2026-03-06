import path from 'node:path';
import chalk from 'chalk';
import fse from 'fs-extra';
import { validateNodeVersion, checkNetworkAccess } from '../utils/validators.js';
import { resolveCoreConfigPath } from '../utils/platform.js';

/**
 * Resultado individual de uma verificação de saúde.
 * @typedef {{ name: string, passed: boolean, critical: boolean, detail?: string }} CheckResult
 */

/**
 * Comando doctor: executa verificações de saúde na instalação AIOS.
 *
 * Cada check imprime um indicador visual (verde/vermelho) e um resumo
 * no final. Retorna exit code 1 se algum check crítico falhar.
 *
 * @param {object} [options] - Reservado para uso futuro
 */
export async function doctorCommand(options = {}) {
  const cwd = process.cwd();
  const results = [];

  console.log('');
  console.log(chalk.bold('AIOS Doctor') + chalk.dim(' — health check'));
  console.log('');

  // 1. Node.js version >= 18
  const nodeOk = validateNodeVersion('>=18.0.0');
  results.push(
    reportCheck('Node.js version', nodeOk, false, `${process.version} ${nodeOk ? '(>= 18)' : '(requires >= 18)'}`)
  );

  // 2. AIOS project — core-config.yaml exists
  const coreConfigPath = await resolveCoreConfigPath(cwd);
  const hasProject = await fse.pathExists(coreConfigPath);
  results.push(
    reportCheck('AIOS project', hasProject, true, path.relative(cwd, coreConfigPath))
  );

  // 3. God Mode — .claude/skills/aios-god-mode/SKILL.md exists
  const godModePath = path.join(cwd, '.claude', 'skills', 'aios-god-mode', 'SKILL.md');
  const hasGodMode = await fse.pathExists(godModePath);
  results.push(
    reportCheck('God Mode', hasGodMode, true, '.claude/skills/aios-god-mode/SKILL.md')
  );

  // 4. Claude Config — .claude/CLAUDE.md exists
  const claudeMdPath = path.join(cwd, '.claude', 'CLAUDE.md');
  const hasClaudeMd = await fse.pathExists(claudeMdPath);
  results.push(
    reportCheck('Claude Config', hasClaudeMd, false, '.claude/CLAUDE.md')
  );

  // 5. Settings — .claude/settings.json exists
  const settingsPath = path.join(cwd, '.claude', 'settings.json');
  const hasSettings = await fse.pathExists(settingsPath);
  results.push(
    reportCheck('Settings', hasSettings, false, '.claude/settings.json')
  );

  // 6. Rules — .claude/rules/ has files
  const rulesDir = path.join(cwd, '.claude', 'rules');
  let rulesCount = 0;
  let hasRules = false;

  try {
    if (await fse.pathExists(rulesDir)) {
      const ruleFiles = await fse.readdir(rulesDir);
      rulesCount = ruleFiles.filter((f) => f.endsWith('.md')).length;
      hasRules = rulesCount > 0;
    }
  } catch {
    hasRules = false;
  }

  results.push(
    reportCheck('Rules', hasRules, false, hasRules ? `${rulesCount} rule(s) in .claude/rules/` : '.claude/rules/')
  );

  // 7. Git — .git/ exists
  const gitDir = path.join(cwd, '.git');
  const hasGit = await fse.pathExists(gitDir);
  results.push(
    reportCheck('Git', hasGit, false, '.git/')
  );

  // 8. Network — Can reach GitHub API
  const hasNetwork = await checkNetworkAccess();
  results.push(
    reportCheck('Network', hasNetwork, false, hasNetwork ? 'GitHub API reachable' : 'GitHub API unreachable')
  );

  // Resumo final
  const totalChecks = results.length;
  const passedChecks = results.filter((r) => r.passed).length;
  const criticalFailures = results.filter((r) => !r.passed && r.critical);

  console.log('');
  console.log(
    chalk.bold('Summary: ') +
    (passedChecks === totalChecks
      ? chalk.green(`${passedChecks}/${totalChecks} checks passed`)
      : chalk.yellow(`${passedChecks}/${totalChecks} checks passed`))
  );

  if (criticalFailures.length > 0) {
    console.log('');
    console.log(
      chalk.red('Critical issues found: ') +
      criticalFailures.map((r) => r.name).join(', ')
    );
    console.log(chalk.dim('Run "create-aios-god-mode" to set up a new project, or fix the issues above.'));
    console.log('');
    process.exit(1);
  }

  console.log('');
}

/**
 * Imprime o resultado de uma verificação e retorna o objeto de resultado.
 *
 * @param {string} name - Nome da verificação
 * @param {boolean} passed - Se a verificação passou
 * @param {boolean} critical - Se falha é crítica (causa exit code 1)
 * @param {string} [detail] - Detalhe adicional
 * @returns {CheckResult}
 */
function reportCheck(name, passed, critical, detail) {
  const icon = passed ? chalk.green('\u2713') : chalk.red('\u2717');
  const label = passed ? name : chalk.red(name);
  const suffix = detail ? chalk.dim(` (${detail})`) : '';
  const criticalTag = !passed && critical ? chalk.red(' [CRITICAL]') : '';

  console.log(`  ${icon} ${label}${suffix}${criticalTag}`);

  return { name, passed, critical, detail };
}
