import { collection, config, fields, singleton } from '@keystatic/core';

const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO || 'owner/repo';

export default config({
  storage: {
    kind: 'github',
    repo,
  },
  ui: {
    brand: {
      name: 'Starblog CMS',
    },
    navigation: {
      Posts: ['posts'],
      Settings: ['site'],
    },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      path: 'src/content/posts/*.md',
      format: {
        contentField: 'content',
      },
      entryLayout: [
        'title',
        'status',
        'slug',
        'category',
        'tags',
        'publishedAt',
        'updatedAt',
        'excerpt',
        'cover',
        'seoTitle',
        'seoDescription',
        'canonical',
        'content',
      ],
      schema: {
        title: fields.text({
          label: 'Title',
          description: 'Article title shown in listings and pages.',
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        slug: fields.text({
          label: 'Slug',
          description: 'Used in URL. Example: astro-keystatic-setup',
          validation: { isRequired: true },
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          validation: { isRequired: false, length: { max: 200 } },
        }),
        cover: fields.image({
          label: 'Cover',
          directory: 'public/uploads',
          publicPath: '/uploads/',
        }),
        category: fields.text({
          label: 'Category',
          validation: { isRequired: true },
        }),
        tags: fields.array(
          fields.text({
            label: 'Tag',
            validation: { isRequired: true },
          }),
          {
            label: 'Tags',
            itemLabel: (props) => props.value || 'Tag',
            validation: { length: { max: 8 } },
          }
        ),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        publishedAt: fields.datetime({
          label: 'Published At',
          validation: { isRequired: false },
        }),
        updatedAt: fields.datetime({
          label: 'Updated At',
          validation: { isRequired: false },
        }),
        seoTitle: fields.text({
          label: 'SEO Title',
          validation: { isRequired: false },
        }),
        seoDescription: fields.text({
          label: 'SEO Description',
          multiline: true,
          validation: { isRequired: false, length: { max: 160 } },
        }),
        canonical: fields.url({
          label: 'Canonical URL',
          validation: { isRequired: false },
        }),
        content: fields.document({
          label: 'Content',
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
      label: 'Site Settings',
      path: 'src/content/site/settings',
      schema: {
        siteName: fields.text({
          label: 'Site Name',
          validation: { isRequired: true },
        }),
        siteDescription: fields.text({
          label: 'Site Description',
          multiline: true,
          validation: { isRequired: true },
        }),
      },
    }),
  },
});
