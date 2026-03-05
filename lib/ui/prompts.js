import prompts from 'prompts';

/**
 * Regex para validação de nomes em kebab-case.
 */
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9-]*$/;

/**
 * Opções de squads disponíveis para seleção.
 */
const SQUAD_CHOICES = [
  { title: 'AFS \u2014 Framework development', value: 'aios-forge-squad', selected: true },
  { title: 'NSC \u2014 Squad creator', value: 'gutomec/nirvana-squad-creator/nirvana-squad-creator', selected: true },
  { title: 'Ultimate LP \u2014 Landing pages', value: 'ultimate-landing-page', selected: false },
];

/**
 * Handler para cancelamento (Ctrl+C) durante os prompts.
 */
function onCancel() {
  console.log('\nSetup cancelled.');
  process.exit(0);
}

/**
 * Executa os prompts interativos para configuração do projeto.
 *
 * @param {string} [projectName] - Nome do projeto pré-preenchido (vindo do argumento CLI)
 * @returns {Promise<{ name: string, projectType: string, language: string, squads: string[], aiTool: string }>}
 */
export async function promptProjectConfig(projectName) {
  const questions = [
    {
      type: projectName ? null : 'text',
      name: 'name',
      message: 'Project name:',
      initial: projectName || '',
      validate: (value) => {
        if (!value) return 'Project name is required.';
        if (!KEBAB_CASE_REGEX.test(value)) {
          return 'Must be kebab-case (lowercase letters, numbers, hyphens, starting with a letter).';
        }
        return true;
      },
    },
    {
      type: 'select',
      name: 'projectType',
      message: 'Project type:',
      choices: [
        { title: 'Greenfield \u2014 New project from scratch', value: 'greenfield' },
        { title: 'Brownfield \u2014 Existing codebase', value: 'brownfield' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'language',
      message: 'Language:',
      choices: [
        { title: 'Portugu\u00eas (PT-BR)', value: 'pt-br' },
        { title: 'English', value: 'en' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'aiTool',
      message: 'AI Tool:',
      choices: [
        { title: 'Claude Code (Recommended)', value: 'claude-code' },
        { title: 'Codex (Recommended)', value: 'codex' },
        { title: 'Gemini', value: 'gemini' },
        { title: 'Cursor', value: 'cursor' },
        { title: 'GitHub Copilot', value: 'github-copilot' },
        { title: 'Antigravity', value: 'antigravity' },
      ],
      initial: 0,
    },
    {
      type: 'multiselect',
      name: 'squads',
      message: 'Select squads to install:',
      choices: SQUAD_CHOICES,
      hint: '- Space to toggle, Enter to confirm',
      instructions: false,
    },
  ];

  const response = await prompts(questions, { onCancel });

  // Se o nome veio do argumento, usa direto
  if (projectName) {
    response.name = projectName;
  }

  return response;
}

/**
 * Retorna a configuração padrão sem prompts interativos (modo --yes).
 *
 * @param {string} projectName - Nome do projeto
 * @returns {{ name: string, projectType: string, language: string, squads: string[], aiTool: string }}
 */
export function getDefaultConfig(projectName) {
  return {
    name: projectName,
    projectType: 'greenfield',
    language: 'pt-br',
    squads: SQUAD_CHOICES.filter((choice) => choice.selected).map((choice) => choice.value),
    aiTool: 'claude-code',
  };
}
