const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CreatorActions,NewNoteUtil,TFile,TFolder,Notice}=require('./creator-bundle.cjs');
function fixture(overrides={}){
 const files=new Map([['',new TFolder()]]);
 const app={vault:{getRoot:()=>files.get(''),getAbstractFileByPath:path=>files.get(path)??null,createFolder:async path=>{await new Promise(r=>setImmediate(r));const folder=new TFolder(path);files.set(path,folder);return folder;},getMarkdownFiles:()=>[...files.values()].filter(f=>f instanceof TFile),append:async(file,text)=>{file.content+=text;},create:async(path,content)=>{await new Promise(r=>setImmediate(r));if(files.has(path))throw Error('existing file');const file=new TFile(path,content);files.set(path,file);return file;}}};
 const plugin={settings:{agentProjectName:'青禾家居售后客服',creatorInboxFolder:'01 灵感',creatorDraftFolder:'02 草稿',creatorDailyFolder:'04 日记',creatorAcceptanceFolder:'03 验收',newNoteTitleTemplate:'普通笔记',newNoteFolderPath:'',newNoteConflict:'duplicate',...overrides}};
 return {app,plugin,files};
}
test('daily repeated and simultaneous actions keep one note and preserve edited content',async()=>{
 const {app,plugin,files}=fixture();
 const [one,two]=await Promise.all([CreatorActions.create(app,plugin,'daily'),CreatorActions.create(app,plugin,'daily')]);
 assert.equal(one,two);assert.match(one.path,/^04 日记\/青禾家居售后客服—\d{4}-\d{2}-\d{2}\.md$/);
 one.content='写过的内容';const three=await CreatorActions.create(app,plugin,'daily');assert.equal(three.content,'写过的内容');
 assert.equal([...files.values()].filter(f=>f instanceof TFile).length,1);
});
test('repeated project requirements reopen without overwriting recorded constraints',async()=>{
 const {app,plugin}=fixture();const [one,two]=await Promise.all([CreatorActions.create(app,plugin,'idea'),CreatorActions.create(app,plugin,'idea')]);
 assert.equal(one.path,two.path);one.content='已经确认的只读限制';const next=await CreatorActions.create(app,plugin,'idea');assert.equal(next.content,'已经确认的只读限制');assert.ok(one.path.startsWith('01 灵感/'));
});
test('draft template and custom nested folder use upstream folder creation',async()=>{
 const {app,plugin}=fixture({creatorDraftFolder:'创作/我的草稿'});const file=await CreatorActions.create(app,plugin,'draft');
 assert.ok(file.path.startsWith('创作/我的草稿/'));assert.match(file.content,/## 正文/);assert.match(file.content,/status: 草稿/);
});
test('invalid destination file gives feedback without overwriting existing file',async()=>{
 const {app,plugin,files}=fixture({creatorInboxFolder:'已有文件.md'});files.set('已有文件.md',new TFile('已有文件.md','原始内容'));
 assert.equal(await CreatorActions.create(app,plugin,'idea'),null);assert.equal(files.get('已有文件.md').content,'原始内容');assert.ok(Notice.messages.length);
});
test('upstream regular new-note workflow remains blank and numbers duplicates',async()=>{
 const {app,plugin}=fixture();const one=await NewNoteUtil.createNote(app,plugin);const two=await NewNoteUtil.createNote(app,plugin);
 assert.equal(one.path,'普通笔记.md');assert.equal(one.content,'');assert.equal(two.path,'普通笔记 1.md');
});
test('acceptance actions create independent pending checklists and preserve previous results',async()=>{
 const {app,plugin}=fixture({creatorAcceptanceFolder:'客户项目/验收'});
 const first=await CreatorActions.create(app,plugin,'acceptance');
 first.content='既有验收记录';
 const second=await CreatorActions.create(app,plugin,'acceptance');
 assert.notEqual(first.path,second.path);assert.equal(first.content,'既有验收记录');
 assert.ok(second.path.startsWith('客户项目/验收/'));assert.match(second.content,/尚未运行/);assert.match(second.content,/待测试/);
});

test('project names and links persist in plans and unsafe filename characters are normalized',async()=>{
 const {app,plugin}=fixture({agentProjectName:'青禾/项目'});const file=await CreatorActions.create(app,plugin,'draft');
 assert.ok(file.path.includes('青禾_项目—搭建方案'));assert.match(file.content,/project: "青禾\/项目"/);assert.ok(file.content.includes('[[01 灵感/青禾_项目—项目需求]]'));
});
test('project logs from the same day stay separate for different projects',async()=>{
 const {app,plugin}=fixture();const first=await CreatorActions.create(app,plugin,'daily');first.content='青禾既有记录';
 plugin.settings.agentProjectName='另一客户项目';const second=await CreatorActions.create(app,plugin,'daily');
 assert.notEqual(first.path,second.path);assert.equal(first.content,'青禾既有记录');assert.ok(second.content.includes('另一客户项目'));
});

const {missingEvidence,projectNotes,phase}=require('./creator-bundle.cjs');
test('content handoff picks next number and never overwrites the locked input',async()=>{
 const {app,plugin,files}=fixture({contentProjectFolder:'obs-agent-desk'});
 files.set('obs-agent-desk/codex-handoff/01-desk-and-evidence.md',new TFile('obs-agent-desk/codex-handoff/01-desk-and-evidence.md','锁定单'));
 const [a,b]=await Promise.all([CreatorActions.create(app,plugin,'idea'),CreatorActions.create(app,plugin,'idea')]);
 assert.equal(a.path,'obs-agent-desk/codex-handoff/02-交接单.md'); assert.equal(b.path,'obs-agent-desk/codex-handoff/03-交接单.md');
 assert.equal(files.get('obs-agent-desk/codex-handoff/01-desk-and-evidence.md').content,'锁定单');
 for(const heading of ['锁定输入','允许改动','不许动','步骤','交回']) assert.ok(a.content.includes(heading));
});
test('decisions append to one actual daily log; acceptance has required evidence column',async()=>{
 const {app,plugin}=fixture({contentProjectFolder:'/'});
 const a=await CreatorActions.create(app,plugin,'daily');a.content+='真实决定';const b=await CreatorActions.create(app,plugin,'daily');
 assert.equal(a,b);assert.match(b.content,/真实决定/);assert.match(b.content,/新决定/);
 const c=await CreatorActions.create(app,plugin,'acceptance');assert.match(c.content,/证据/);assert.equal(missingEvidence(c.content,()=>false),1);
});
test('evidence checks links in evidence column only and rejects nonexistent targets',()=>{
 const table='| 项目 | 状态 | 证据 |\n| --- | --- | --- |\n| [[valid]] | 完成 |  |\n| 二 | 完成 | [[missing]] |\n| 三 | 部分 | [[valid|原件]] |\n| 四 | 完成 | [原件](valid.md) |\n| 五 | 完成 | https://example.com |';
 assert.equal(missingEvidence(table,t=>t==='valid'||t==='valid.md'),3);
});
test('project scope excludes media, packages, unrelated projects and sorts workflow',()=>{
 const {app,plugin,files}=fixture({contentProjectFolder:'obs-agent-desk'});
 const names=['obs-agent-desk/codex-handoff/01-return.md','other/diagnosis.md','obs-agent-desk/demo/private.md','obs-agent-desk/package/示例.md','obs-agent-desk/diagnosis.md','obs-agent-desk/codex-handoff/01-desk-and-evidence.md'];
 for(const n of names)files.set(n,new TFile(n));
 assert.deepEqual(projectNotes(app,plugin.settings).map(f=>f.path),[names[4],names[5],names[0]]);
 assert.equal(phase(names[0]),3);
});

test('new content vault links only actual handoffs and has no invented diagnosis link',async()=>{
 const {app,plugin}=fixture({contentProjectFolder:'/'});
 const first=await CreatorActions.create(app,plugin,'acceptance');assert.ok(!first.content.includes('[[codex-handoff/01-desk-and-evidence]]'));
 const handoff=await CreatorActions.create(app,plugin,'idea');assert.ok(!handoff.content.includes('[[diagnosis]]'));
 const acceptance=await CreatorActions.create(app,plugin,'acceptance');assert.ok(acceptance.content.includes('[[codex-handoff/01-交接单]]'));
 const log=await CreatorActions.create(app,plugin,'daily');assert.ok(log.content.includes('[[codex-handoff/01-交接单]]'));
});
test('handoff association stays inside selected project and ignores returns',async()=>{
 const {app,plugin,files}=fixture({contentProjectFolder:'project'});
 for(const p of ['other/codex-handoff/99-交接单.md','project/codex-handoff/01-交接单.md','project/codex-handoff/02-交接单.md','project/codex-handoff/99-return.md'])files.set(p,new TFile(p));
 const a=await CreatorActions.create(app,plugin,'acceptance');assert.ok(a.content.includes('[[project/codex-handoff/02-交接单]]'));assert.ok(!a.content.includes('[[other/'));
});

test('repeated content decision opens the existing editable daily log after appending',async()=>{
 const {app,plugin}=fixture({contentProjectFolder:'/'});const first=await CreatorActions.create(app,plugin,'daily');first.content+='实际决定';let opened=null;
 app.workspace={getLeaf:()=>({openFile:async f=>{opened=f.path;}})};
 const second=await CreatorActions.create(app,plugin,'daily');assert.equal(second,first);assert.equal(opened,first.path);assert.match(first.content,/实际决定/);assert.match(first.content,/新决定/);
});
