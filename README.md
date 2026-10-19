# MediaPipe 中文文档镜像

**在线阅读：[MediaPipe 中文文档站](https://praxpur.github.io/MediaPipe-CN/)**（支持手机与电脑浏览）

本项目将 Google AI Edge 官方 **MediaPipe 文档**(<https://developers.google.com/edge/mediapipe/solutions/guide>)完整翻译为简体中文 Markdown,供离线阅读与学习使用,可作为科创竞赛/课程论文的参考资料。

## 内容

- **MediaPipe Solutions**:任务 API(Tasks)、模型(Model Maker)、Studio,以及音频/决策/生成式 AI/检索/文本/视觉全部任务的概述页与各平台(Android / iOS / Python / Web)使用页。
- **MediaPipe Framework**:框架概述、安装、四大平台入门教程、核心概念(计算器、计算图、数据包、同步、GPU、实时数据流)、Visualizer 工具、FAQ 与故障排查。
- 原站图片已全部下载到 `assets/` 目录,md 内以相对路径引用,离线可看,位置与原文一致。
- 目录结构镜像原站 URL 树,便于对照原文查找。

## 目录结构

```
mediapipe/
├─ index.html         # 文档浏览入口(浏览器打开,需本地 HTTP 服务)
├─ viewer.js          # 导航树 + Markdown 渲染
├─ style.css          # 样式
├─ README.md
├─ 翻译规范.md         # 翻译规范与术语对照表
├─ tools/
│  └─ fetch_page.py   # 抓取原站新页面 -> 下载图片 -> 转 Markdown
├─ docs/
│  ├─ solutions/      # Solutions 全部页面(镜像原站导航)
│  └─ framework/      # Framework 全部页面
└─ assets/            # 本地化图片(镜像原站静态资源路径)
```

## 如何使用

**方式一(推荐):本地服务浏览**

```bash
cd mediapipe
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

**方式二:任意 Markdown 阅读器**

直接用 Typora / Obsidian / VS Code 等打开 `docs/` 下的 `.md` 文件即可(图片、表格、代码均保留)。

## 维护:抓取原站新页面

如果原站文档更新或需要补充新页面,用 `tools/fetch_page.py`:

```bash
pip install beautifulsoup4 markdownify   # 首次使用安装依赖

python tools/fetch_page.py <原站页面URL> <输出md路径>
# 例:
python tools/fetch_page.py \
    https://developers.google.com/edge/mediapipe/solutions/vision/object_detector \
    docs/solutions/vision/object_detector.md
```

脚本会自动:抽取正文、下载图片到 `assets/` 并改写为相对路径、把站内链接改写为本地 `.md` 相对链接、在文件头写入 `original_url` / `last_updated` 元信息。生成的英文 md 再按《翻译规范.md》翻译即可。

## 翻译说明

- 每个 md 文件头部含 YAML 元信息(`original_url` 指向原站页面,`last_updated` 为原页更新时间),方便溯源。
- 术语统一遵循《翻译规范.md》第 6 节术语对照表(计算器/计算图/数据包/关键点/分割器等)。
- 代码示例逐字保留(标识符、属性名、路径、版本号不译),代码内注释译为中文。
- 表格结构、标题层级、图片位置均与原站一致。

## 许可

页面内容遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可;代码示例遵循 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 许可。翻译版本与原站文档一一对应,如有出入以原站为准。
