# 文档路由与多内容目录说明

## 1. /vla 页面是如何实现的？

访问 `/vla`（以及 `/vla/某分类/某文章`）能打开 `content/docs/` 下对应 md 文件，整体流程如下。

### 1.1 配置内容源（fumadocs-mdx）

在 **`source.config.ts`** 里用 fumadocs-mdx 的 `defineDocs` 声明「文档目录」：

```ts
export const docs = defineDocs({
  dir: 'content/docs',
});
```

- 构建时（如 `next dev` / `next build`）会扫描 `content/docs` 下的 `.md`/`.mdx`，在项目根目录生成 **`.source`**（元数据、目录树等）。
- URL 路径与文件路径对应关系：  
  `/vla/VLA_世界模型/小鹏汽车提出 Drive-JEPA...`
  → 文件 `content/docs/VLA_世界模型/小鹏汽车提出 Drive-JEPA....md`（按文件名匹配）。

### 1.2 创建 Loader（baseUrl + 侧边栏树）

在 **`src/core/docs/source.ts`** 里为 docs 创建一个 loader，并指定 baseUrl：

```ts
import { docs } from '@/.source';

export const docsSource = loader({
  baseUrl: '/vla',
  source: docs.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});

export const source = docsSource;  // 默认导出给 /vla 使用
```

- `baseUrl: '/vla'` 表示这类文档的 URL 前缀是 `/vla`。
- `docs.toFumadocsSource()` 提供「根据 slug 取页面、生成目录树」等能力。

### 1.3 路由与渲染

- **路由**：`src/app/[locale]/(docs)/vla/[[...slug]]/page.tsx`
  - `[[...slug]]` 会匹配 `/vla`、`/vla/xxx`、`/vla/xxx/yyy` 等。
- **渲染逻辑**（同文件内）：
  1. 先查数据库：`getDocFromDB(params.slug)`（管理员在后台发布的「文档」）。
  2. 若没有，再用文件源：`source.getPage(params.slug, params.locale)`，得到对应 md 的 MDX 内容并渲染。
- **侧边栏**：同目录下的 **`layout.tsx`** 使用 `source.pageTree[lang]`，树形结构来自 `content/docs` 的目录与文件结构。

因此：**你访问的 /vla 路径 = content/docs 下的相对路径**，文章来自「数据库文档」或「content/docs 下的 md 文件」。

---

## 2. 其他目录能否也像 /docs 一样看到文章？

可以。项目里已经为多个目录配好了「内容源」，只是挂的 URL 不同：

| 目录               | 配置名   | 访问方式 / URL 说明 |
|--------------------|----------|----------------------|
| `content/docs`     | docs     | **/vla/**…（带侧边栏的文档站） |
| `content/pages`    | pages    | **根路径**：`/关于我们` 等，由 `(landing)/[...slug]` + `getLocalPage(pagesSource)` 渲染 |
| `content/posts`    | posts    | **/blog**：博客列表与文章详情，由 `getPost`（DB + postsSource） |
| `content/logs`     | logs     | 同样通过 **/blog**，在「日志」类型下用 logsSource 拉取 |

所以：  
- **其他目录里的 md 已经能对应到文章**，只是有的在根路径、有的在 /blog。  
- 只有 **docs** 拥有独立的 `/vla` 前缀和文档站侧边栏；pages/posts/logs 没有单独的「文档站」布局，而是用落地页或博客布局。

---

## 3. 想再添加「一个页面」（新的文档站或新栏目）该怎么做？

若要新增**一整块像 /docs 一样的栏目**（例如 `/wiki` 或 `/notes`，有自己 URL 前缀和侧边栏），按下面做即可。

### 步骤 1：在 source.config.ts 里增加一个内容源

```ts
export const docs = defineDocs({ dir: 'content/docs' });

// 新增，例如「知识库」
export const wiki = defineDocs({
  dir: 'content/wiki',   // 新目录，可自定
});
```

### 步骤 2：在 src/core/docs/source.ts 里为该源建 loader

```ts
import { docs, wiki } from '@/.source';  // 若有 wiki

export const docsSource = loader({ baseUrl: '/vla', source: docs.toFumadocsSource(), ... });

export const wikiSource = loader({
  baseUrl: '/wiki',
  source: wiki.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});
```

### 步骤 3：新建路由与布局

- 新建目录，例如：  
  `src/app/[locale]/(wiki)/wiki/[[...slug]]/page.tsx`  
  实现可参考 `(docs)/vla/[[...slug]]/page.tsx`：用 `wikiSource.getPage(params.slug, params.locale)` 取页面并渲染；若需要「先 DB 再文件」，可类似 docs 先写 `getWikiFromDB` 再 fallback 到 `wikiSource.getPage`。
- 新建同组 layout：  
  `src/app/[locale]/(wiki)/layout.tsx`  
  用 fumadocs 的 DocsLayout，`tree={wikiSource.pageTree[lang]}`，这样侧边栏会显示 `content/wiki` 的目录结构。

### 步骤 4：（可选）搜索

若需要站内搜索，可复制 `src/app/api/docs/search/route.ts` 为 `api/wiki/search/route.ts`，把其中的 `docs` 换成 `wiki`，并在 layout 的 search options 里指向 `/api/wiki/search`。

---

总结：

1. **/vla 能访问 content/docs 下的文章**：由 `source.config.ts` 的 docs 源 + `source.ts` 的 docsSource + `(docs)/vla/[[...slug]]/page.tsx` 和 layout 的 pageTree 一起实现。  
2. **其他目录**（pages/posts/logs）已经能对应文章，只是分别在根路径和 /blog。  
3. **再添加一个「像 /docs 的页面」**：新 defineDocs → 新 loader → 新路由 `[[...slug]]` + 新 layout（pageTree），即可。
