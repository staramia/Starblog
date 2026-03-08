---
title:
  name: "欢迎来到 Starblog"
  slug: "welcome-to-starblog"
advanced:
  discriminant: true
  value:
    excerpt: "这是第一篇示例文章，用于验证 Keystatic 到 Astro 的完整发布链路。"
    cover: "/uploads/demo-cover.svg"
    category: "公告"
    tags: ["Astro", "Keystatic", "Cloudflare"]
    status: "published"
    seoTitle: "欢迎来到 Starblog：零成本可视化博客"
    seoDescription: "使用 Astro + Keystatic + Cloudflare Pages 实现类 Word 编辑与自动化发布。"
    canonical: "https://example.com/posts/welcome-to-starblog"
---

欢迎使用 Starblog。

这个项目用于验证以下能力：

- 可视化后台编辑（`/keystatic`）
- GitHub 模式发布提交
- Cloudflare Pages 自动构建部署

## 代码高亮示例

```ts
export function hello(name: string) {
  return `Hello, ${name}`;
}
```

> 如果你正在阅读这篇文章，说明前台路由与 Markdown 渲染已经生效。
