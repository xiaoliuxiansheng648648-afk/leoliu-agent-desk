import { App, Notice, TFile } from "obsidian";
import type StartPagePlugin from "@/main";
import { NewNoteUtil, NewNoteOptions } from "@/utils/newnoteutil";
import { t } from "@/i18n";

export type CreatorAction = "idea" | "draft" | "daily" | "acceptance";

// Reuse upstream title rendering, folder creation and conflict handling.
export class CreatorActions {
	private static pending = new WeakMap<App, Promise<TFile | null>>();

	static create(app: App, plugin: StartPagePlugin, action: CreatorAction): Promise<TFile | null> {
		const previous = this.pending.get(app) ?? Promise.resolve(null);
		const next = previous.catch(() => null).then(() => this.createNow(app, plugin, action));
		this.pending.set(app, next);
		return next;
	}

	private static async createContentNote(app: App, plugin: StartPagePlugin, action: CreatorAction): Promise<TFile | null> {
		try {
			const source = plugin.settings.contentProjectFolder.trim();
			if (source.split("/").some(part => part === "..") || source.includes("\\")) throw new Error("Invalid project folder");
			const root = source === "/" ? "" : source.replace(/^\/+|\/+$/g, "");
			const path = (part: string) => root ? `${root}/${part}` : part;
			const files = app.vault.getMarkdownFiles();
			const handoffs = files.filter(file => file.path.startsWith(path("codex-handoff") + "/") && !/return|交回/i.test(file.basename));
			handoffs.sort((a, b) => Number(b.basename.match(/^(\d+)-/)?.[1] ?? 0) - Number(a.basename.match(/^(\d+)-/)?.[1] ?? 0) || b.path.localeCompare(a.path));
			const active = app.workspace?.getActiveFile?.();
			const handoff = handoffs.find(file => file.path === active?.path) ?? handoffs[0];
			const handoffRef = handoff ? `[[${handoff.path.replace(/\.md$/, "")}]]` : "待选择交接单（先从首页创建，再补关联）";
			const diagnosisRef = app.vault.getAbstractFileByPath(path("diagnosis.md")) instanceof TFile ? `[[${path("diagnosis")}]]` : "尚未建立诊断，请补充实际输入与约束";
			const date = NewNoteUtil.renderTitle("{{date}}");
			const timestamp = new Date().toISOString();
			const metadata = `---\ncreated: ${timestamp}\nproject: ${JSON.stringify(plugin.settings.agentProjectName)}\nstatus: 待填写\n---\n\n`;
			let options: NewNoteOptions;
			if (action === "idea" || action === "draft") {
				const folder = path("codex-handoff");
				const files = (app.vault as App["vault"] & { getMarkdownFiles(): TFile[] }).getMarkdownFiles();
				const numbers = files.filter(file => file.path.startsWith(folder + "/")).map(file => Number(file.path.substring(folder.length + 1).match(/^(\d+)-/)?.[1] ?? 0));
				const number = String(Math.max(0, ...numbers) + 1).padStart(2, "0");
				options = {folderPath: folder, titleTemplate: `${number}-交接单`, conflict: "duplicate", content: metadata + `# ${number} 交接单\n\n关联诊断：${diagnosisRef}\n\n## 锁定输入（只读）\n\n## 允许改动的范围\n\n## 不许动\n\n- 失败原样交回，不换输入、不改锁定提示。\n\n## 步骤\n\n## 交回\n\n| 项目 | 实际结果 | 证据 | 限制 |\n| --- | --- | --- | --- |\n`};
			} else if (action === "acceptance") {
				options = {folderPath: path("验收"), titleTemplate: "01-验收 {{datetime}}", conflict: "duplicate", content: metadata + `# 本单验收\n\n关联交接：${handoffRef}\n\n## 逐条核对\n\n证据必须是能点开的库内文件链接；缺失、无法解析或不存在都不算挂证据。\n\n| 项目 | 实际结果 | 状态 | 证据 | 限制 |\n| --- | --- | --- | --- | --- |\n| 本单实测 | 待核对 | 待验收 |  |  |\n\n## 结论\n\n尚未验收，不据此宣称通过。\n`};
			} else {
				const existing = app.vault.getAbstractFileByPath(path(`项目日志/${date}.md`));
				if (existing instanceof TFile) {
					await app.vault.append(existing, `\n## ${timestamp} · 新决定\n\n关联交接：${handoffRef}\n\n`);
					await app.workspace?.getLeaf(false).openFile(existing);
					return existing;
				}
				options = {folderPath: path("项目日志"), titleTemplate: date, conflict: "open", content: metadata + `# ${date} 项目日志\n\n关联交接：${handoffRef}\n\n## ${timestamp} · 决定\n\n`};
			}
			return await NewNoteUtil.createNote(app, plugin, options);
		} catch (error) { new Notice("创建失败：请检查本期目录与权限。"); console.error(error); return null; }
	}

