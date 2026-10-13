var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// tests/obsidian-stub.cjs
var require_obsidian_stub = __commonJS({
  "tests/obsidian-stub.cjs"(exports, module2) {
    var moment2 = require("moment");
    var TFolder3 = class {
      constructor(path = "") {
        this.path = path;
      }
      isRoot() {
        return !this.path;
      }
    };
    var TFile4 = class {
      constructor(path, content = "") {
        this.path = path;
        this.basename = path.split("/").pop().replace(/\.md$/, "");
        this.content = content;
      }
    };
    var Notice4 = class {
      constructor(message) {
        Notice4.messages.push(message);
      }
    };
    Notice4.messages = [];
    module2.exports = { moment: moment2, TFolder: TFolder3, TFile: TFile4, Notice: Notice4, normalizePath: (path) => path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\//, "").replace(/\/$/, "") };
  }
});

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  CreatorActions: () => CreatorActions,
  NewNoteUtil: () => NewNoteUtil,
  Notice: () => import_obsidian3.Notice,
  TFile: () => import_obsidian3.TFile,
  TFolder: () => import_obsidian3.TFolder,
  missingEvidence: () => missingEvidence,
  phase: () => phase,
  projectNotes: () => projectNotes
});
module.exports = __toCommonJS(stdin_exports);
var import_obsidian3 = __toESM(require_obsidian_stub());

// src/utils/creatoractions.ts
var import_obsidian2 = __toESM(require_obsidian_stub());

// src/utils/newnoteutil.ts
var import_obsidian = __toESM(require_obsidian_stub());

