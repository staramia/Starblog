import { collection, config, fields, singleton } from '@keystatic/core';

const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO || 'owner/repo';
const storageMode = import.meta.env.PUBLIC_KEYSTATIC_STORAGE || (import.meta.env.DEV ? 'local' : 'github');

export default config({
  storage:
    storageMode === 'github'
      ? {
          kind: 'github',
          repo,
        }
      : {
          kind: 'local',
        },
  ui: {
    brand: {
      name: 'Starblog 内容管理',
    },
    navigation: {
      内容: ['posts'],
      设置: ['site'],
    },
  },
  collections: {
    posts: collection({
      label: '文章',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: {
        contentField: 'content',
        data: 'yaml',
      },
      entryLayout: ['title', 'content', 'advanced'],
      schema: {
        title: fields.slug({
          name: {
            label: '标题',
            description: '用于列表与详情页展示，建议简洁明确。',
            validation: { isRequired: true, length: { min: 1, max: 120 } },
          },
          slug: {
            label: 'Slug',
            description: '用于文章 URL，例如：astro-keystatic-setup',
          },
        }),
        advanced: fields.conditional(
          fields.checkbox({
            label: '显示高级设置',
            defaultValue: false,
          }),
          {
            false: fields.empty(),
            true: fields.object(
              {
                excerpt: fields.text({
                  label: '摘要',
                  multiline: true,
                  validation: { isRequired: false, length: { max: 200 } },
                }),
                cover: fields.image({
                  label: '封面图',
                  directory: 'public/uploads',
                  publicPath: '/uploads/',
                }),
                category: fields.text({
                  label: '分类',
                  defaultValue: '未分类',
                  validation: { isRequired: false },
                }),
                tags: fields.array(
                  fields.text({
                    label: '标签',
                    validation: { isRequired: true },
                  }),
                  {
                    label: '标签列表',
                    itemLabel: (props) => props.value || '新标签',
                    validation: { length: { max: 8 } },
                  }
                ),
                status: fields.select({
                  label: '状态',
                  options: [
                    { label: '草稿', value: 'draft' },
                    { label: '已发布', value: 'published' },
                  ],
                  defaultValue: 'published',
                }),
                seoTitle: fields.text({
                  label: 'SEO 标题',
                  validation: { isRequired: false },
                }),
                seoDescription: fields.text({
                  label: 'SEO 描述',
                  multiline: true,
                  validation: { isRequired: false, length: { max: 160 } },
                }),
                canonical: fields.url({
                  label: '规范链接 Canonical URL',
                  validation: { isRequired: false },
                }),
              },
              {
                label: '高级设置',
              }
            ),
          }
        ),
        publishedAt: fields.ignored(),
        updatedAt: fields.ignored(),
        content: fields.document({
          label: '正文内容',
          formatting: true,
          links: true,
          dividers: true,
          layouts: [
            [1, 1],
            [1, 1, 1],
          ],
        }),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: '站点设置',
      path: 'src/content/site/settings',
      schema: {
        siteName: fields.text({
          label: '站点名称',
          validation: { isRequired: true },
        }),
        siteDescription: fields.text({
          label: '站点描述',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),
  },
});
