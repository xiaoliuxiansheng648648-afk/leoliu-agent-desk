# leoliu-agent-workbench

基于 StartPage 0.4.3（kuzzh，MIT）的改造版，插件 ID `leoliu-agent-workbench`，与原版分开识别。版本 0.4.3-leoliu.agent.4。

改动：
- 首页按当前项目目录显示工作流程与已有文档
- 三个入口：写交接单、登记验收、记一条决定
- 验收单「证据」列检查，首页显示没挂证据的条数
- 交接单编号与关联、显示文件真实创建时间、同一天的日志续写

构建：`npm ci --ignore-scripts`、`npm run build`、`npm test`（15 项功能测试）。