// locales/en.json
var en_default = {
  language: "Language",
  language_desc: "Select language",
  language_zh: "Chinese",
  language_en: "English",
  start_page: "Agent project desk",
  welcome: "Welcome back \u{1F44B}",
  recent_notes: "Recent notes",
  pinned_notes: "Pinned notes",
  refresh: "Refresh",
  minutes_ago: "{minutes} minutes ago",
  hours_ago: "{hours} hours ago",
  days_ago: "{days} days ago",
  root_folder: "Root folder",
  folder: "Folder",
  file: "File",
  start_page_settings: "Start page settings",
  recent_notes_limit: "Recent notes limit",
  recent_notes_limit_desc: "Set the number of recent modified notes to display on the start page",
  recent_notes_limit_placeholder: "Enter a number",
  pinned_notes_select: "Select pinned notes",
  pinned_notes_select_desc: "Select notes to pin on the start page",
  pinned_notes_select_button: "Select notes",
  pinned_notes_import_from_bookmarks: "Import from bookmarks",
  pinned_notes_import_from_bookmarks_desc: "Import pinned notes from Obsidian bookmarks",
  pinned_notes_import_from_bookmarks_button: "Import bookmarks",
  import_bookmarks_success: "Successfully imported {count} bookmarks",
  import_bookmarks_no_bookmarks: "No bookmarks found",
  import_bookmarks_already_exist: "All bookmarks are already pinned",
  pinned_notes_remove: "Remove",
  pinned_notes_settings: "Pinned notes settings",
  current_pinned_notes: "Current pinned notes",
  current_pinned_notes_desc: "Currently pinned: {0} notes",
  manage_pinned_notes_button: "Manage pinned notes",
  no_pinned_notes: "No pinned notes yet",
  confirm_import_title: "Confirm Import",
  confirm_import_desc: "Are you sure you want to import bookmarks from Obsidian? This will add all bookmarked files to your pinned notes.",
  confirm: "Confirm",
  cancel: "Cancel",
  show_count: "Show count",
  new_note: "New note",
  total_notes: "Total notes",
  today_edited: "Today edited",
  total_size: "Total size",
  manage: "Manage",
  replace_new_tab: "Replace new tab",
  replace_new_tab_desc: "When opening a new tab, replace it with Start Page",
  open_notes_in_new_tab: "Open notes in new tab",
  open_notes_in_new_tab_desc: "Left-click on pinned/recent notes will open them in a new tab instead of replacing the start page. You can always use Ctrl/Cmd+Click or middle-click to open in a new tab regardless of this setting.",
  remove_from_pinned_notes: "Remove from pinned notes",
  add_to_pinned_notes: "Add to pinned notes",
  move_up: "Move up",
  move_down: "Move down",
  open_start_page: "Open start page",
  open_start_page_desc: "Open the start page in current tab",
  open_start_page_new_tab: "Open start page in new tab",
  open_start_page_new_tab_desc: "Open the start page in a new tab",
  include_all_files_in_recent: "Include all files in recent notes",
  include_all_files_in_recent_desc: "Include all types of files in the recent notes section, rather than only markdown files",
  show_recent_accessed_notes: "Show recently accessed notes",
  show_recent_accessed_notes_desc: "Include recently accessed notes in the recent notes list, sorted by access time",
  show_title_navigation_bar: "Show title navigation bar",
  show_title_navigation_bar_desc: "Show the title navigation bar on the start page",
  show_title_navigation_bar_default: "Default",
  show_title_navigation_bar_show: "Show",
  show_title_navigation_bar_hide: "Hide",
  show_custom_footer_text: "Show custom footer text",
  show_custom_footer_text_desc: "Show custom footer text on the start page",
  use_random_footer_text: "Use random footer text",
  use_random_footer_text_desc: "Show random footer text on the start page",
  custom_footer_text: "Custom footer text",
  custom_footer_text_desc: "Set custom footer text for the start page",
  custom_footer_text_placeholder: "Enter custom footer text",
  general_settings_heading: "General",
  appearance_settings_heading: "Appearance",
  new_tab_settings_heading: "New tab",
  footer_settings_heading: "Footer",
  pinned_notes_settings_heading: "Pinned notes",
  default_footer_text: "I think, therefore I am. \u2014 Ren\xE9 Descartes",
  loading_footer_text: "Loading...",
  search_modal_title: "Search",
  search_placeholder: "Type to start search...",
  case_sensitive: "Case sensitive",
  no_results: "No matching results.",
  no_results_press_enter: 'No matching results. Press {enter} to create a new note "{query}".',
  enter_key: "Enter",
  show_stat_bar: "Show stat. bar",
  show_stat_bar_desc: "Show stat. bar on the start page",
  new_version_available: "New version available",
  update_to_version: "Update to v{version}",
  search_settings_heading: "Search",
  search_exclude_list: "Exclude list",
  search_exclude_list_desc: "Files and folders to exclude from search results",
  search_exclude_list_add_button: "Add file or folder",
  search_exclude_list_remove: "Remove from exclude list",
  current_search_exclude_list: "Current exclude list",
  search_exclude_settings: "Exclude settings",
  search_exclude_settings_tooltip: "Excluded: {list}",
  search_exclude_extensions: "Excluded file extensions",
  search_exclude_extensions_desc: "Exclude files with specified extensions from search results",
  search_exclude_extensions_placeholder: "Enter extension (e.g., pdf, png, jpg)",
  search_exclude_extensions_add: "Add extension",
  search_exclude_extensions_current: "Currently excluded extensions",
  search_exclusion_modal_title: "Search Exclusion Settings",
  search_exclusion_settings: "Exclusion settings",
  search_exclusion_settings_desc: "Currently excluded: {0} items",
  search_exclusion_settings_button: "Manage exclusions",
  search_exclude_list_empty: "No excluded files or folders",
  search_exclude_extensions_empty: "No excluded extensions",
  search_exclude_extensions_remove: "Remove extension",
  style_settings_heading: "Style settings",
  style_settings_desc: "Configure custom styles for the start page sections",
  style_settings_open_button: "Open Style settings",
  style_settings_select_section: "Select section",
  style_settings_pinned_notes: "Pinned notes",
  style_settings_recent_notes: "Recent notes",
  style_section_margin: "Section margin",
  style_section_padding: "Section padding",
  style_header_margin: "Header margin",
  style_header_padding: "Header padding",
  style_title_font_size: "Title font size",
  style_title_margin: "Title margin",
  style_title_padding: "Title padding",
  style_list_gap: "List gap",
  style_item_padding: "Item padding",
  style_item_margin: "Item margin",
  style_note_title_font_size: "Note title font size",
  style_note_title_margin: "Note title margin",
  style_note_title_padding: "Note title padding",
  style_note_date_font_size: "Note date font size",
  style_note_folder_font_size: "Note folder font size",
  style_section_margin_desc: "Set the margin for the entire section (e.g., 20px, 10px 0)",
  style_section_padding_desc: "Set the padding for the entire section (e.g., 15px)",
  style_header_margin_desc: "Set the margin for the header area (e.g., 0 0 10px 0)",
  style_header_padding_desc: "Set the padding for the header area",
  style_title_font_size_desc: "Set the font size for the section title (e.g., 1.5em, 18px)",
  style_title_margin_desc: "Set the margin for the section title",
  style_title_padding_desc: "Set the padding for the section title",
  style_list_gap_desc: "Set the gap between items in the list (e.g., 8px)",
  style_item_padding_desc: "Set the padding for each note item (e.g., 10px)",
  style_item_margin_desc: "Set the margin for each note item",
  style_note_title_font_size_desc: "Set the font size for the note title (e.g., 1em, 14px)",
  style_note_title_margin_desc: "Set the margin for the note title",
  style_note_title_padding_desc: "Set the padding for the note title",
  style_note_date_font_size_desc: "Set the font size for the note date",
  style_note_folder_font_size_desc: "Set the font size for the folder path text",
  backup_settings_heading: "Backup Settings",
  backup_max_files: "Maximum backup files",
  backup_max_files_desc: "Set the maximum number of backup files to keep, older backups beyond this limit will be automatically deleted",
  folder_tabs_settings_heading: "Folder tabs",
  folder_tabs_settings: "Folder tabs",
  folder_tabs_settings_desc: "Configure folders to display as tabs on the start page",
  manage_folder_tabs_button: "Manage folders",
  current_folder_tabs_desc: "Configured: {0} folder(s)",
  add_folder: "Add folder",
  remove_from_tab_folders: "Remove from start page tabs",
  no_tab_folders: "No folders configured",
  tab_folder_recursive: "Include subfolder files",
  tab_folder_recursive_desc: "Recursively include files from all subfolders",
  add_to_tab_folders: "Show in start page tabs",
  tab_pinned: "Pinned",
  new_note_settings_heading: "New note",
  new_note_title_template: "Title template",
  new_note_title_template_desc: 'Template for the new note title. Supports {{date}}, {{date:FORMAT}}, {{time}}, {{time:FORMAT}} and {{datetime:FORMAT}}, where FORMAT uses moment.js tokens (e.g. {{date:YYYYMMDD}}). Characters that are invalid in file names (/ \\ : * ? " < > |) are replaced with "-".',
  new_note_title_template_placeholder: "e.g. {{date:YYYY-MM-DD}} Note",
  new_note_title_template_preview: "Preview: {title}",
  new_note_folder: "Target folder",
  new_note_folder_desc: "Folder where new notes are created. Leave empty to use the vault root; missing folders are created automatically.",
  new_note_folder_placeholder: "Leave empty for vault root",
  new_note_folder_select: "Select folder",
  new_note_folder_clear: "Clear",
  new_note_conflict: "When a note with the same name exists",
  new_note_conflict_desc: "Behavior when the generated title matches an existing note",
  new_note_conflict_duplicate: "Create a new note with a number suffix",
  new_note_conflict_open: "Open the existing note",
  new_note_invalid_folder: "Cannot create note: the target folder path is invalid or points to a file.",
  creator_title: "Agent project desk",
  creator_actions: "Start here",
  creator_idea: "Capture a request",
  creator_idea_desc: "Capture the goal, inputs and constraints",
  creator_draft: "Plan the agent",
  creator_draft_desc: "Plan knowledge, tools and acceptance",
  creator_daily: "Project log",
  creator_daily_desc: "Continue today\u2019s decisions and progress",
  creator_settings: "Project desk settings",
  creator_mode: "Agent project homepage",
  creator_mode_desc: "Show requirements, planning and acceptance actions",
  creator_inbox_folder: "Requirements folder",
  creator_draft_folder: "Plans folder",
  creator_daily_folder: "Project logs folder",
  creator_folder_desc: "Missing folders are created when used. Changing this does not move existing notes.",
  creator_failed: "Could not create the note. Check the destination folder.",
  creator_language_auto: "Follow app language",
  creator_navigator_missing: "Enable Notebook Navigator and ensure the folder exists to organize notes.",
  creator_acceptance: "Acceptance checklist",
  creator_acceptance_desc: "Track expected, actual and pending results",
  creator_acceptance_folder: "Acceptance folder",
  agent_project_name: "Current project",
  agent_project_name_desc: "New notes use this project name. Existing requirements and plans reopen; acceptance runs stay separate.",
  agent_project_required: "Set the current project name in project desk settings first."
};

