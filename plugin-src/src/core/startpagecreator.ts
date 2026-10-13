import { ID_STAT_TOTAL_NOTES, ID_STAT_TODAY_EDITED, ID_STAT_TOTAL_SIZE } from "@/types";
import { App, TFolder, TFile, Menu, Platform, Keymap, WorkspaceLeaf, setIcon, Notice } from "obsidian";
import StartPagePlugin from "@/main";
import { t } from "@/i18n";
import { VIEW_TYPE_START_PAGE, StartPageView } from "@/views/startpageview";
import FooterTextUtil from "@/utils/footertextutil";
import SvgUtil from "@/utils/svgutil";
import { MyUtil } from "@/utils/myutil";
import { NewNoteUtil } from "@/utils/newnoteutil";
import SearchModal from "@/views/searchmodal";
import { projectNotes, phase, missingEvidence } from "@/utils/contentproject";
import { CreatorActions, CreatorAction } from "@/utils/creatoractions";

declare module "obsidian" {
	interface App {
		setting: {
			open(): void;
			openTabById(id: string): void;
		};
	}
}

export default class StartPageCreator {
	private app: App;
	private plugin: StartPagePlugin;
	private container: Element;
	private searchBox: HTMLInputElement;
	private keyHandler: (e: KeyboardEvent) => void;
	private initialQuery: string = "";
	private creatorFilterId = "recent";
	private stats = [
		{
			id: ID_STAT_TOTAL_NOTES,
			data: {
				number: 0,
				label: function () {
					return t("total_notes");
				},
			},
		},
		{
			id: ID_STAT_TODAY_EDITED,
			data: {
				number: 0,
				label: function () {
					return t("today_edited");
				},
			},
		},
		{
			id: ID_STAT_TOTAL_SIZE,
			data: {
				number: "0",
				label: function () {
					return t("total_size");
				},
			},
		},
	];
		private pinnedNotes: TFile[] | null = null;
		private recentNotes: TFile[] | null = null;
		private tabFolderItems: { folderPath: string; folderName: string; files: TFile[] }[] | null = null;

		constructor(app: App, plugin: StartPagePlugin, container: Element) {
		this.app = app;
		this.plugin = plugin;
		this.container = container;
	}

		public async createStartPage(
			pinnedNotes: TFile[] | null, 
			recentNotes: TFile[] | null,
			tabFolderItems?: { folderPath: string; folderName: string; files: TFile[] }[] | null
		): Promise<void> {
			this.initData(pinnedNotes, recentNotes, tabFolderItems || null);
		this.removeKeyListener();

		this.container.empty();
		this.container.addClass("start-page-container");
		this.container.classList.toggle("creator-mode", this.plugin.settings.creatorMode);
		if (this.plugin.settings.creatorMode) {
			if (this.plugin.settings.contentProjectFolder) await this.createContentWorkbench();
			else this.createCreatorWorkbench();
			this.setupKeyListener();
			(this.container as HTMLElement).tabIndex = -1;
			return;
		}

		const header = this.createHeader();
		const mainContent = this.createMainContent();
		const footer = await this.createFooter();

		this.container.appendChild(header);
		this.container.appendChild(mainContent);
		this.container.appendChild(footer);

		if (!this.plugin.settings.creatorMode) {
			const newNoteBtn = this.createNewNoteButton();
			this.container.appendChild(newNoteBtn);
		}

		this.setupKeyListener();

		(this.container as HTMLElement).tabIndex = -1;
	}

	public focusContainer(): void {
		(this.container as HTMLElement).focus();
	}

