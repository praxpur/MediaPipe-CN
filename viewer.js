/* MediaPipe 中文文档镜像 — 浏览入口逻辑
 * 自包含:导航树 + 迷你 Markdown 渲染器 + hash 路由
 * 用法:在项目根目录启动静态服务器访问 index.html(如 python3 -m http.server) */
(function () {
  "use strict";

  /* ---------- 导航树(镜像原站左侧导航) ---------- */
  var NAV = [
    {
      group: "MediaPipe Solutions",
      items: [
        { label: "指南(Overview)", file: "docs/solutions/guide.md" },
        { label: "任务(Tasks)", file: "docs/solutions/tasks.md" },
        { label: "Model Maker", file: "docs/solutions/model_maker.md" },
        { label: "即时演示(Studio)", file: "docs/solutions/studio.md" },
        { label: "音频任务(Audio tasks)", section: true, children: [
          { label: "音频分类", file: "docs/solutions/audio/audio_classifier.md", children: [
            { label: "Android", file: "docs/solutions/audio/audio_classifier/android.md" },
            { label: "iOS", file: "docs/solutions/audio/audio_classifier/ios.md" },
            { label: "Python", file: "docs/solutions/audio/audio_classifier/python.md" },
            { label: "Web", file: "docs/solutions/audio/audio_classifier/web_js.md" }
          ]}
        ]},
        { label: "决策任务(Decision tasks)", section: true, children: [
          { label: "决策器", file: "docs/solutions/decision/decision_maker.md", children: [
            { label: "Android", file: "docs/solutions/decision/decision_maker/android.md" },
            { label: "iOS", file: "docs/solutions/decision/decision_maker/ios.md" },
            { label: "Python", file: "docs/solutions/decision/decision_maker/python.md" },
            { label: "Web", file: "docs/solutions/decision/decision_maker/web_js.md" },
            { label: "最佳实践", file: "docs/solutions/decision/decision_maker/best-practices.md" }
          ]}
        ]},
        { label: "生成式 AI 任务(Generative AI tasks)", section: true, children: [
          { label: "LLM 推理", file: "docs/solutions/genai/llm_inference.md", children: [
            { label: "Android", file: "docs/solutions/genai/llm_inference/android.md" },
            { label: "iOS", file: "docs/solutions/genai/llm_inference/ios.md" },
            { label: "Web", file: "docs/solutions/genai/llm_inference/web_js.md" }
          ]}
        ]},
        { label: "检索任务(Retrieval tasks)", section: true, children: [
          { label: "语义检索器", file: "docs/solutions/retrieval/semantic_retriever.md", children: [
            { label: "Android", file: "docs/solutions/retrieval/semantic_retriever/android.md" },
            { label: "iOS", file: "docs/solutions/retrieval/semantic_retriever/ios.md" },
            { label: "Python", file: "docs/solutions/retrieval/semantic_retriever/python.md" },
            { label: "Web", file: "docs/solutions/retrieval/semantic_retriever/web_js.md" }
          ]},
          { label: "通用嵌入器", file: "docs/solutions/retrieval/universal_embedder.md", children: [
            { label: "Android", file: "docs/solutions/retrieval/universal_embedder/android.md" },
            { label: "iOS", file: "docs/solutions/retrieval/universal_embedder/ios.md" },
            { label: "Python", file: "docs/solutions/retrieval/universal_embedder/python.md" },
            { label: "Web", file: "docs/solutions/retrieval/universal_embedder/web_js.md" }
          ]}
        ]},
        { label: "文本任务(Text tasks)", section: true, children: [
          { label: "语言检测", file: "docs/solutions/text/language_detector.md", children: [
            { label: "Android", file: "docs/solutions/text/language_detector/android.md" },
            { label: "iOS", file: "docs/solutions/text/language_detector/ios.md" },
            { label: "Python", file: "docs/solutions/text/language_detector/python.md" },
            { label: "Web", file: "docs/solutions/text/language_detector/web_js.md" }
          ]},
          { label: "文本分类", file: "docs/solutions/text/text_classifier.md", children: [
            { label: "Android", file: "docs/solutions/text/text_classifier/android.md" },
            { label: "iOS", file: "docs/solutions/text/text_classifier/ios.md" },
            { label: "Python", file: "docs/solutions/text/text_classifier/python.md" },
            { label: "Web", file: "docs/solutions/text/text_classifier/web_js.md" },
            { label: "定制", file: "docs/solutions/text/text_classifier/customize.md" }
          ]},
          { label: "文本嵌入", file: "docs/solutions/text/text_embedder.md", children: [
            { label: "Android", file: "docs/solutions/text/text_embedder/android.md" },
            { label: "iOS", file: "docs/solutions/text/text_embedder/ios.md" },
            { label: "Python", file: "docs/solutions/text/text_embedder/python.md" },
            { label: "Web", file: "docs/solutions/text/text_embedder/web_js.md" }
          ]},
          { label: "文本校对", file: "docs/solutions/text/text_proofreader.md", children: [
            { label: "Android", file: "docs/solutions/text/text_proofreader/android.md" },
            { label: "iOS", file: "docs/solutions/text/text_proofreader/ios.md" },
            { label: "Python", file: "docs/solutions/text/text_proofreader/python.md" }
          ]},
          { label: "文本摘要", file: "docs/solutions/text/text_summarizer.md", children: [
            { label: "Android", file: "docs/solutions/text/text_summarizer/android.md" },
            { label: "iOS", file: "docs/solutions/text/text_summarizer/ios.md" },
            { label: "Python", file: "docs/solutions/text/text_summarizer/python.md" }
          ]}
        ]},
        { label: "视觉任务(Vision tasks)", section: true, children: [
          { label: "人脸检测", file: "docs/solutions/vision/face_detector.md", children: [
            { label: "Android", file: "docs/solutions/vision/face_detector/android.md" },
            { label: "iOS", file: "docs/solutions/vision/face_detector/ios.md" },
            { label: "Python", file: "docs/solutions/vision/face_detector/python.md" },
            { label: "Web", file: "docs/solutions/vision/face_detector/web_js.md" }
          ]},
          { label: "面部关键点检测", file: "docs/solutions/vision/face_landmarker.md", children: [
            { label: "Android", file: "docs/solutions/vision/face_landmarker/android.md" },
            { label: "iOS", file: "docs/solutions/vision/face_landmarker/ios.md" },
            { label: "Python", file: "docs/solutions/vision/face_landmarker/python.md" },
            { label: "Web", file: "docs/solutions/vision/face_landmarker/web_js.md" }
          ]},
          { label: "手势识别", file: "docs/solutions/vision/gesture_recognizer.md", children: [
            { label: "Android", file: "docs/solutions/vision/gesture_recognizer/android.md" },
            { label: "iOS", file: "docs/solutions/vision/gesture_recognizer/ios.md" },
            { label: "Python", file: "docs/solutions/vision/gesture_recognizer/python.md" },
            { label: "Web", file: "docs/solutions/vision/gesture_recognizer/web_js.md" },
            { label: "定制", file: "docs/solutions/vision/gesture_recognizer/customize.md" }
          ]},
          { label: "手部关键点检测", file: "docs/solutions/vision/hand_landmarker.md", children: [
            { label: "Android", file: "docs/solutions/vision/hand_landmarker/android.md" },
            { label: "iOS", file: "docs/solutions/vision/hand_landmarker/ios.md" },
            { label: "Python", file: "docs/solutions/vision/hand_landmarker/python.md" },
            { label: "Web", file: "docs/solutions/vision/hand_landmarker/web_js.md" }
          ]},
          { label: "整体关键点检测", file: "docs/solutions/vision/holistic_landmarker.md", children: [
            { label: "Android", file: "docs/solutions/vision/holistic_landmarker/android.md" },
            { label: "iOS", file: "docs/solutions/vision/holistic_landmarker/ios.md" },
            { label: "Python", file: "docs/solutions/vision/holistic_landmarker/python.md" },
            { label: "Web", file: "docs/solutions/vision/holistic_landmarker/web_js.md" }
          ]},
          { label: "图像分类", file: "docs/solutions/vision/image_classifier.md", children: [
            { label: "Android", file: "docs/solutions/vision/image_classifier/android.md" },
            { label: "iOS", file: "docs/solutions/vision/image_classifier/ios.md" },
            { label: "Python", file: "docs/solutions/vision/image_classifier/python.md" },
            { label: "Web", file: "docs/solutions/vision/image_classifier/web_js.md" },
            { label: "定制", file: "docs/solutions/vision/image_classifier/customize.md" }
          ]},
          { label: "图像嵌入", file: "docs/solutions/vision/image_embedder.md", children: [
            { label: "Android", file: "docs/solutions/vision/image_embedder/android.md" },
            { label: "iOS", file: "docs/solutions/vision/image_embedder/ios.md" },
            { label: "Python", file: "docs/solutions/vision/image_embedder/python.md" },
            { label: "Web", file: "docs/solutions/vision/image_embedder/web_js.md" }
          ]},
          { label: "图像分割", file: "docs/solutions/vision/image_segmenter.md", children: [
            { label: "Android", file: "docs/solutions/vision/image_segmenter/android.md" },
            { label: "iOS", file: "docs/solutions/vision/image_segmenter/ios.md" },
            { label: "Python", file: "docs/solutions/vision/image_segmenter/python.md" },
            { label: "Web", file: "docs/solutions/vision/image_segmenter/web_js.md" }
          ]},
          { label: "交互式分割", file: "docs/solutions/vision/interactive_segmenter.md", children: [
            { label: "Android", file: "docs/solutions/vision/interactive_segmenter/android.md" },
            { label: "Python", file: "docs/solutions/vision/interactive_segmenter/python.md" },
            { label: "Web", file: "docs/solutions/vision/interactive_segmenter/web_js.md" }
          ]},
          { label: "物体检测", file: "docs/solutions/vision/object_detector.md", children: [
            { label: "Android", file: "docs/solutions/vision/object_detector/android.md" },
            { label: "iOS", file: "docs/solutions/vision/object_detector/ios.md" },
            { label: "Python", file: "docs/solutions/vision/object_detector/python.md" },
            { label: "Web", file: "docs/solutions/vision/object_detector/web_js.md" },
            { label: "定制", file: "docs/solutions/vision/object_detector/customize.md" }
          ]},
          { label: "姿态关键点检测", file: "docs/solutions/vision/pose_landmarker.md", children: [
            { label: "Android", file: "docs/solutions/vision/pose_landmarker/android.md" },
            { label: "iOS", file: "docs/solutions/vision/pose_landmarker/ios.md" },
            { label: "Python", file: "docs/solutions/vision/pose_landmarker/python.md" },
            { label: "Web", file: "docs/solutions/vision/pose_landmarker/web_js.md" }
          ]}
        ]},
        { label: "平台配置指南(Platform setup)", section: true, children: [
          { label: "Android 配置", file: "docs/solutions/setup_android.md" },
          { label: "iOS 配置", file: "docs/solutions/setup_ios.md" },
          { label: "Python 配置", file: "docs/solutions/setup_python.md" },
          { label: "Web 配置", file: "docs/solutions/setup_web.md" }
        ]},
        { label: "从源代码构建(Build from source)", section: true, children: [
          { label: "构建 Python Wheel 包", file: "docs/solutions/build_python.md" }
        ]}
      ]
    },
    {
      group: "MediaPipe Framework",
      items: [
        { label: "概述", file: "docs/framework/overview.md" },
        { label: "安装", file: "docs/framework/getting_started/install.md" },
        { label: "入门(Getting started)", section: true, children: [
          { label: "Android 上的框架", file: "docs/framework/getting_started/android.md", children: [
            { label: "Hello World!", file: "docs/framework/getting_started/hello_world_android.md" },
            { label: "Android Archive", file: "docs/framework/getting_started/android_archive_library.md" }
          ]},
          { label: "iOS 上的框架", file: "docs/framework/getting_started/ios.md", children: [
            { label: "Hello World!", file: "docs/framework/getting_started/hello_world_ios.md" }
          ]},
          { label: "Python 框架", file: "docs/framework/getting_started/python_framework.md" },
          { label: "C++ 框架", file: "docs/framework/getting_started/cpp.md", children: [
            { label: "Hello World!", file: "docs/framework/getting_started/hello_world_cpp.md" }
          ]}
        ]},
        { label: "框架概念(Framework concepts)", section: true, children: [
          { label: "概念概述", file: "docs/framework/framework_concepts/overview.md" },
          { label: "计算器(Calculators)", file: "docs/framework/framework_concepts/calculators.md" },
          { label: "计算图(Graphs)", file: "docs/framework/framework_concepts/graphs.md", children: [
            { label: "用 C++ 构建计算图", file: "docs/framework/framework_concepts/graphs_cpp.md" }
          ]},
          { label: "数据包(Packets)", file: "docs/framework/framework_concepts/packets.md" },
          { label: "同步(Synchronization)", file: "docs/framework/framework_concepts/synchronization.md" },
          { label: "GPU", file: "docs/framework/framework_concepts/gpu.md" },
          { label: "实时数据流(Real-time Streams)", file: "docs/framework/framework_concepts/realtime_streams.md" }
        ]},
        { label: "框架工具(Framework tools)", section: true, children: [
          { label: "可视化工具(Visualizer)", file: "docs/framework/tools/visualizer.md" }
        ]},
        { label: "资源(Resources)", section: true, children: [
          { label: "获取帮助", file: "docs/framework/getting_started/help.md" },
          { label: "常见问题(FAQ)", file: "docs/framework/getting_started/faq.md" },
          { label: "故障排查", file: "docs/framework/getting_started/troubleshooting.md" },
          { label: "GPU 支持", file: "docs/framework/getting_started/gpu_support.md" }
        ]}
      ]
    }
  ];

  /* ---------- DOM 引用 ---------- */
  var sidebarEl = document.getElementById("sidebar");
  var mainEl = document.getElementById("main");
  var crumbEl = document.getElementById("crumb");
  var searchEl = document.getElementById("search");
  var menuButton = document.getElementById("menu-button");
  var closeMenu = document.getElementById("close-menu");
  var backdrop = document.getElementById("nav-backdrop");
  var mobileLayout = window.matchMedia("(max-width: 900px)");
  var menuOpen = false;

  function setMenuOpen(open, restoreFocus) {
    menuOpen = mobileLayout.matches && open;
    document.body.classList.toggle("nav-open", menuOpen);
    menuButton.setAttribute("aria-expanded", String(menuOpen));
    backdrop.hidden = !menuOpen;
    sidebarEl.inert = mobileLayout.matches && !menuOpen;
    mainEl.inert = menuOpen;
    if (menuOpen) {
      closeMenu.focus();
      var active = sidebarEl.querySelector(".nav-item.active");
      if (active) active.scrollIntoView({ block: "center" });
    } else if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener("click", function () { setMenuOpen(!menuOpen, menuOpen); });
  closeMenu.addEventListener("click", function () { setMenuOpen(false, true); });
  backdrop.addEventListener("click", function () { setMenuOpen(false, true); });
  mobileLayout.addEventListener("change", function () { setMenuOpen(false, false); });
  document.addEventListener("keydown", function (e) {
    if (!menuOpen) return;
    if (e.key === "Escape") { e.preventDefault(); setMenuOpen(false, true); }
    if (e.key !== "Tab") return;
    var controls = [menuButton].concat(Array.from(sidebarEl.querySelectorAll("a[href], button, input")).filter(function (el) {
      return el.getClientRects().length > 0;
    }));
    var first = controls[0], last = controls[controls.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  setMenuOpen(false, false);

  /* ---------- 工具函数 ---------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slugify(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}\w]+/gu, "-").replace(/^-+|-+$/g, "");
  }
  /* 以某个 md 文件为基准,解析相对引用 URL */
  function resolveRef(base, ref) {
    if (!ref) return "";
    if (/^(https?:|mailto:|#)/.test(ref)) return ref;
    var m = /^(.*?)(#.*)?$/.exec(ref);
    var path = m[1], anchor = m[2] || "";
    if (!path) return anchor;
    var parts = (base.split("/").slice(0, -1)).concat(path.split("/"));
    var out = [];
    parts.forEach(function (p) {
      if (p === "." || p === "") return;
      if (p === "..") { out.pop(); } else { out.push(p); }
    });
    return out.join("/") + anchor;
  }

  /* ---------- 迷你 Markdown 渲染器 ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
      return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy">';
    });
    /* 图片链接已被上面的 image 规则消费,再处理普通链接 */
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, txt, href) {
      return '<a href="' + esc(href) + '">' + txt + "</a>";
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    return s;
  }

  function renderTable(lines) {
    /* lines[0] 表头, lines[1] 分隔行, 其余表体 */
    var rows = [];
    for (var i = 0; i < lines.length; i++) {
      var cells = lines[i].replace(/^\||\|$/g, "").split("|");
      cells = cells.map(function (c) { return c.trim(); });
      if (i === 1) continue; /* 分隔行 */
      var tag = i === 0 ? "th" : "td";
      rows.push("<tr>" + cells.map(function (c) {
        return "<" + tag + ">" + inline(c) + "</" + tag + ">";
      }).join("") + "</tr>");
    }
    return "<table><tbody>" + rows.join("") + "</tbody></table>";
  }

  function renderList(lines) {
    var html = "", curUl = [], curOl = [], stack = [];
    function close() { while (stack.length) { html += closing(stack.pop()); } }
    function closing(top) {
      return top.ul ? "</ul>" : "</ol>";
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^\s*$/.test(line)) continue;
      var m = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(line);
      if (!m) { html += inline(line); continue; }
      var indent = m[1].replace(/\t/g, "  ").length;
      var ordered = /\d+\./.test(m[2]);
      var content = m[3];
      var level = Math.floor(indent / 2);
      while (stack.length > level) html += closing(stack.pop());
      if (stack.length === 0 || stack[stack.length - 1].ordered !== ordered) {
        while (stack.length > 0) html += closing(stack.pop());
        html += ordered ? "<ol>" : "<ul>";
        stack.push({ ordered: ordered });
      }
      html += "<li>" + inline(content);
      /* 列表内联代码内的复杂子项暂不支持,保持简单 */
    }
    close();
    return html;
  }

  function renderBlocks(lines) {
    var html = "";
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      /* 围栏代码 */
      var fm = /^```(\w*)\s*$/.exec(line);
      if (fm) {
        var lang = fm[1];
        var buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; /* 跳过闭合 */
        var langTag = lang ? '<div class="lang-tag">' + esc(lang) + "</div>" : "";
        html += "<pre>" + langTag + "<code>" + esc(buf.join("\n")) + "</code></pre>";
        continue;
      }
      /* 标题 */
      var hm = /^(#{1,6})\s+(.*)$/.exec(line);
      if (hm) {
        var level = hm[1].length, text = hm[2];
        var id = slugify(text.replace(/<[^>]+>/g, ""));
        html += "<h" + level + ' id="' + id + '">' + inline(text) + "</h" + level + ">";
        i++;
        continue;
      }
      /* 分隔线 */
      if (/^\s*([-*_])\1\1+\s*$/.test(line) || /^\s*---\s*$/.test(line)) {
        html += "<hr>";
        i++;
        continue;
      }
      /* 表格 */
      if (/^\s*\|/.test(line)) {
        var tbuf = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { tbuf.push(lines[i]); i++; }
        html += renderTable(tbuf);
        continue;
      }
      /* 引用 */
      if (/^\s*>/.test(line)) {
        var qbuf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) {
          qbuf.push(lines[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html += "<blockquote>" + renderBlocks(qbuf) + "</blockquote>";
        continue;
      }
      /* 列表 */
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        var lbuf = [];
        while (i < lines.length) {
          var l = lines[i];
          if (/^\s*([-*+]|\d+\.)\s+/.test(l)) { lbuf.push(l); i++; }
          else if (/^\s*$/.test(l) && i + 1 < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i + 1])) { i++; }
          else break;
        }
        html += renderList(lbuf);
        continue;
      }
      /* 段落(累积连续非空行) */
      var pbuf = [];
      while (i < lines.length &&
             !/^\s*$/.test(lines[i]) &&
             !/^```/.test(lines[i]) &&
             !/^#{1,6}\s/.test(lines[i]) &&
             !/^\s*\|/.test(lines[i]) &&
             !/^\s*>/.test(lines[i]) &&
             !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        pbuf.push(lines[i]);
        i++;
      }
      html += "<p>" + inline(pbuf.join(" ")) + "</p>";
    }
    return html;
  }

  function renderMarkdown(md) {
    var lines = md.replace(/\r\n?/g, "\n").split("\n");
    /* 跳过 YAML front matter */
    if (lines[0] && lines[0].trim() === "---") {
      var end = 1;
      while (end < lines.length && lines[end].trim() !== "---") end++;
      lines = lines.slice(end + 1);
    }
    return renderBlocks(lines);
  }

  /* ---------- 首页 ---------- */
  function renderHome() {
    crumbEl.textContent = "MediaPipe 中文文档镜像";
    mainEl.innerHTML =
      '<div class="home-hero">' +
      "<h1>MediaPipe 中文文档镜像</h1>" +
      "<p>本镜像将 Google AI Edge 官方 MediaPipe 文档(<a href=\"https://developers.google.com/edge/mediapipe/solutions/guide\" target=\"_blank\" rel=\"noopener\">developers.google.com/edge/mediapipe</a>)完整翻译为简体中文,目录结构、图片位置、代码示例与原站保持一致,可离线阅读。</p>" +
      "<p>翻译规范与术语表见项目根目录《翻译规范.md》。内容遵循 CC BY 4.0 许可,代码示例遵循 Apache 2.0 许可。</p>" +
      "</div>" +
      '<div class="home-cards">' +
      '<a href="#docs/solutions/guide.md"><h3>Solutions 指南</h3><p>MediaPipe Solutions 总览:任务 API、模型、Model Maker、Studio,以及各任务支持平台一览。</p></a>' +
      '<a href="#docs/solutions/tasks.md"><h3>Tasks 任务 API</h3><p>跨平台的视觉、文本、音频、生成式 AI 与检索任务的快速上手与配置。</p></a>' +
      '<a href="#docs/framework/overview.md"><h3>Framework 框架</h3><p>MediaPipe Framework 的安装、入门教程与核心概念:计算器、计算图、数据包、同步、GPU。</p></a>' +
      '<a href="#docs/solutions/setup_android.md"><h3>平台配置</h3><p>Android / iOS / Python / Web 四种平台的开发环境配置指南。</p></a>' +
      "</div>";
  }

  /* ---------- 路由与加载 ---------- */
  function currentFile() {
    var h = location.hash.replace(/^#/, "");
    if (!h) return null;
    var i = h.lastIndexOf("#");
    return i >= 0 ? h.slice(0, i) : h;
  }
  function currentAnchor() {
    var h = location.hash.replace(/^#/, "");
    var i = h.lastIndexOf("#");
    return i >= 0 ? h.slice(i + 1) : "";
  }

  function loadDoc(file, anchor) {
    crumbEl.textContent = file;
    mainEl.innerHTML = '<div class="status">正在加载 ' + esc(file) + " …</div>";
    fetch(file).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function (text) {
      /* 解析 front matter 得到标题 */
      var title = file;
      var m = /^---\n([\s\S]*?)\n---/.exec(text);
      if (m) {
        var tm = /^title:\s*["']?([^"'\n]+)["']?/m.exec(m[1]);
        if (tm) title = tm[1].trim();
      }
      crumbEl.textContent = title + " — " + file;
      document.title = title + " | MediaPipe 中文文档镜像";
      mainEl.innerHTML = '<article class="md-body">' + renderMarkdown(text) + "</article>";
      /* 解析相对引用并绑定点击 */
      mainEl.querySelectorAll("a, img").forEach(function (el) {
        var attr = el.tagName === "A" ? "href" : "src";
        if (!el.getAttribute(attr)) return;
        if (/^https?:|^mailto:/.test(el.getAttribute(attr))) return;
        var resolved = resolveRef(file, el.getAttribute(attr));
        el.setAttribute(attr, resolved);
        if (el.tagName === "A") {
          el.addEventListener("click", function (e) {
            var href = el.getAttribute("href");
            if (/^https?:|^mailto:/.test(href)) return;
            if (href.indexOf("#") === 0) { /* 页内锚点 */ return; }
            if (href.toLowerCase().endsWith(".md")) {
              e.preventDefault();
              location.hash = "#" + href;
            }
          });
        }
      });
      highlightNav(file);
      if (anchor) {
        var node = document.getElementById(anchor);
        if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
    }).catch(function (err) {
      crumbEl.textContent = file;
      mainEl.innerHTML = '<div class="status error"><strong>无法加载 ' + esc(file) + "</strong><br>" +
        "(" + esc(String(err)) + ")<br><br>请确认:1) 该页面已生成;2) 通过本地 HTTP 服务器访问(如 <code>python3 -m http.server</code> 后打开 <code>http://localhost:8000/</code>),直接双击 file:// 打开时浏览器会禁止 fetch md 文件。</div>";
      document.title = "MediaPipe 中文文档镜像";
    });
  }

  /* ---------- 导航渲染 ---------- */
  function buildNav() {
    var wrap = document.createElement("div");
    wrap.className = "nav-tree";
    NAV.forEach(function (g) {
      var gh = document.createElement("div");
      gh.className = "nav-group";
      gh.textContent = g.group;
      wrap.appendChild(gh);
      g.items.forEach(function (it) {
        wrap.appendChild(navItemEl(it, 0));
      });
    });
    sidebarEl.appendChild(wrap);
  }

  var navBranchId = 0;
  function navItemEl(item, depth) {
    var holder = document.createElement("div");
    holder.className = "nav-section";
    if (item.section) {
      var sec = document.createElement("div");
      sec.className = "nav-group";
      sec.style.paddingTop = "10px";
      sec.textContent = item.label;
      holder.appendChild(sec);
      (item.children || []).forEach(function (c) {
        holder.appendChild(navItemEl(c, depth + 1));
      });
      return holder;
    }
    var a = document.createElement("a");
    a.className = "nav-item" + (item.children ? "" : " nav-leaf");
    a.setAttribute("data-file", item.file);
    a.href = "#" + item.file;
    a.textContent = item.label;
    a.addEventListener("click", function (e) {
      location.hash = "#" + item.file;
      e.preventDefault();
      if (mobileLayout.matches) setMenuOpen(false, true);
    });
    var row = document.createElement("div");
    row.className = "nav-row";
    row.appendChild(a);
    holder.appendChild(row);
    if (item.children && item.children.length) {
      var box = document.createElement("div");
      box.className = "nav-children";
      box.id = "nav-branch-" + (++navBranchId);
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "nav-toggle";
      toggle.setAttribute("aria-label", "展开或收起“" + item.label + "”子章节");
      toggle.setAttribute("aria-controls", box.id);
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", function () {
        var open = box.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      row.appendChild(toggle);
      item.children.forEach(function (c) {
        box.appendChild(navItemEl(c, depth + 1));
      });
      holder.appendChild(box);
    }
    return holder;
  }

  var allNavNodes = null;
  function collectNav() {
    if (!allNavNodes) allNavNodes = Array.prototype.slice.call(sidebarEl.querySelectorAll(".nav-item[data-file]"));
    return allNavNodes;
  }
  function highlightNav(file) {
    collectNav().forEach(function (n) {
      n.classList.toggle("active", n.getAttribute("data-file") === file);
      if (n.getAttribute("data-file") === file) {
        var p = n.parentElement;
        while (p && p !== sidebarEl) {
          if (p.classList && p.classList.contains("nav-section")) {
            var ch = p.querySelector(":scope > .nav-children");
            if (ch) {
              ch.classList.add("open");
              p.querySelector(":scope > .nav-row > .nav-toggle").setAttribute("aria-expanded", "true");
            }
          }
          p = p.parentElement;
        }
      }
    });
  }

  /* 搜索过滤 */
  var savedBranches = null;
  searchEl.addEventListener("input", function () {
    var q = searchEl.value.trim().toLowerCase();
    var branches = Array.from(sidebarEl.querySelectorAll(".nav-children"));
    if (q && !savedBranches) savedBranches = branches.map(function (box) { return box.classList.contains("open"); });
    function filterSection(section, ancestorMatches) {
      var row = section.querySelector(":scope > .nav-row");
      var link = row && row.querySelector(".nav-item");
      var label = link || section.querySelector(":scope > .nav-group");
      var ownMatch = !!label && label.textContent.toLowerCase().indexOf(q) >= 0;
      var matches = !q || ancestorMatches || ownMatch;
      var children = section.querySelector(":scope > .nav-children");
      var anyChild = false;
      var childSections = Array.from((children || section).children).filter(function (child) { return child.classList.contains("nav-section"); });
      childSections.forEach(function (child) {
          if (filterSection(child, matches)) anyChild = true;
      });
      if (children) {
        if (q) children.classList.toggle("open", anyChild);
        else if (savedBranches) children.classList.toggle("open", savedBranches[branches.indexOf(children)]);
        row.querySelector(".nav-toggle").setAttribute("aria-expanded", String(children.classList.contains("open")));
      }
      section.hidden = !(matches || anyChild);
      return !section.hidden;
    }
    sidebarEl.querySelectorAll(".nav-tree > .nav-section").forEach(function (section) {
      filterSection(section, false);
    });
    if (!q) { savedBranches = null; highlightNav(currentFile()); }
  });

  /* ---------- 启动 ---------- */
  buildNav();
  window.addEventListener("hashchange", function () {
    if (menuOpen) setMenuOpen(false, true);
    var f = currentFile();
    if (f) loadDoc(f, currentAnchor()); else renderHome();
  });
  var f = currentFile();
  if (f) loadDoc(f, currentAnchor());
  else {
    document.title = "MediaPipe 中文文档镜像";
    renderHome();
  }
})();