// src/i18n.ts
var currentStrings = en_default;
function t(key, ...args) {
  let text = currentStrings[key] || key;
  args.forEach((arg, index) => {
    text = text.replace(`{${index}}`, arg);
  });
  return text;
}

// src/utils/newnoteutil.ts
var DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
var DEFAULT_TIME_FORMAT = "HHmmss";
var DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD_HHmmss";
var FALLBACK_TITLE = "Untitled";
var ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/g;
var PLACEHOLDER_REGEX = /\{\{(date|time|datetime)(?::([^}]*))?\}\}/g;
var createMoment = import_obsidian.moment;
var NewNoteUtil = class {
  static renderTitle(template, now = new Date()) {
    const source = template && template.trim() ? template : FALLBACK_TITLE;
    const rendered = source.replace(PLACEHOLDER_REGEX, (_match, type, format) => {
      const customFormat = format ? format.trim() : "";
      if (customFormat) {
        return createMoment(now).format(customFormat);
      }
      if (type === "time") {
        return createMoment(now).format(DEFAULT_TIME_FORMAT);
      }
      if (type === "datetime") {
        return createMoment(now).format(DEFAULT_DATETIME_FORMAT);
      }
      return createMoment(now).format(DEFAULT_DATE_FORMAT);
    });
    const sanitized = rendered.replace(ILLEGAL_FILENAME_CHARS, "-").replace(/\s+/g, " ").replace(/^[\s.]+/, "").replace(/[\s.]+$/, "");
    return sanitized || FALLBACK_TITLE;
  }
  static ensureFolder(app, folderPath) {
    return __async(this, null, function* () {
      const normalized = (0, import_obsidian.normalizePath)((folderPath || "").trim());
      if (!normalized || normalized === "/") {
        return app.vault.getRoot();
      }
      const existing = app.vault.getAbstractFileByPath(normalized);
      if (existing instanceof import_obsidian.TFolder) {
        return existing;
      }
      if (existing instanceof import_obsidian.TFile) {
        return null;
      }
      let currentFolder = app.vault.getRoot();
      const segments = normalized.split("/").filter((segment) => segment.length > 0);
      let currentPath = "";
      for (const segment of segments) {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        const child = app.vault.getAbstractFileByPath(currentPath);
        if (child instanceof import_obsidian.TFolder) {
          currentFolder = child;
        } else if (child instanceof import_obsidian.TFile) {
          return null;
        } else {
          currentFolder = yield app.vault.createFolder(currentPath);
        }
      }
      return currentFolder;
    });
  }
  static createNote(app, plugin, options) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const baseName = NewNoteUtil.renderTitle((_a = options == null ? void 0 : options.titleTemplate) != null ? _a : plugin.settings.newNoteTitleTemplate);
      const folder = yield NewNoteUtil.ensureFolder(app, (_b = options == null ? void 0 : options.folderPath) != null ? _b : plugin.settings.newNoteFolderPath);
      if (!folder) {
        new import_obsidian.Notice(t("new_note_invalid_folder"));
        return null;
      }
      const basePath = folder.isRoot() ? baseName : `${folder.path}/${baseName}`;
      if (((_c = options == null ? void 0 : options.conflict) != null ? _c : plugin.settings.newNoteConflict) === "open") {
        const existing = app.vault.getAbstractFileByPath((0, import_obsidian.normalizePath)(`${basePath}.md`));
        if (existing instanceof import_obsidian.TFile) {
          return existing;
        }
      }
      let index = 0;
      let fullPath = (0, import_obsidian.normalizePath)(`${basePath}.md`);
      while (app.vault.getAbstractFileByPath(fullPath)) {
        index++;
        fullPath = (0, import_obsidian.normalizePath)(`${basePath} ${index}.md`);
      }
      return app.vault.create(fullPath, (_d = options == null ? void 0 : options.content) != null ? _d : "");
    });
  }
};

