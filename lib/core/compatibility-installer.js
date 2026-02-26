import path from 'node:path';
import fse from 'fs-extra';

/**
 * Converte a estrutura de comandos do Claude para workflows do Antigravity.
 * 
 * @param {string} projectDir - Diretório raiz do projeto
 */
export async function setupAntigravity(projectDir) {
    const srcRoot = path.join(projectDir, '.claude', 'commands');
    const dstRoot = path.join(projectDir, '.agent', 'workflows');

    if (!(await fse.pathExists(srcRoot))) {
        return { success: false, message: 'Source .claude/commands not found' };
    }

    await fse.ensureDir(dstRoot);
    await fse.copy(srcRoot, dstRoot);

    const files = await walkFiles(dstRoot);
    return { success: true, filesCopied: files.length };
}

/**
 * Converte a estrutura de comandos do Claude para skills do Codex.
 * 
 * @param {string} projectDir - Diretório raiz do projeto
 */
export async function setupCodex(projectDir) {
    const srcRoot = path.join(projectDir, '.claude', 'commands');
    const dstRoot = path.join(projectDir, '.codex', 'skills');

    if (!(await fse.pathExists(srcRoot))) {
        return { success: false, message: 'Source .claude/commands not found' };
    }

    await fse.ensureDir(dstRoot);

    // Primeiro copia tudo recursivamente
    await fse.copy(srcRoot, dstRoot);

    // Depois coleta todos os arquivos .md e converte
    const allFiles = await walkFiles(dstRoot);
    const markdownFiles = allFiles.filter(f => path.extname(f).toLowerCase() === '.md');

    let converted = 0;
    for (const markdownPath of markdownFiles) {
        const parsedPath = path.parse(markdownPath);
        if (parsedPath.base.toUpperCase() === 'SKILL.MD') continue;

        const targetDir = path.join(parsedPath.dir, parsedPath.name);
        const skillPath = path.join(targetDir, 'SKILL.md');
        await fse.ensureDir(targetDir);

        const sourceContent = await fse.readFile(markdownPath, 'utf8');
        const transformed = transformToSkill(sourceContent, parsedPath.name);
        await fse.writeFile(skillPath, transformed, 'utf8');
        await fse.remove(markdownPath);
        converted++;
    }

    return { success: true, convertedCount: converted };
}

/**
 * Helper para listar arquivos recursivamente.
 */
async function walkFiles(dir, out = []) {
    if (!(await fse.pathExists(dir))) return out;
    const entries = await fse.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await walkFiles(fullPath, out);
        } else if (entry.isFile()) {
            out.push(fullPath);
        }
    }
    return out;
}

/**
 * Transforma o conteúdo de um arquivo markdown do Claude em um SKILL.md do Codex.
 */
function transformToSkill(content, fallbackName) {
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const parsed = readFrontmatter(content);

    if (!parsed) {
        const header = [
            '---',
            `name: ${quoteYaml(fallbackName)}`,
            `description: ${quoteYaml(`Skill generated from ${fallbackName}.md`)}`,
            '---',
            '',
        ].join(newline);
        const normalizedBody = content.replace(/^\r?\n/, '');
        const finalBody = normalizedBody.endsWith(newline) ? normalizedBody : `${normalizedBody}${newline}`;
        return `${header}${finalBody}`;
    }

    const agentId = extractAgentValue(parsed.yaml, 'id');
    const whenToUse = extractAgentValue(parsed.yaml, 'whenToUse');
    const topName = extractTopLevelValue(parsed.yaml, 'name');
    const topDescription = extractTopLevelValue(parsed.yaml, 'description');

    const skillName = agentId || topName || fallbackName;
    const skillDescription = whenToUse || topDescription || `Skill generated from ${fallbackName}.md`;

    const cleanedLines = cleanupFrontmatterLines(parsed.yaml).filter(Boolean);
    const newFrontmatterLines = [
        '---',
        `name: ${quoteYaml(skillName)}`,
        `description: ${quoteYaml(skillDescription)}`,
        ...cleanedLines,
        '---',
    ];

    const normalizedBody = parsed.body.replace(/^\r?\n/, '');
    const newContent = `${newFrontmatterLines.join(newline)}${newline}${newline}${normalizedBody}`;
    return newContent.endsWith(newline) ? newContent : `${newContent}${newline}`;
}

function quoteYaml(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function readFrontmatter(content) {
    const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/);
    if (!match) return null;
    return { yaml: match[2], body: match[4] };
}

function extractAgentValue(yaml, key) {
    const pattern = new RegExp(`^\\s{2}${key}:\\s*(.+)$`, 'm');
    const match = yaml.match(pattern);
    if (!match) return null;
    return match[1].trim().replace(/^['"`](.*)['"`]$/, '$1');
}

function extractTopLevelValue(yaml, key) {
    const pattern = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const match = yaml.match(pattern);
    if (!match) return null;
    return match[1].trim().replace(/^['"`](.*)['"`]$/, '$1');
}

function cleanupFrontmatterLines(yaml) {
    return yaml
        .split(/\r?\n/)
        .filter((line) => !/^(name|description):\s*.*$/i.test(line))
        .map((line) => line.replace(/\s+$/, ''));
}
