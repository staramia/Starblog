export const navSections = [
  {
    key: 'notes',
    title: '文章索引',
    summary: '汇总网站所有用户发布的文章，可按时间和作者快速检索。',
    examples: ['全部文章', '按作者查看', '最新发布'],
  },
  {
    key: 'reports',
    title: '工作汇报',
    summary: '沉淀周报、月报、项目复盘与里程碑进展。',
    examples: ['周报', '项目复盘', '里程碑'],
  },
  {
    key: 'roadmap',
    title: '关于与路线图',
    summary: '介绍站点定位、更新计划与开放协作规则。',
    examples: ['网站规则', '更新计划', '协作说明'],
  },
];

export type NavSection = (typeof navSections)[number];