// src/utils/creatoractions.ts
var CreatorActions = class {
  static create(app, plugin, action) {
    var _a;
    const previous = (_a = this.pending.get(app)) != null ? _a : Promise.resolve(null);
    const next = previous.catch(() => null).then(() => this.createNow(app, plugin, action));
    this.pending.set(app, next);
    return next;
  }
  static createContentNote(app, plugin, action) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      try {
        const source = plugin.settings.contentProjectFolder.trim();
        if (source.split("/").some((part) => part === "..") || source.includes("\\"))
          throw new Error("Invalid project folder");
        const root = source === "/" ? "" : source.replace(/^\/+|\/+$/g, "");
        const path = (part) => root ? `${root}/${part}` : part;
        const files = app.vault.getMarkdownFiles();
        const handoffs = files.filter((file) => file.path.startsWith(path("codex-handoff") + "/") && !/return|交回/i.test(file.basename));
        handoffs.sort((a, b) => {
          var _a2, _b2, _c2, _d2;
          return Number((_b2 = (_a2 = b.basename.match(/^(\d+)-/)) == null ? void 0 : _a2[1]) != null ? _b2 : 0) - Number((_d2 = (_c2 = a.basename.match(/^(\d+)-/)) == null ? void 0 : _c2[1]) != null ? _d2 : 0) || b.path.localeCompare(a.path);
        });
        const active = (_b = (_a = app.workspace) == null ? void 0 : _a.getActiveFile) == null ? void 0 : _b.call(_a);
        const handoff = (_c = handoffs.find((file) => file.path === (active == null ? void 0 : active.path))) != null ? _c : handoffs[0];
        const handoffRef = handoff ? `[[${handoff.path.replace(/\.md$/, "")}]]` : "\u5F85\u9009\u62E9\u4EA4\u63A5\u5355\uFF08\u5148\u4ECE\u9996\u9875\u521B\u5EFA\uFF0C\u518D\u8865\u5173\u8054\uFF09";
        const diagnosisRef = app.vault.getAbstractFileByPath(path("diagnosis.md")) instanceof import_obsidian2.TFile ? `[[${path("diagnosis")}]]` : "\u5C1A\u672A\u5EFA\u7ACB\u8BCA\u65AD\uFF0C\u8BF7\u8865\u5145\u5B9E\u9645\u8F93\u5165\u4E0E\u7EA6\u675F";
        const date = NewNoteUtil.renderTitle("{{date}}");
        const timestamp = new Date().toISOString();
        const metadata = `---
created: ${timestamp}
project: ${JSON.stringify(plugin.settings.agentProjectName)}
status: \u5F85\u586B\u5199
---

`;
        let options;
        if (action === "idea" || action === "draft") {
          const folder = path("codex-handoff");
          const files2 = app.vault.getMarkdownFiles();
          const numbers = files2.filter((file) => file.path.startsWith(folder + "/")).map((file) => {
            var _a2, _b2;
            return Number((_b2 = (_a2 = file.path.substring(folder.length + 1).match(/^(\d+)-/)) == null ? void 0 : _a2[1]) != null ? _b2 : 0);
          });
          const number = String(Math.max(0, ...numbers) + 1).padStart(2, "0");
          options = { folderPath: folder, titleTemplate: `${number}-\u4EA4\u63A5\u5355`, conflict: "duplicate", content: metadata + `# ${number} \u4EA4\u63A5\u5355

\u5173\u8054\u8BCA\u65AD\uFF1A${diagnosisRef}

## \u9501\u5B9A\u8F93\u5165\uFF08\u53EA\u8BFB\uFF09

## \u5141\u8BB8\u6539\u52A8\u7684\u8303\u56F4

## \u4E0D\u8BB8\u52A8

- \u5931\u8D25\u539F\u6837\u4EA4\u56DE\uFF0C\u4E0D\u6362\u8F93\u5165\u3001\u4E0D\u6539\u9501\u5B9A\u63D0\u793A\u3002

## \u6B65\u9AA4

## \u4EA4\u56DE

| \u9879\u76EE | \u5B9E\u9645\u7ED3\u679C | \u8BC1\u636E | \u9650\u5236 |
| --- | --- | --- | --- |
` };
        } else if (action === "acceptance") {
          options = { folderPath: path("\u9A8C\u6536"), titleTemplate: "01-\u9A8C\u6536 {{datetime}}", conflict: "duplicate", content: metadata + `# \u672C\u5355\u9A8C\u6536

\u5173\u8054\u4EA4\u63A5\uFF1A${handoffRef}

## \u9010\u6761\u6838\u5BF9

\u8BC1\u636E\u5FC5\u987B\u662F\u80FD\u70B9\u5F00\u7684\u5E93\u5185\u6587\u4EF6\u94FE\u63A5\uFF1B\u7F3A\u5931\u3001\u65E0\u6CD5\u89E3\u6790\u6216\u4E0D\u5B58\u5728\u90FD\u4E0D\u7B97\u6302\u8BC1\u636E\u3002

| \u9879\u76EE | \u5B9E\u9645\u7ED3\u679C | \u72B6\u6001 | \u8BC1\u636E | \u9650\u5236 |
| --- | --- | --- | --- | --- |
| \u672C\u5355\u5B9E\u6D4B | \u5F85\u6838\u5BF9 | \u5F85\u9A8C\u6536 |  |  |

## \u7ED3\u8BBA

\u5C1A\u672A\u9A8C\u6536\uFF0C\u4E0D\u636E\u6B64\u5BA3\u79F0\u901A\u8FC7\u3002
` };
        } else {
          const existing = app.vault.getAbstractFileByPath(path(`\u9879\u76EE\u65E5\u5FD7/${date}.md`));
          if (existing instanceof import_obsidian2.TFile) {
            yield app.vault.append(existing, `
## ${timestamp} \xB7 \u65B0\u51B3\u5B9A

\u5173\u8054\u4EA4\u63A5\uFF1A${handoffRef}

`);
            yield (_d = app.workspace) == null ? void 0 : _d.getLeaf(false).openFile(existing);
            return existing;
          }
          options = { folderPath: path("\u9879\u76EE\u65E5\u5FD7"), titleTemplate: date, conflict: "open", content: metadata + `# ${date} \u9879\u76EE\u65E5\u5FD7

\u5173\u8054\u4EA4\u63A5\uFF1A${handoffRef}

## ${timestamp} \xB7 \u51B3\u5B9A

` };
        }
        return yield NewNoteUtil.createNote(app, plugin, options);
      } catch (error) {
        new import_obsidian2.Notice("\u521B\u5EFA\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5\u672C\u671F\u76EE\u5F55\u4E0E\u6743\u9650\u3002");
        console.error(error);
        return null;
      }
    });
  }
  static createNow(app, plugin, action) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      if (plugin.settings.contentProjectFolder)
        return this.createContentNote(app, plugin, action);
      const date = NewNoteUtil.renderTitle("{{date}}");
      const project = (_a = plugin.settings.agentProjectName) == null ? void 0 : _a.trim();
      if (!project) {
        new import_obsidian2.Notice(t("agent_project_required"));
        return null;
      }
      const safeName = project.replace(/[\\/:*?"<>|\[\]\r\n]/g, "_");
      const demandLink = `[[${plugin.settings.creatorInboxFolder}/${safeName}\u2014\u9879\u76EE\u9700\u6C42]]`;
      const planLink = `[[${plugin.settings.creatorDraftFolder}/${safeName}\u2014\u642D\u5EFA\u65B9\u6848]]`;
      const options = {
        idea: {
          titleTemplate: `${safeName}\u2014\u9879\u76EE\u9700\u6C42`,
          folderPath: plugin.settings.creatorInboxFolder,
          conflict: "open",
          content: `---
status: \u5F85\u6F84\u6E05
created: ${date}
---

## \u4E1A\u52A1\u76EE\u6807


## \u7528\u6237\u539F\u8BDD\u4E0E\u8D44\u6599\u6765\u6E90


## \u8981\u56DE\u7B54\u7684\u95EE\u9898


## \u8981\u6267\u884C\u7684\u52A8\u4F5C


## \u5DF2\u786E\u8BA4\u7684\u9650\u5236


## \u5F85\u8865\u5145\u7684\u4FE1\u606F

`
        },
        draft: {
          titleTemplate: `${safeName}\u2014\u642D\u5EFA\u65B9\u6848`,
          folderPath: plugin.settings.creatorDraftFolder,
          conflict: "open",
          content: `---
status: \u8349\u7A3F
created: ${date}
---

## \u5173\u8054\u9700\u6C42


## \u4E1A\u52A1\u76EE\u6807


## \u6B63\u6587

### \u77E5\u8BC6\u4E0E\u6765\u6E90


### \u5DE5\u5177\u4E0E\u63A5\u53E3


### \u4EFB\u52A1\u6D41\u7A0B


### \u6743\u9650\u548C\u5F02\u5E38\u5904\u7406


## \u9A8C\u6536\u4F9D\u636E


## \u5F85\u786E\u8BA4\u4E0E\u4E0B\u4E00\u6B65

`
        },
        acceptance: {
          titleTemplate: `${safeName}\u2014\u9A8C\u6536\u6E05\u5355 {{datetime}}`,
          folderPath: plugin.settings.creatorAcceptanceFolder,
          conflict: "duplicate",
          content: `---
status: \u5F85\u8054\u8C03
created: ${date}
---

## \u5173\u8054\u9700\u6C42\u4E0E\u65B9\u6848


## \u9A8C\u6536\u7528\u4F8B

| \u7528\u4F8B | \u8F93\u5165 | \u9884\u671F\u884C\u4E3A | \u5B9E\u9645\u7ED3\u679C | \u72B6\u6001 |
| --- | --- | --- | --- | --- |
| \u77E5\u8BC6\u95EE\u7B54 |  |  | \u5C1A\u672A\u8FD0\u884C | \u5F85\u6D4B\u8BD5 |
| \u5DE5\u5177\u8C03\u7528 |  |  | \u5C1A\u672A\u8FD0\u884C | \u5F85\u6D4B\u8BD5 |
| \u5F02\u5E38\u5904\u7406 |  |  | \u5C1A\u672A\u8FD0\u884C | \u5F85\u6D4B\u8BD5 |

## \u672C\u6B21\u7ED3\u8BBA

\u5C1A\u672A\u8054\u8C03\uFF0C\u4E0D\u80FD\u636E\u6B64\u5224\u65AD\u667A\u80FD\u4F53\u5DF2\u901A\u8FC7\u9A8C\u6536\u3002

## \u672A\u901A\u8FC7\u9879\u4E0E\u4E0B\u4E00\u6B65

`
        },
        daily: {
          titleTemplate: `${safeName}\u2014{{date}}`,
          folderPath: plugin.settings.creatorDailyFolder,
          conflict: "open",
          content: `# ${date}

## \u5173\u8054\u9879\u76EE


## \u4ECA\u65E5\u8FDB\u5C55


## \u5DF2\u786E\u8BA4\u7684\u51B3\u5B9A


## \u5F85\u8054\u8C03\u6216\u5F85\u8865\u5145

- [ ] 
`
        }
      };
      for (const item of Object.values(options)) {
        item.content = (_b = item.content) == null ? void 0 : _b.replace(/created: ([^\n]+)\n---/, `created: $1
project: ${JSON.stringify(project)}
---`);
      }
      options.draft.content = (_c = options.draft.content) == null ? void 0 : _c.replace("## \u5173\u8054\u9700\u6C42\n\n", `## \u5173\u8054\u9700\u6C42

${demandLink}

`);
      options.acceptance.content = (_d = options.acceptance.content) == null ? void 0 : _d.replace("## \u5173\u8054\u9700\u6C42\u4E0E\u65B9\u6848\n\n", `## \u5173\u8054\u9700\u6C42\u4E0E\u65B9\u6848

${demandLink} \xB7 ${planLink}

`);
      options.daily.content = (_e = options.daily.content) == null ? void 0 : _e.replace("## \u5173\u8054\u9879\u76EE\n\n", `## \u5173\u8054\u9879\u76EE

${project}

${demandLink} \xB7 ${planLink}

`);
      try {
        return yield NewNoteUtil.createNote(app, plugin, options[action]);
      } catch (error) {
        new import_obsidian2.Notice(t("creator_failed"));
        console.error("StartPage creator action failed:", error);
        return null;
      }
    });
  }
};
CreatorActions.pending = /* @__PURE__ */ new WeakMap();

