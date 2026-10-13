# leoliu-agent-desk

一个给「人 + AI 智能体」一起干活用的 Obsidian 工作台。

AI（Codex、Claude Code 等）直接往这个文件夹里写文件，你用 Obsidian 打开同一个文件夹来看、找、核对、接着做。不需要装任何 AI 插件。

## 解决的几个问题

都来自网友在 Obsidian 相关视频下面的真实反馈：

| 问题 | 这套怎么做 |
|---|---|
| 装修得很漂亮，然后就不打开了 | 首页只放三个每天真会点的按钮：**写交接单**、**登记验收**、**记一条决定**。文件带格式建好，显示真实创建时间 |
| 文件一多，附件和素材把列表淹了 | 素材目录默认隐藏，只列文档；文件夹按你干活的顺序手动排序 |
| AI 干完活，不知道它干对没有 | 验收单每一行都要挂证据链接。少挂一条，首页提示「N 条没挂证据」 |
| 不知道怎么换成自己的项目 | 三个库：空模板、作者自己在用的结构（脱敏改写）、一个售后客服示例 |

注意：首页的提醒只检查证据**挂没挂**，不检查**对不对**。证据得你自己点开看。

## 目录

| 文件夹 | 是什么 |
|---|---|
| `空模板/` | 从零开始用。目录、交接单模板、验收单模板 |
| `我的工作台-脱敏版/` | 作者做内容时的流程：选题 → 诊断 → 交接 → 交回 → 验收。示例文档是改写的，不是运行原件 |
| `示例-售后客服/` | 自拟的售后客服智能体项目（需求／方案／验收），演示换成别的业务。场景是自拟的，客服模型和接口没有接入 |
| `plugin-src/` | 首页插件 `leoliu-agent-workbench` 的源码，基于 [StartPage](https://github.com/kuzzh/obsidian-startpage)（MIT）改造 |

三个文件夹是三个**独立的库**，打开其中一个，不要把整个仓库当成一个库。

## 安装

详细步骤见 [安装说明.md](安装说明.md)。简单说：

1. 用 Obsidian「打开本地仓库」，选 `空模板/`（或另外两个之一）。
2. 首页插件 `leoliu-agent-workbench` 已在库里，确认来源后启用。
3. 去社区插件市场安装 **Notebook Navigator**、**Editing Toolbar**，主题市场安装 **Minimal**。这三样的发行文件不在本仓库里，库里只有它们的配置。
4. 点左侧小房子打开工作台。

实测环境：Obsidian 1.14.4 · Notebook Navigator 3.4.3 · Editing Toolbar 4.1.10 · Minimal 9.1.4 · 插件 0.4.3-leoliu.agent.4（macOS 桌面版）。

**没测过的**：手机端、同步、Windows。

## 从源码构建

```bash
cd plugin-src
npm ci --ignore-scripts
npm run build
npm test
```

`dist/` 里的文件放进库的 `.obsidian/plugins/leoliu-agent-workbench/`。

## 许可

- 本仓库：MIT（见 `LICENSE`）
- 首页插件基于 StartPage，原作者 kuzzh，MIT，原声明见 `StartPage-MIT-LICENSE.txt` 和 `plugin-src/LICENSE`
- Notebook Navigator（GPL-3.0）、Editing Toolbar（MPL-2.0）、Minimal：本仓库不分发，只给配置，请从官方市场安装

---

作者：LeoLiu｜AI智能体落地
