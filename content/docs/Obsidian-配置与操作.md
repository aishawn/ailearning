# Obsidian 配置与操作（最终版）

## 一、库（Vault）怎么开

打开 Obsidian → **打开文件夹作为库**  
选整个**项目根目录**，例如：  
`C:\shawn\1code\1project-cur\vla\webv1`

左侧文件树会同时显示 `content/`、`images/`、`public/` 等目录。

---

## 二、图片存哪里（核心设置）

**设置 → 文件与链接（Files & links）**：

| 选项 | 值 |
|------|----|
| 新附件的默认存放位置 | **在指定文件夹下** |
| 路径 | `images` |

> 这样粘贴图片会进 `images/`，与 `content/` 完全分离，仓库目录干净。

**按主题分子目录（推荐）**：

例如写 `content/docs/VLA_世界模型/xxx.md`，就在设置里把路径改为  
`images/docs/VLA_世界模型`，粘贴后图片进对应子目录，一目了然。

---

## 三、关闭 Wikilinks（必须）

**设置 → 文件与链接（Files & links）**：

关闭：**使用 \[\[Wikilinks\]\]**（Use [[Wikilinks]]）

不关闭 Obsidian 会用 `![[文件名]]` 格式，网站无法渲染。

---

## 四、写文章 + 粘贴图片的流程

1. 在左侧文件树里打开/新建 `content/docs/VLA_世界模型/xxx.md`。
2. 撰写内容，需要插图时 **Ctrl+V** 粘贴截图。
3. Obsidian 会自动：
   - 把图片保存到 `images/docs/VLA_世界模型/`（如你设置了子目录）
   - 在笔记里插入相对路径，例如：  
     `![](../../images/docs/VLA_世界模型/arch.png)`

4. **无需手动修改路径**。  
   项目的 remark 插件（`source.config.ts`）在构建时会自动把：  
   `../../images/docs/VLA_世界模型/arch.png`  
   重写为：  
   `/docs-images/docs/VLA_世界模型/arch.png`  
   网站正常渲染。

---

## 五、完整流程（写完到上线）

```
本地写 MD（Obsidian）
  ↓ Ctrl+V 粘贴图片
图片 → images/docs/VLA_世界模型/arch.png
MD 里路径 ../../images/...（Obsidian 自动）
  ↓ git add . && git commit && git push
  ↓ 部署（pnpm build 或 Vercel/Cloudflare 自动触发）
  ↓ scripts/copy-images.mjs 先跑
images/docs/VLA_世界模型/arch.png → public/docs-images/docs/VLA_世界模型/arch.png
  ↓ remark 插件重写 MD 里的路径
../../images/... → /docs-images/...
  ↓ 网站渲染
<img src="/docs-images/docs/VLA_世界模型/arch.png" />  ✅
```

---

## 六、本地预览也能看到图片

`pnpm dev` 已经改为先运行 `copy-images.mjs`，所以 `localhost:3000` 里预览时图片也正常显示：

```json
"dev": "node scripts/copy-images.mjs && next dev --turbopack"
```

---

## 七、推荐插件（可选）

| 插件 | 作用 |
|------|------|
| **Paste image rename** | 粘贴时弹窗重命名（避免 `image-20241201.png` 这类无意义名字） |
| **QuickAdd** | 快速在指定目录新建笔记（如固定建在 `content/docs/VLA_世界模型/`） |
| **Templater** | 设置文章模板，自动填充 frontmatter（title、date 等） |

---

## 八、文章 frontmatter（可选但建议加）

fumadocs 支持从 frontmatter 读取文档标题和描述，在 MD 文件开头加：

```yaml
---
title: 字节&港大提出 WoG：告别昂贵的视频预测
description: WoG 框架通过「条件空间」把未来观察压缩为动作相关特征，刷新多项 SOTA。
---
```

在网站侧栏和标签页标题里会自动使用这些字段。

---

## 九、目录结构总览

```
project/
├── content/
│   └── docs/               ← 只放发布文档（Obsidian 在这里写）
│       ├── VLA_世界模型/
│       │   └── WoG-字节港大.md
│       └── VLA_info/
├── images/                 ← 写作用图（Obsidian 粘贴到这里）
│   └── docs/
│       ├── VLA_世界模型/
│       │   └── arch.png
│       └── VLA_info/
├── public/
│   └── docs-images/        ← 构建时自动生成，不进 git
│       └── docs/
│           └── VLA_世界模型/
│               └── arch.png
└── scripts/
    └── copy-images.mjs     ← images/ → public/docs-images/
```
