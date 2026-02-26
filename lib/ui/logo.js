import chalk from 'chalk';

/**
 * Exibe o logo squads.sh estilizado usando oh-my-logo (renderFilled).
 *
 * @param {object} [options]
 * @param {boolean} [options.returnString] - Se true, retorna a string ao invés de imprimir
 * @returns {Promise<string | void>}
 */
export async function showLogo(options = {}) {
  let output = '';

  try {
    const { renderFilled } = await import('oh-my-logo');

    const rendered = await renderFilled('squads.sh', {
      palette: 'sunset',
    });

    output += rendered + '\n';
    output += chalk.dim('  by squads.sh \u2022 https://squads.sh') + '\n';
    output += '\n';
  } catch {
    // Fallback caso oh-my-logo falhe ou não esteja disponível
    output += chalk.bold.cyan('\n  squads.sh\n') + '\n';
    output += chalk.dim('  by squads.sh \u2022 https://squads.sh') + '\n';
    output += '\n';
  }

  if (options.returnString) {
    return output;
  }

  process.stdout.write(output);
}

/**
 * Exibe um banner simplificado de uma linha (para contextos fora do --help).
 */
export function showBanner() {
  console.log(
    chalk.bold.cyan('squads.sh') +
    chalk.dim(' \u2014 AI-Orchestrated System')
  );
}