	// The workbench reuses StartPage's search, note opening and creation utilities.
	private createCreatorWorkbench(): void {
		const zh = this.plugin.settings.displayLanguage === "zh" ||
			(this.plugin.settings.displayLanguage === "auto" && t("creator_idea") === "记录需求");
		const text = (cn: string, en: string) => zh ? cn : en;
		const root = this.createElement("div", "cw-workbench");
		this.container.appendChild(root);
		const top = root.createEl("header", { cls: "cw-topbar" });
		const brand = top.createDiv({ cls: "cw-brand" });
		setIcon(brand.createSpan({ cls: "cw-brand-icon" }), "notebook-pen");
		brand.createSpan({ text: text("智能体项目台", "Agent project desk") });
		const tools = top.createDiv({ cls: "cw-top-tools" });
		const search = this.workbenchButton(tools, text("搜索项目资料", "Search project notes"), "search", "cw-search");
		search.addEventListener("click", () => this.showSearchModal());
		const settings = this.workbenchButton(tools, text("设置", "Settings"), "settings-2", "cw-icon-button");
		settings.addEventListener("click", () => {
			this.app.setting.open();
			this.app.setting.openTabById(this.plugin.manifest.id);
		});

		const intro = root.createDiv({ cls: "cw-intro" });
		intro.createEl("p", { cls: "cw-date", text: new Date().toLocaleDateString(zh ? "zh-CN" : "en-US", { month: "long", day: "numeric", weekday: "long" }) });
		intro.createEl("p", { cls: "cw-current-project", text: text("当前项目：", "Current project: ") + (this.plugin.settings.agentProjectName || text("尚未选择", "Not selected")) });
		intro.createEl("h1", { text: text("从需求，到搭建方案。", "From request to agent plan.") });
		intro.createEl("p", { cls: "cw-subtitle", text: text("需求、方案、验收记录，都能接着做。", "Keep requirements, plans and acceptance together.") });
		const actions = this.createCreatorActions();
		actions.classList.add("cw-actions");
		const icons = ["plus", "square-pen", "clipboard-check"];
		actions.querySelectorAll<HTMLButtonElement>("button").forEach((button, i) => {
			const icon = document.createElement("span");
			icon.className = "cw-action-icon";
			setIcon(icon, icons[i]);
			button.prepend(icon);
		});
		intro.appendChild(actions);

		const layout = root.createDiv({ cls: "cw-layout" });
		const library = layout.createEl("section", { cls: "cw-library", attr: { "aria-label": text("项目资料", "Project notes") } });
		const libraryHeader = library.createDiv({ cls: "cw-section-heading" });
		libraryHeader.createEl("h2", { text: text("继续推进", "Continue the project") });
		const organize = this.workbenchButton(libraryHeader, text("整理资料", "Organize"), "list-filter", "cw-text-button");
		organize.addEventListener("click", () => { void this.openNavigator(this.plugin.settings.creatorInboxFolder); });
		const filters = library.createDiv({ cls: "cw-filters", attr: { role: "tablist", "aria-label": text("筛选笔记", "Filter notes") } });
		const list = library.createDiv({ cls: "cw-note-list", attr: { role: "tabpanel", id: "cw-note-panel" } });
		const allNotes = this.app.vault.getMarkdownFiles();
		const items = [
			{ id: "recent", label: text("最近", "Recent"), notes: this.recentNotes ?? [] },
			{ id: "pinned", label: text("置顶", "Pinned"), notes: this.pinnedNotes ?? [] },
			...(this.tabFolderItems ?? []).map((folder) => ({ id: folder.folderPath, label: folder.folderName.replace(/^\d+\s*/, ""), notes: folder.files })),
		];
		const buttons: HTMLButtonElement[] = [];
		const render = (index: number) => {
			this.creatorFilterId = items[index].id;
			buttons.forEach((button, i) => { button.classList.toggle("is-active", i === index); button.setAttribute("aria-selected", String(i === index)); button.tabIndex = i === index ? 0 : -1; });
			list.empty();
			list.setAttribute("aria-labelledby", `cw-filter-${index}`);
			const notes = items[index].notes;
			if (!notes.length) {
				list.createEl("p", { cls: "cw-empty", text: text("这里还没有资料。先记录一条需求吧。", "Capture a requirement to get started.") });
			}
			for (const note of notes) {
				const row = this.createNoteItem(note, items[index].id === "pinned");
				if (!row) continue;
				row.classList.add("cw-note-row");
				row.setAttribute("role", "button");
				row.setAttribute("aria-label", text("打开 ", "Open ") + note.basename);
				row.tabIndex = 0;
				row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); row.click(); } });
				setIcon(row.createSpan({ cls: "cw-row-arrow", attr: { "aria-hidden": "true" } }), "arrow-up-right");
				list.appendChild(row);
			}
		};
		items.forEach((item, index) => {
			const button = filters.createEl("button", { cls: "cw-filter", text: item.label, attr: { role: "tab", id: `cw-filter-${index}`, "aria-controls": "cw-note-panel" } });
			button.dataset.filter = item.id;
			buttons.push(button);
			button.addEventListener("click", () => render(index));
			button.addEventListener("keydown", (event) => {
				let next = index;
				if (event.key === "ArrowRight") next = (index + 1) % items.length;
				else if (event.key === "ArrowLeft") next = (index + items.length - 1) % items.length;
				else if (event.key === "Home") next = 0;
				else if (event.key === "End") next = items.length - 1;
				else return;
				event.preventDefault(); render(next); buttons[next].focus();
			});
		});
		render(Math.max(0, items.findIndex(item => item.id === this.creatorFilterId)));

		const aside = layout.createEl("aside", { cls: "cw-aside" });
		const daily = aside.createEl("section", { cls: "cw-daily" });
		daily.createEl("h2", { text: text("项目日志", "Project log") });
		daily.createEl("p", { text: text("当天的决定与进展，随时继续记。", "Continue today’s decisions and progress.") });
		const dailyButton = this.workbenchButton(daily, text("打开项目日志", "Open project log"), "arrow-right", "cw-daily-button");
		dailyButton.addEventListener("click", () => { void this.createAndOpen("daily", dailyButton); });
		const folders = aside.createEl("section", { cls: "cw-folder-section" });
		folders.createEl("h2", { text: text("项目文件", "Project files") });
		const folderEntries = [
			{ path: this.plugin.settings.creatorInboxFolder, label: text("需求", "Requirements"), icon: "lightbulb" },
			{ path: this.plugin.settings.creatorDraftFolder, label: text("方案", "Plans"), icon: "square-pen" },
			...(this.tabFolderItems ?? []).filter(item => item.folderPath !== this.plugin.settings.creatorInboxFolder && item.folderPath !== this.plugin.settings.creatorDraftFolder).map(item => ({ path: item.folderPath, label: item.folderName.replace(/^\d+\s*/, ""), icon: "clipboard-list" })),
		];
		folderEntries.forEach((folder) => {
			const button = this.workbenchButton(folders, folder.label, folder.icon, "cw-folder-link");
			const count = allNotes.filter(note => note.path.startsWith(folder.path + "/")).length;
			button.createSpan({ cls: "cw-folder-count", text: String(count) });
			button.dataset.folderPath = folder.path;
			button.addEventListener("click", () => { void this.openNavigator(folder.path); });
		});
		const help = aside.createEl("section", { cls: "cw-help" });
		help.createEl("h2", { text: text("第一次使用？", "New here?") });
		help.createEl("p", { text: text("了解项目资料、验收清单与入口设置。", "Learn project notes, acceptance and settings.") });
		const guide = this.workbenchButton(help, text("查看使用说明", "Read the guide"), "arrow-up-right", "cw-text-button");
		guide.addEventListener("click", () => {
			const file = this.app.vault.getAbstractFileByPath("开始使用.md");
			if (file instanceof TFile) void this.app.workspace.getLeaf("tab").openFile(file);
			else { this.app.setting.open(); this.app.setting.openTabById(this.plugin.manifest.id); }
		});
	}

	private async createContentWorkbench(): Promise<void> {
		const notes = projectNotes(this.app, this.plugin.settings);
		const acceptance = notes.filter(note=>phase(note.path) === 4);
		const counts = await Promise.all(acceptance.map(async file => missingEvidence(await this.app.vault.cachedRead(file), target=>{
			const resolved = this.app.metadataCache.getFirstLinkpathDest(target, file.path);
			return resolved instanceof TFile;
		})));
		const missing = counts.reduce((sum,count)=>sum+count,0);
		const root = this.container.createDiv({cls:"cw-workbench"});
		const top = root.createEl("header",{cls:"cw-topbar"});
		top.createDiv({cls:"cw-brand",text:"内容智能体项目台"});
		const tools = top.createDiv({cls:"cw-top-tools"});
		const search = this.workbenchButton(tools,"搜索本期文档","search","cw-search");
		search.addEventListener("click",()=>this.showSearchModal());
		const settings = this.workbenchButton(tools,"设置","settings-2","cw-icon-button");
		settings.addEventListener("click",()=>{this.app.setting.open();this.app.setting.openTabById(this.plugin.manifest.id);});
		const intro = root.createDiv({cls:"cw-intro"});
		intro.createEl("p",{cls:"cw-date",text:new Date().toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai",month:"long",day:"numeric",weekday:"long"})});
		intro.createEl("p",{cls:"cw-current-project",text:`当前这期：${this.plugin.settings.agentProjectName}`});
		intro.createEl("h1",{text:"AI 交回，接着核对。"});
		intro.createEl("p",{cls:"cw-subtitle",text:"选题 → 诊断 → 交接 → 交回 → 验收 → 口播 → 审核"});
		const found = ["选题","诊断","交接","交回","验收","口播","审核"].filter((_,index)=>notes.some(file=>phase(file.path)===index));
		intro.createEl("p",{text:`已存在：${found.join("、") || "暂无关卡文件"}。${this.plugin.settings.contentStage || "阶段以交接单为准"}；文件存在不代表验收通过。`});
		const actions = intro.createDiv({cls:"creator-actions cw-actions"});
		([{action:"idea",label:"写交接单",description:"锁定输入、范围与交回要求",icon:"square-pen"},{action:"acceptance",label:"登记验收",description:"每个结果都挂证据",icon:"clipboard-check"},{action:"daily",label:"记一条决定",description:"按天追加到项目日志",icon:"notebook-pen"}] as const).forEach(item=>{
			const button=this.workbenchButton(actions,item.label,item.icon,"creator-action");
			button.createSpan({cls:"creator-action-description",text:item.description});
			button.addEventListener("click",()=>{void this.createAndOpen(item.action,button);});
		});
		const layout = root.createDiv({cls:"cw-layout"});
		const section=layout.createEl("section",{cls:"cw-library"});
		section.createEl("h2",{text:"继续推进"});
		section.createEl("p",{text:"仅本期文档 · 按工作顺序 · 显示实际创建时间"});
		const list=section.createDiv({cls:"cw-note-list"});
		for (const file of notes) {
			const row=this.createNoteItem(file); if (!row) continue;
			row.classList.add("cw-note-row"); row.setAttribute("role","button"); row.setAttribute("aria-label",`打开 ${file.basename}`); row.tabIndex=0;
			row.querySelector(".note-date")?.remove();
			row.createSpan({cls:"note-date",text:`创建 ${new Date(file.stat.ctime).toLocaleString("zh-CN",{timeZone:"Asia/Shanghai",hour12:false})}`});
			row.addEventListener("keydown",event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();row.click();}});
			list.appendChild(row);
		}
		const aside=layout.createEl("aside",{cls:"cw-aside"});
		const check=aside.createEl("section",{cls:"cw-daily"});
		check.createEl("h2",{text:"验收证据"});
		check.createEl("p",{cls:"cw-evidence-status",text:`${missing} 条没挂证据`});
		check.createEl("p",{text:"缺失链接、无效链接、找不到文件，都计入提醒。"});
		check.createEl("p",{text:"Claude 拆选题 → Codex 执行交回 → 独立审核 → 数据账本"});
		const organize=this.workbenchButton(check,"打开本期文档","list-filter","cw-daily-button");
		organize.addEventListener("click",()=>{void this.openNavigator(this.plugin.settings.contentProjectFolder.replace(/^\/+|\/+$/g,""));});
	}

	private workbenchButton(parent: HTMLElement, label: string, icon: string, cls: string): HTMLButtonElement {
		const button = parent.createEl("button", { cls, attr: { "aria-label": label, title: label } });
		setIcon(button.createSpan({ cls: "cw-button-icon", attr: { "aria-hidden": "true" } }), icon);
		button.createSpan({ cls: "cw-button-label", text: label });
		return button;
	}

	private async openNavigator(folder: string): Promise<void> {
		const host = this.app as App & { plugins?: { getPlugin(id: string): unknown } };
		try {
			if (host.plugins?.getPlugin("notebook-navigator") && this.app.vault.getAbstractFileByPath(folder) instanceof TFolder) {
				const leaves = this.app.workspace.getLeavesOfType("notebook-navigator");
				let leaf = leaves.find(item => item.getRoot() === this.app.workspace.rootSplit);
				if (!leaf) {
					leaf = this.app.workspace.getLeaf("tab");
					await leaf.setViewState({ type: "notebook-navigator", active: true });
				}
				const view = leaf.view as typeof leaf.view & { whenReady(): Promise<boolean>; navigateToFolder(path: string): boolean };
				await view.whenReady();
				await this.app.workspace.revealLeaf(leaf);
				if (Platform.isDesktop) this.app.workspace.leftSplit.collapse();
				if (view.navigateToFolder(folder)) return;
			}
			new Notice(t("creator_navigator_missing"));
		} catch (error) {
			new Notice(t("creator_navigator_missing"));
			console.error("StartPage could not open Navigator", error);
		}
	}

	public destroy(): void {
		this.removeKeyListener();
	}

		private initData(
			pinnedNotes: TFile[] | null, 
			recentNotes: TFile[] | null,
			tabFolderItems: { folderPath: string; folderName: string; files: TFile[] }[] | null = null
		): void {
			this.pinnedNotes = pinnedNotes;
			this.recentNotes = recentNotes;
			this.tabFolderItems = tabFolderItems;

		this.stats.forEach((stat) => {
			if (stat.id === ID_STAT_TOTAL_NOTES) {
				stat.data.number = this.app.vault.getMarkdownFiles().length;
			} else if (stat.id === ID_STAT_TODAY_EDITED) {
				stat.data.number = this.getTodayModifiedNoteCount();
			} else if (stat.id === ID_STAT_TOTAL_SIZE) {
				stat.data.number = MyUtil.formatSize(this.getTotalSize());
			}
		});
	}

	public async updateNoteModifiedTimes(notes: TFile[]) {
		if (this.plugin.settings.contentProjectFolder) return;
		for (const note of notes) {
			const noteElement = this.container.querySelector(`[data-note-path="${note.path}"] .note-date`);
			if (noteElement) {
				const formattedDate = MyUtil.formatDate(note.stat.mtime);
				noteElement.textContent = formattedDate;
			}
		}
	}

	private createHeader(): HTMLElement {
		const header = this.createElement("header", "header");

		const logo = this.createElement("div", "logo");
		const logoIcon = SvgUtil.createLogoIcon();
		const logoText = this.createElement("span", "logo-text", this.plugin.settings.creatorMode ? t("creator_title") : "Start Page for Obsidian");

		this.searchBox = this.createElement("input", "search-box", "") as HTMLInputElement;
		this.searchBox.type = "text";
		this.searchBox.placeholder = t("search_placeholder");
		this.searchBox.addEventListener("click", (e) => {
			this.showSearchModal();
		});
		
		this.searchBox.addEventListener("focus", (e) => {
			(e.target as HTMLInputElement).blur();
		});

		const searchBoxContainer = this.createElement("div", "search-box-container");
		searchBoxContainer.appendChild(this.searchBox);

		logo.appendChild(logoIcon);
		logo.appendChild(logoText);
		logo.appendChild(searchBoxContainer);

		const headerActions = this.createElement("div", "header-actions");

			const manageBtn = this.createElement("button", "manage-btn");
			manageBtn.setAttribute("title", t("manage"));
			manageBtn.appendChild(SvgUtil.createSettingsIcon());
			manageBtn.addEventListener("click", () => {
				const setting = this.app.setting;
				setting.open();

				window.setTimeout(() => {
					setting.openTabById(this.plugin.manifest.id);
				}, 100);
			});
			headerActions.appendChild(manageBtn);

			if (this.hasUpdate()) {
			const updateBadge = this.createUpdateBadge();
			headerActions.appendChild(updateBadge);
		}

		header.appendChild(logo);
		header.appendChild(headerActions);

		return header;
	}

	private createStatsSection(): HTMLElement {
		const statsSection = this.createElement("div", "stats-section");

		this.stats.forEach((stat) => {
			const statCard = this.createElement("div", "stat-card");
			const statIcon = this.createElement("div", "stat-icon");
			const svg = SvgUtil.createStatIcon(stat.id);
			statIcon.appendChild(svg!);

			const statContent = this.createElement("div", "stat-content");
			const statNumber = this.createElement("div", "stat-number", stat.data.number.toString());
			const statLabel = this.createElement("div", "stat-label", stat.data.label());

			statContent.appendChild(statNumber);
			statContent.appendChild(statLabel);
			statCard.appendChild(statIcon);
			statCard.appendChild(statContent);
			statsSection.appendChild(statCard);

			statCard.addEventListener("click", () => {
				this.showSearchModal();
			});
		});

		return statsSection;
	}

	private createNoteItem(note: TFile | null, isPinned: boolean = false): HTMLElement | null {
		if (!note) {
			return null;
		}

		const styleSettings = isPinned ? this.plugin.settings.pinnedNotesStyle : this.plugin.settings.recentNotesStyle;

		const noteItem = this.createElement("div", `note-item${isPinned ? " pinned" : ""}`);
		noteItem.setAttribute("data-note-path", note.path);
		
		if (styleSettings.itemPadding) noteItem.style.padding = styleSettings.itemPadding;
		if (styleSettings.itemMargin) noteItem.style.margin = styleSettings.itemMargin;

		noteItem.addEventListener("click", async (event: MouseEvent) => {
				const modResult = Keymap.isModEvent(event);

				const newLeaf = modResult || (this.plugin.settings.openNotesInNewTab ? "tab" : false);

				if (newLeaf) {
					this.app.workspace.openLinkText(note.path, "", newLeaf);
				} else {
					const existingLeaf = this.findOpenLeaf(note.path);

					if (existingLeaf) {
						await this.app.workspace.revealLeaf(existingLeaf);
					} else {
						this.app.workspace.openLinkText(note.path, "", false);
					}
				}
			});

			noteItem.addEventListener("mousedown", (event: MouseEvent) => {
				if (event.button === 1) {
					event.preventDefault();
					event.stopPropagation();
				}
			});

			noteItem.addEventListener("mouseup", (event: MouseEvent) => {
				if (event.button === 1) {
					event.preventDefault();
					event.stopPropagation();
					this.app.workspace.openLinkText(note.path, "", "tab");
				}
			});

		noteItem.addEventListener("mouseenter", (event) => {
			this.app.workspace.trigger("hover-link", {
				event: event,
				source: VIEW_TYPE_START_PAGE,
				hoverParent: noteItem,
				targetEl: noteItem,
				linktext: note.path,
				sourcePath: "",
			});
		});

		if (isPinned) {
			noteItem.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				event.stopPropagation();

				const menu = new Menu();
				menu.addItem((item) => {
					item.setTitle(t("remove_from_pinned_notes"))
						.setIcon("pin-off")
						.onClick(async () => {
							this.plugin.settings.pinnedNotes = this.plugin.settings.pinnedNotes.filter((path) => path !== note.path);
							await this.plugin.saveSettings();

							this.refreshStartPage();
						});
				});

				menu.showAtMouseEvent(event);
			});
		}

		const noteIcon = this.createElement("div", "note-icon");
		const fileType = note.extension;
		const iconSvg = SvgUtil.createFileIcon(fileType);
		noteIcon.appendChild(iconSvg);

		const noteContent = this.createElement("div", "note-content");
		const noteTitle = this.createElement("div", "note-title", note.basename);
		
		if (styleSettings.noteTitleFontSize) noteTitle.style.fontSize = styleSettings.noteTitleFontSize;
		if (styleSettings.noteTitleMargin) noteTitle.style.margin = styleSettings.noteTitleMargin;
		if (styleSettings.noteTitlePadding) noteTitle.style.padding = styleSettings.noteTitlePadding;

		const noteMeta = this.createElement("div", "note-meta", "");

		const noteDate = MyUtil.formatDate(note.stat.mtime);
		let folderPath = note.parent ? note.parent.path : "/";
		if (!folderPath.startsWith("/")) {
			folderPath = "/" + folderPath;
		}
		const noteDateEl = this.createElement("div", "note-date", noteDate);
		if (styleSettings.noteDateFontSize) noteDateEl.style.fontSize = styleSettings.noteDateFontSize;
		
		noteMeta.appendChild(noteDateEl);

		const noteExtEl = this.createElement("div", "note-ext", "." + note.extension);
		noteMeta.appendChild(noteExtEl);

		const folderIcon = SvgUtil.createFolderIcon();
		noteMeta.appendChild(folderIcon);
		
		const noteFolderEl = this.createElement("div", "note-folder", MyUtil.truncateMiddle(folderPath));
		if (styleSettings.noteFolderFontSize) noteFolderEl.style.fontSize = styleSettings.noteFolderFontSize;

		noteMeta.appendChild(noteFolderEl);

		noteTitle.setAttribute("title", note.basename);
		noteContent.appendChild(noteTitle);
		noteContent.appendChild(noteMeta);

		const noteActions = this.createElement("div", "note-actions");
		const editBtn = this.createElement("button", "btn-icon");
		const editIcon = SvgUtil.createEditIcon();
		editBtn.appendChild(editIcon);
		noteActions.appendChild(editBtn);

		noteItem.appendChild(noteIcon);
		noteItem.appendChild(noteContent);
		noteItem.appendChild(noteActions);

		return noteItem;
	}

	private createNotesSection(title: string, notes: TFile[] | null, isPinned: boolean = false, icon: SVGSVGElement): HTMLElement {
		const styleSettings = isPinned ? this.plugin.settings.pinnedNotesStyle : this.plugin.settings.recentNotesStyle;

		const section = this.createElement("section", "section");
		if (styleSettings.sectionMargin) section.style.margin = styleSettings.sectionMargin;
		if (styleSettings.sectionPadding) section.style.padding = styleSettings.sectionPadding;

		const sectionHeader = this.createElement("div", "section-header");
		if (styleSettings.headerMargin) sectionHeader.style.margin = styleSettings.headerMargin;
		if (styleSettings.headerPadding) sectionHeader.style.padding = styleSettings.headerPadding;

			const sectionTitle = this.createElement("h2", "section-title");
			sectionTitle.appendChild(icon);
			sectionTitle.appendChild(document.createTextNode(title));
			if (isPinned && notes) {
				const countBadge = this.createElement("span", "note-count-badge", `${notes.length}`);
				sectionTitle.appendChild(countBadge);
			}
			if (styleSettings.titleFontSize) sectionTitle.style.fontSize = styleSettings.titleFontSize;
			if (styleSettings.titleMargin) sectionTitle.style.margin = styleSettings.titleMargin;
			if (styleSettings.titlePadding) sectionTitle.style.padding = styleSettings.titlePadding;

			if (isPinned) {
				sectionHeader.appendChild(sectionTitle);
			} else {
			const dropdownDiv = this.createRecentNotesLimitDropdown();
			sectionHeader.appendChild(sectionTitle);
			sectionHeader.appendChild(dropdownDiv);
		}

		const notesList = this.createElement("div", "notes-list");
		if (styleSettings.listGap) notesList.style.gap = styleSettings.listGap;

		if (notes) {
			notes.forEach((note) => {
				const noteItem = this.createNoteItem(note, isPinned);
				if (noteItem) {
					notesList.appendChild(noteItem);
				}
			});
		}

		section.appendChild(sectionHeader);
		section.appendChild(notesList);

		return section;
	}

		private createContentGrid(): HTMLElement {
			const contentGrid = this.createElement("div", "content-grid");

			const tabContainer = this.createTabContainer();
			tabContainer.classList.add("pinned-notes");

			const recentSection = this.createNotesSection(t("recent_notes"), this.recentNotes, false, SvgUtil.createRecentNoteIcon());
			recentSection.classList.add("recent-notes");

			contentGrid.appendChild(tabContainer);
			contentGrid.appendChild(recentSection);

			return contentGrid;
		}

		private createTabContainer(): HTMLElement {
			const tabs = this.buildTabItems();
			const container = this.createElement("div", "tab-container");

			// Tab bar
			const bar = this.createElement("div", "tab-bar");

			const scrollLeft = this.createElement("button", "tab-scroll-btn");
			scrollLeft.appendChild(SvgUtil.createChevronLeftIcon());
			bar.appendChild(scrollLeft);

			const tabList = this.createElement("div", "tab-list");
			tabs.forEach((tab, i) => {
				const tabItem = this.createElement("div", `tab-item${i === 0 ? " active" : ""}`);
				tabItem.dataset.tabIndex = i.toString();

				const label = this.createElement("span", "tab-item-label", tab.label);
				tabItem.appendChild(label);

				if (tab.closable) {
					const closeBtn = this.createElement("button", "tab-close-btn");
					closeBtn.appendChild(SvgUtil.createCloseIcon());
					closeBtn.addEventListener("click", (e) => {
						e.stopPropagation();
						if (tab.folderPath) {
							this.plugin.settings.tabFolderPaths =
								this.plugin.settings.tabFolderPaths.filter((p) => p !== tab.folderPath);
							this.plugin.saveSettings();
							this.refreshStartPage();
						}
					});
					tabItem.appendChild(closeBtn);
				}

				tabItem.addEventListener("click", () => {
					this.switchTab(i);
				});

				tabList.appendChild(tabItem);
			});
			bar.appendChild(tabList);

			const scrollRight = this.createElement("button", "tab-scroll-btn");
			scrollRight.appendChild(SvgUtil.createChevronRightIcon());
			bar.appendChild(scrollRight);

			container.appendChild(bar);

			// Content panels
			const contentWrapper = this.createElement("div", "tab-content-wrapper");
			tabs.forEach((tab, i) => {
				const panel = this.createElement("div", `tab-panel${i === 0 ? " active" : ""}`);
				panel.dataset.tabIndex = i.toString();
				if (i === 0) {
					// Pinned notes tab — reuse createNotesSection with isPinned=true for the "Manage" button
					const section = this.createNotesSection(t("pinned_notes"), this.pinnedNotes, true, SvgUtil.createPinnedNoteIcon());
					panel.appendChild(section);
				} else {
					// Folder tab — use folder-specific panel
					const section = this.createFolderTabPanel(tab.label, tab.notes);
					panel.appendChild(section);
				}
				contentWrapper.appendChild(panel);
			});
			container.appendChild(contentWrapper);

			// Set up scroll button visibility
			const updateButtons = () => {
				this.updateScrollButtons(tabList, scrollLeft, scrollRight);
			};

			const resizeObserver = new ResizeObserver(updateButtons);
			resizeObserver.observe(tabList);

			tabList.addEventListener("scroll", updateButtons);
			scrollLeft.addEventListener("click", () => {
				tabList.scrollBy({ left: -150, behavior: "smooth" });
			});
			scrollRight.addEventListener("click", () => {
				tabList.scrollBy({ left: 150, behavior: "smooth" });
			});

			return container;
		}

		private buildTabItems(): { id: string; label: string; notes: TFile[]; closable: boolean; folderPath?: string }[] {
			const tabs: { id: string; label: string; notes: TFile[]; closable: boolean; folderPath?: string }[] = [
				{
					id: "pinned",
					label: t("tab_pinned"),
					notes: this.pinnedNotes || [],
					closable: false,
				},
			];

			if (this.tabFolderItems) {
				for (const item of this.tabFolderItems) {
					tabs.push({
						id: `folder-${item.folderPath}`,
						label: item.folderName,
						notes: item.files,
						closable: true,
						folderPath: item.folderPath,
					});
				}
			}

			return tabs;
		}

		private createFolderTabPanel(title: string, notes: TFile[]): HTMLElement {
			const styleSettings = this.plugin.settings.pinnedNotesStyle;

			const section = this.createElement("section", "section");
			if (styleSettings.sectionMargin) section.style.margin = styleSettings.sectionMargin;
			if (styleSettings.sectionPadding) section.style.padding = styleSettings.sectionPadding;

			const sectionHeader = this.createElement("div", "section-header");
			if (styleSettings.headerMargin) sectionHeader.style.margin = styleSettings.headerMargin;
			if (styleSettings.headerPadding) sectionHeader.style.padding = styleSettings.headerPadding;

			const sectionTitle = this.createElement("h2", "section-title");
				const folderIcon = SvgUtil.createFolderIcon();
				sectionTitle.appendChild(folderIcon);
				sectionTitle.appendChild(document.createTextNode(title));
				if (notes) {
					const countBadge = this.createElement("span", "note-count-badge", `${notes.length}`);
					sectionTitle.appendChild(countBadge);
				}

			sectionHeader.appendChild(sectionTitle);

			const notesList = this.createElement("div", "notes-list");
			if (styleSettings.listGap) notesList.style.gap = styleSettings.listGap;

			if (notes) {
				for (const note of notes) {
					const noteItem = this.createNoteItem(note, false);
					if (noteItem) {
						notesList.appendChild(noteItem);
					}
				}
			}

			section.appendChild(sectionHeader);
			section.appendChild(notesList);

			return section;
		}

		private switchTab(index: number) {
			const tabContainer = this.container.querySelector(".tab-container");
			if (!tabContainer) return;

			tabContainer.querySelectorAll(".tab-item").forEach((el, i) => {
				el.classList.toggle("active", i === index);
			});

			tabContainer.querySelectorAll(".tab-panel").forEach((el, i) => {
				el.classList.toggle("active", i === index);
			});
		}

		private updateScrollButtons(tabList: HTMLElement, scrollLeft: HTMLElement, scrollRight: HTMLElement) {
			const hasOverflow = tabList.scrollWidth > tabList.clientWidth + 2;
			scrollLeft.classList.toggle("hidden", !hasOverflow || tabList.scrollLeft <= 1);
			scrollRight.classList.toggle("hidden", !hasOverflow || tabList.scrollLeft >= tabList.scrollWidth - tabList.clientWidth - 2);
		}

		private createMainContent(): HTMLElement {
		const mainContent = this.createElement("main", "main-content");
		if (this.plugin.settings.creatorMode) {
			mainContent.appendChild(this.createCreatorActions());
		}

		if (this.plugin.settings.showStatBar) {
			const statsSection = this.createStatsSection();
			mainContent.appendChild(statsSection);
		}

		const contentGrid = this.createContentGrid();
		mainContent.appendChild(contentGrid);

		return mainContent;
	}

	private createCreatorActions(): HTMLElement {
		const section = this.createElement("section", "creator-actions");
		section.setAttribute("aria-label", t("creator_actions"));
		const actions: { action: CreatorAction; label: string; description: string }[] = [
			{ action: "idea", label: t("creator_idea"), description: t("creator_idea_desc") },
			{ action: "draft", label: t("creator_draft"), description: t("creator_draft_desc") },
			{ action: "acceptance", label: t("creator_acceptance"), description: t("creator_acceptance_desc") },
		];
		for (const item of actions) {
			const button = this.createElement("button", "creator-action") as HTMLButtonElement;
			button.dataset.creatorAction = item.action;
			button.appendChild(this.createElement("span", "creator-action-title", item.label));
			button.appendChild(this.createElement("span", "creator-action-description", item.description));
			button.addEventListener("click", async () => {
				if (button.disabled) return;
				button.disabled = true;
				try {
					const file = await CreatorActions.create(this.app, this.plugin, item.action);
					if (file) {
						const existing = this.findOpenLeaf(file.path);
						if (existing) await this.app.workspace.revealLeaf(existing);
						else await this.app.workspace.getLeaf("tab").openFile(file);
					}
				} finally {
					button.disabled = false;
				}
			});
			section.appendChild(button);
		}
		return section;
	}

	private async createAndOpen(action: CreatorAction, button: HTMLButtonElement): Promise<void> {
		if (button.disabled) return;
		button.disabled = true;
		try {
			const file = await CreatorActions.create(this.app, this.plugin, action);
			if (file) {
				const existing = this.findOpenLeaf(file.path);
				if (existing) await this.app.workspace.revealLeaf(existing);
				else await this.app.workspace.getLeaf("tab").openFile(file);
			}
		} finally { button.disabled = false; }
	}

	private async createFooter(): Promise<HTMLElement> {
		const footer = this.createElement("footer", "footer");

		const love = this.createElement("p", "", t("default_footer_text"));
		footer.appendChild(love);

		this.updateFooterTextAsync(love);

		return footer;
	}

	private async updateFooterTextAsync(footerElement: HTMLElement): Promise<void> {
		try {
			const footerText = await FooterTextUtil.getFooterText(this.plugin);
			footerElement.textContent = footerText;

			if (this.plugin.settings.showCustomFooterText && this.plugin.settings.useRandomFooterText) {
				if (!footerElement.querySelector("#refresh-footer-text")) {
					const refreshSvg = SvgUtil.createRefreshIcon();
					refreshSvg.setAttribute("id", "refresh-footer-text");
					refreshSvg.addEventListener("click", () => {
						this.plugin.settings.todayRandomEnFooterText = "";
						this.plugin.settings.todayRandomZhFooterText = "";
						this.plugin.saveSettings();
						footerElement.textContent = t("loading_footer_text");
						this.updateFooterTextAsync(footerElement);
					});
					footerElement.appendChild(refreshSvg);
				}
			}
		} catch (error) {
			console.error("Failed to load footer text:", error);
		}
	}

	private createNewNoteButton(): HTMLElement {
		const btn = this.createElement("button", "start-page-new-note-btn");
		btn.setAttribute("title", t("new_note"));
		btn.setAttribute("aria-label", t("new_note"));

		const icon = SvgUtil.createNewNoteIcon();
		btn.appendChild(icon);

		btn.addEventListener("click", async () => {
			await this.createNewNote();
		});

		return btn;
	}

	private async createNewNote(): Promise<void> {
		try {
			const newFile = await NewNoteUtil.createNote(this.app, this.plugin);
			if (!newFile) {
				return;
			}

			const existingLeaf = this.findOpenLeaf(newFile.path);
			if (existingLeaf) {
				await this.app.workspace.revealLeaf(existingLeaf);
				return;
			}

			const leaf = this.app.workspace.getLeaf("tab");
			await leaf.openFile(newFile);
		} catch (error) {
			console.error("Failed to create new note:", error);
		}
	}

	private findOpenLeaf(filePath: string): WorkspaceLeaf | null {
		const leaf = this.app.workspace.getLeavesOfType("markdown").find((candidate) => {
			const state = candidate.view.getState();
			return state["file"] === filePath;
		});

		return leaf || null;
	}

	private createElement(tag: string, className: string = "", textContent: string = ""): HTMLElement {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (textContent) element.textContent = textContent;
		return element;
	}

	private refreshStartPage(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_START_PAGE);
		leaves.forEach((leaf) => {
			if (leaf.view instanceof StartPageView) {
				leaf.view.renderContent();
				return;
			}
		});
	}

	private createRecentNotesLimitDropdown(): HTMLDivElement {
		const dropdown = document.createElement("select");

		for (let i = 5; i <= 50; i += 5) {
			const option = document.createElement("option");
			option.value = i.toString();
			option.textContent = i.toString();
			dropdown.appendChild(option);

			if (i === this.plugin.settings.recentNotesLimit) {
				option.selected = true;
			}
		}

		dropdown.addEventListener("change", () => {
			const limit = parseInt(dropdown.value, 10);
			this.plugin.settings.recentNotesLimit = limit;
			this.plugin.saveSettings();
			this.refreshStartPage();
		});

		const label = document.createElement("label");
		label.className = "recent-notes-limit-label";
		label.textContent = t("show_count");
		label.htmlFor = dropdown.id;

		const container = document.createElement("div");
		container.appendChild(label);
		container.appendChild(dropdown);

		return container;
	}

	getTodayModifiedNoteCount(): number {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const markdownFiles: TFile[] = this.app.vault.getMarkdownFiles();

		const count = markdownFiles.filter((file) => {
			const modifiedTime = file.stat.mtime;
			return modifiedTime >= today.getTime();
		}).length;

		return count;
	}

	getTotalSize(): number {
		const allFiles: TFile[] = this.plugin.settings.includeAllFilesInRecent ? this.app.vault.getFiles() : this.app.vault.getMarkdownFiles();

		let totalSize = 0;

		allFiles.forEach((file) => {
			totalSize += file.stat.size;
		});

		return totalSize;
	}

	private setupKeyListener(): void {
		this.keyHandler = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
				return;
			}

			if (e.key.length !== 1) {
				return;
			}

			const target = e.target as Node;
			if (
				target.instanceOf(HTMLInputElement) ||
				target.instanceOf(HTMLTextAreaElement) ||
				target.instanceOf(HTMLSelectElement) ||
				(target.instanceOf(HTMLElement) && target.isContentEditable)
			) {
				return;
			}

			if (document.querySelector('.modal-container')) {
				return;
			}

			this.initialQuery = e.key;
			this.showSearchModal();
			e.preventDefault();
			e.stopPropagation();
		};

		(this.container as HTMLElement).addEventListener("keydown", this.keyHandler);
	}

		private showSearchModal(): void {
			const modal = new SearchModal(
				this.app,
				this.plugin,
				(item: TFile) => {
					const newLeaf = this.plugin.settings.openNotesInNewTab ? "tab" : false;
					this.app.workspace.openLinkText(item.path, "", newLeaf);
				},
				this.initialQuery
			);
		modal.open();
		this.initialQuery = "";
	}

	private removeKeyListener(): void {
		if (this.keyHandler) {
			(this.container as HTMLElement).removeEventListener("keydown", this.keyHandler);
		}
	}

	private hasUpdate(): boolean {
		const currentVersion = this.plugin.manifest.version;
		const latestVersion = this.plugin.settings.latestVersion;
		
		if (!latestVersion) {
			return false;
		}

		const current = currentVersion.split(".").map(Number);
		const latest = latestVersion.split(".").map(Number);

		for (let i = 0; i < Math.max(current.length, latest.length); i++) {
			const c = current[i] || 0;
			const l = latest[i] || 0;
			if (l > c) return true;
			if (l < c) return false;
		}

		return false;
	}

	private createUpdateBadge(): HTMLElement {
		const badge = this.createElement("div", "update-badge");
		badge.setAttribute("title", t("new_version_available"));

		const badgeIcon = this.createElement("span", "update-badge-icon", "🎉");
		const badgeText = this.createElement("span", "update-badge-text", 
			t("update_to_version").replace("{version}", this.plugin.settings.latestVersion));

		badge.appendChild(badgeIcon);
		badge.appendChild(badgeText);

		badge.addEventListener("click", () => {
			const setting = this.app.setting;
			setting.open();

			window.setTimeout(() => {
				setting.openTabById("community-plugins");
			}, 100);
		});

		return badge;
	}
}