// src/utils/contentproject.ts
function projectRoot(settings) {
  const folder = settings.contentProjectFolder.trim();
  if (folder.split("/").includes("..") || folder.includes("\\"))
    throw new Error("Invalid project folder");
  return folder === "/" ? "" : folder.replace(/^\/+|\/+$/g, "");
}
function projectNotes(app, settings) {
  const root = projectRoot(settings);
  return app.vault.getMarkdownFiles().filter((file) => {
    if (root && !file.path.startsWith(root + "/"))
      return false;
    const local = root ? file.path.slice(root.length + 1) : file.path;
    return !local.includes("/") || /^(codex-handoff|验收|项目日志|口播|审核)\//.test(local);
  }).sort((a, b) => phase(a.path) - phase(b.path) || a.path.localeCompare(b.path, "zh-CN"));
}
function phase(path) {
  if (/return|交回/.test(path))
    return 3;
  if (/diagnosis|诊断/.test(path))
    return 1;
  if (/codex-handoff|交接/.test(path))
    return 2;
  if (/验收/.test(path))
    return 4;
  if (/口播/.test(path))
    return 5;
  if (/审核/.test(path))
    return 6;
  if (/项目日志|开始使用/.test(path))
    return 7;
  if (/选题|brief/i.test(path))
    return 0;
  return 7;
}
function evidenceTargets(row) {
  return [...row.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]|\[[^\]]*\]\(([^)]+)\)/g)].map((match) => {
    var _a;
    return ((_a = match[1]) != null ? _a : match[2]).replace(/^<|>$/g, "").split("#")[0];
  });
}
function missingEvidence(content, resolves) {
  var _a;
  let evidenceColumn = -1, count = 0;
  for (const row of content.split("\n")) {
    if (!row.trim().startsWith("|")) {
      evidenceColumn = -1;
      continue;
    }
    const cells = row.replace(/\[\[([^\]]*)\]\]/g, (token) => token.replace(/\|/g, "")).split("|").slice(1, -1).map((cell) => cell.trim().replace(/\u001f/g, "|"));
    if (cells.includes("\u8BC1\u636E")) {
      evidenceColumn = cells.indexOf("\u8BC1\u636E");
      continue;
    }
    if (evidenceColumn < 0 || cells.every((cell) => /^:?-+:?$/.test(cell)))
      continue;
    const targets = evidenceTargets((_a = cells[evidenceColumn]) != null ? _a : "");
    if (!targets.length || !targets.every((target) => target && resolves(target)))
      count++;
  }
  return count;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CreatorActions,
  NewNoteUtil,
  Notice,
  TFile,
  TFolder,
  missingEvidence,
  phase,
  projectNotes
});
