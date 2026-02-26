import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fse from 'fs-extra';
import { extract } from 'tar';

const GITHUB_API = 'https://api.github.com';

const DEFAULT_HEADERS = {
  'User-Agent': 'create-aios-cli/1.0',
  'Accept': 'application/vnd.github.v3+json',
};

/**
 * Faz o download e extrai um tarball de release do GitHub.
 *
 * @param {string} owner - Dono do repositório (ex: "gutomec")
 * @param {string} repo  - Nome do repositório (ex: "aios-god-mode-template")
 * @param {string} tag   - Tag da release ou 'latest'
 * @returns {Promise<string>} Caminho do diretório temporário com o conteúdo extraído
 */
export async function downloadTemplate(owner, repo, tag = 'latest') {
  const resolvedTag = tag === 'latest'
    ? await fetchLatestTag(owner, repo)
    : tag;

  const tarballUrl = `${GITHUB_API}/repos/${owner}/${repo}/tarball/${resolvedTag}`;

  const response = await fetch(tarballUrl, {
    headers: {
      ...DEFAULT_HEADERS,
      'Accept': 'application/vnd.github.v3.tarball',
    },
    redirect: 'follow',
  });

  handleHttpErrors(response, `download tarball for ${owner}/${repo}@${resolvedTag}`);

  const tmpDir = path.join(tmpdir(), `create-aios-${randomUUID()}`);
  await fse.ensureDir(tmpDir);

  try {
    await pipeline(
      response.body,
      extract({ cwd: tmpDir, strip: 1 })
    );
  } catch (error) {
    // Limpa o diretório temporário em caso de falha na extração
    await fse.remove(tmpDir).catch(() => {});
    throw new Error(`Failed to extract tarball: ${error.message}`);
  }

  return tmpDir;
}

/**
 * Remove o diretório temporário criado pelo download.
 *
 * @param {string} tmpDir - Caminho do diretório temporário
 */
export async function cleanupTemp(tmpDir) {
  await fse.remove(tmpDir);
}

/**
 * Busca a tag da release mais recente via GitHub API.
 *
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<string>} Nome da tag
 */
async function fetchLatestTag(owner, repo) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/releases/latest`;

  const response = await fetch(url, { headers: DEFAULT_HEADERS });

  handleHttpErrors(response, `fetch latest release for ${owner}/${repo}`);

  const data = await response.json();

  if (!data.tag_name) {
    throw new Error(
      `No tag_name found in latest release for ${owner}/${repo}. ` +
      `The repository may not have any published releases.`
    );
  }

  return data.tag_name;
}

/**
 * Verifica erros HTTP e lança exceções descritivas.
 *
 * @param {Response} response - Objeto Response do fetch
 * @param {string} context - Descrição da operação para mensagens de erro
 */
function handleHttpErrors(response, context) {
  if (response.ok) return;

  const status = response.status;

  if (status === 404) {
    throw new Error(
      `Resource not found (404) while trying to ${context}. ` +
      `Verify the repository name and tag exist.`
    );
  }

  if (status === 403) {
    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    const rateLimitReset = response.headers.get('x-ratelimit-reset');

    if (rateLimitRemaining === '0' && rateLimitReset) {
      const resetDate = new Date(Number(rateLimitReset) * 1000);
      throw new Error(
        `GitHub API rate limit exceeded. ` +
        `Rate limit resets at ${resetDate.toLocaleTimeString()}. ` +
        `Set GITHUB_TOKEN environment variable to increase the limit.`
      );
    }

    throw new Error(
      `Access forbidden (403) while trying to ${context}. ` +
      `The repository may be private. Set GITHUB_TOKEN for authentication.`
    );
  }

  throw new Error(
    `HTTP ${status} error while trying to ${context}.`
  );
}
