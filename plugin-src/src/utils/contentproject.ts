import { App, TFile } from "obsidian";
import type { StartPageSettings } from "@/types";

export function projectRoot(settings: StartPageSettings): string {
    const folder = settings.contentProjectFolder.trim();
    if (folder.split("/").includes("..") || folder.includes("\\")) throw new Error("Invalid project folder");
    return folder === "/" ? "" : folder.replace(/^\/+|\/+$/g, "");
}
export function projectNotes(app: App, settings: StartPageSettings): TFile[] {
    const root = projectRoot(settings);
    return app.vault.getMarkdownFiles().filter(file => {
        if (root && !file.path.startsWith(root + "/")) return false;
        const local = root ? file.path.slice(root.length + 1) : file.path;
        return !local.includes("/") || /^(codex-handoff|验收|项目日志|口播|审核)\//.test(local);
    }).sort((a,b) => phase(a.path) - phase(b.path) || a.path.localeCompare(b.path, "zh-CN"));
}
export function phase(path: string): number {
    if (/return|交回/.test(path)) return 3;
    if (/diagnosis|诊断/.test(path)) return 1;
    if (/codex-handoff|交接/.test(path)) return 2;
    if (/验收/.test(path)) return 4;
    if (/口播/.test(path)) return 5;
    if (/审核/.test(path)) return 6;
    if (/项目日志|开始使用/.test(path)) return 7;
    if (/选题|brief/i.test(path)) return 0;
    return 7;
}
export function evidenceTargets(row: string): string[] {
    return [...row.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]|\[[^\]]*\]\(([^)]+)\)/g)].map(match => (match[1] ?? match[2]).replace(/^<|>$/g, "").split("#")[0]);
}
export function missingEvidence(content: string, resolves: (target:string)=>boolean): number {
    let evidenceColumn = -1, count = 0;
    for (const row of content.split("\n")) {
        if (!row.trim().startsWith("|")) { evidenceColumn = -1; continue; }
        const cells = row.replace(/\[\[([^\]]*)\]\]/g, token => token.replace(/\|/g, "\u001f")).split("|").slice(1,-1).map(cell=>cell.trim().replace(/\u001f/g,"|"));
        if (cells.includes("证据")) { evidenceColumn = cells.indexOf("证据"); continue; }
        if (evidenceColumn < 0 || cells.every(cell=>/^:?-+:?$/.test(cell))) continue;
        const targets = evidenceTargets(cells[evidenceColumn] ?? "");
        if (!targets.length || !targets.every(target => target && resolves(target))) count++;
    }
    return count;
}