	private static async createNow(app: App, plugin: StartPagePlugin, action: CreatorAction): Promise<TFile | null> {
		if (plugin.settings.contentProjectFolder) return this.createContentNote(app, plugin, action);
		const date = NewNoteUtil.renderTitle("{{date}}");
		const project = plugin.settings.agentProjectName?.trim();
		if (!project) { new Notice(t("agent_project_required")); return null; }
		const safeName = project.replace(/[\\/:*?"<>|\[\]\r\n]/g, "_");
		const demandLink = `[[${plugin.settings.creatorInboxFolder}/${safeName}—项目需求]]`;
		const planLink = `[[${plugin.settings.creatorDraftFolder}/${safeName}—搭建方案]]`;
		const options: Record<CreatorAction, NewNoteOptions> = {
			idea: {
				titleTemplate: `${safeName}—项目需求`,
				folderPath: plugin.settings.creatorInboxFolder,
				conflict: "open",
				content: `---\nstatus: 待澄清\ncreated: ${date}\n---\n\n## 业务目标\n\n\n## 用户原话与资料来源\n\n\n## 要回答的问题\n\n\n## 要执行的动作\n\n\n## 已确认的限制\n\n\n## 待补充的信息\n\n`,
			},
			draft: {
				titleTemplate: `${safeName}—搭建方案`,
				folderPath: plugin.settings.creatorDraftFolder,
				conflict: "open",
				content: `---\nstatus: 草稿\ncreated: ${date}\n---\n\n## 关联需求\n\n\n## 业务目标\n\n\n## 正文\n\n### 知识与来源\n\n\n### 工具与接口\n\n\n### 任务流程\n\n\n### 权限和异常处理\n\n\n## 验收依据\n\n\n## 待确认与下一步\n\n`,
			},
			acceptance: {
				titleTemplate: `${safeName}—验收清单 {{datetime}}`,
				folderPath: plugin.settings.creatorAcceptanceFolder,
				conflict: "duplicate",
				content: `---\nstatus: 待联调\ncreated: ${date}\n---\n\n## 关联需求与方案\n\n\n## 验收用例\n\n| 用例 | 输入 | 预期行为 | 实际结果 | 状态 |\n| --- | --- | --- | --- | --- |\n| 知识问答 |  |  | 尚未运行 | 待测试 |\n| 工具调用 |  |  | 尚未运行 | 待测试 |\n| 异常处理 |  |  | 尚未运行 | 待测试 |\n\n## 本次结论\n\n尚未联调，不能据此判断智能体已通过验收。\n\n## 未通过项与下一步\n\n`,
			},
			daily: {
				titleTemplate: `${safeName}—{{date}}`,
				folderPath: plugin.settings.creatorDailyFolder,
				conflict: "open",
				content: `# ${date}\n\n## 关联项目\n\n\n## 今日进展\n\n\n## 已确认的决定\n\n\n## 待联调或待补充\n\n- [ ] \n`,
			},
		};
		for (const item of Object.values(options)) {
			item.content = item.content?.replace(/created: ([^\n]+)\n---/, `created: $1\nproject: ${JSON.stringify(project)}\n---`);
		}
		options.draft.content = options.draft.content?.replace("## 关联需求\n\n", `## 关联需求\n\n${demandLink}\n\n`);
		options.acceptance.content = options.acceptance.content?.replace("## 关联需求与方案\n\n", `## 关联需求与方案\n\n${demandLink} · ${planLink}\n\n`);
		options.daily.content = options.daily.content?.replace("## 关联项目\n\n", `## 关联项目\n\n${project}\n\n${demandLink} · ${planLink}\n\n`);
		try {
			return await NewNoteUtil.createNote(app, plugin, options[action]);
		} catch (error) {
			new Notice(t("creator_failed"));
			console.error("StartPage creator action failed:", error);
			return null;
		}
	}
}
