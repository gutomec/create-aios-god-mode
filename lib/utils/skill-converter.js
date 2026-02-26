import fse from 'fs-extra';
import path from 'node:path';

function quoteYaml(value) {
    return `'${String(value).replace(/'/g, "''")}'`;
}

function readFrontmatter(content) {
    const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)([\s\S]*)$/);
    if (!match) return null;
    return { yaml: match[2], body: match[4] };
}

function extractAgentValue(yaml, key) {
    const pattern = new RegExp(`^\\s{2}${key}:\\s*(.+)$`, "m");
    const match = yaml.match(pattern);
    return match ? match[1].trim().replace(/^['"`](.*)['"`]$/, "$1") : null;
}

function extractTopLevelValue(yaml, key) {
    const pattern = new RegExp(`^${key}:\\s*(.+)$`, "m");
    const match = yaml.match(pattern);
    return match ? match[1].trim().replace(/^['"`](.*)['"`]$/, "$1") : null;
}

function cleanupFrontmatterLines(yaml) {
    return yaml
        .split(/\r?\n/)
        .filter((line) => !/^(name|description):\s*.*$/i.test(line))
        .map((line) => line.replace(/\s+$/, ""));
}

function transformToSkill(content, fallbackName) {
    const newline = content.includes("\r\n") ? "\r\n" : "\n";
    const parsed = readFrontmatter(content);

    if (!parsed) {
        const header = [
            "---",
            `name: ${quoteYaml(fallbackName)}`,
            `description: ${quoteYaml(`Skill generated from ${fallbackName}.md`)}`,
            "---",
            "",
        ].join(newline);
        const normalizedBody = content.replace(/^\r?\n/, "");
        const finalBody = normalizedBody.endsWith(newline) ? normalizedBody : `${normalizedBody}${newline}`;
        return `${header}${finalBody}`;
    }

    const agentId = extractAgentValue(parsed.yaml, "id");
    const whenToUse = extractAgentValue(parsed.yaml, "whenToUse");
    const topName = extractTopLevelValue(parsed.yaml, "name");
    const topDescription = extractTopLevelValue(parsed.yaml, "description");

    const skillName = agentId || topName || fallbackName;
    const skillDescription = whenToUse || topDescription || `Skill generated from ${fallbackName}.md`;

    const cleanedLines = cleanupFrontmatterLines(parsed.yaml).filter(Boolean);
    const newFrontmatterLines = [
        "---",
        `name: ${quoteYaml(skillName)}`,
        `description: ${quoteYaml(skillDescription)}`,
        ...cleanedLines,
        "---",
    ];

    const normalizedBody = parsed.body.replace(/^\r?\n/, "");
    const newContent = `${newFrontmatterLines.join(newline)}${newline}${newline}${normalizedBody}`;
    return newContent.endsWith(newline) ? newContent : `${newContent}${newline}`;
}

async function walkFiles(dir, out = []) {
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

export async function convertToCodex(sourceDir, targetDir) {
    await fse.ensureDir(targetDir);
    await fse.copy(sourceDir, targetDir);

    const files = await walkFiles(targetDir);

    for (const fullPath of files) {
        const parsedPath = path.parse(fullPath);
        if (parsedPath.ext.toLowerCase() === '.md' && parsedPath.base.toUpperCase() !== "SKILL.MD") {
            const skillTargetDir = path.join(parsedPath.dir, parsedPath.name);
            await fse.ensureDir(skillTargetDir);

            const skillPath = path.join(skillTargetDir, "SKILL.md");
            const sourceContent = await fse.readFile(fullPath, "utf8");

            const transformed = transformToSkill(sourceContent, parsedPath.name);
            await fse.writeFile(skillPath, transformed, { encoding: "utf8" });
            await fse.unlink(fullPath);
        }
    }
}

export async function convertToAntigravity(sourceDir, targetDir) {
    await fse.ensureDir(targetDir);
    await fse.copy(sourceDir, targetDir);
}
