// docusaurus.config.ts
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LiangHChao的个人博客项目',
  tagline: '欢迎使用',
  favicon: 'img/favicon.ico',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'ignore',
  future: {
    v4: true,
  },

  url: 'https://lianghchao.github.io',
  baseUrl: '/docs/', // GitHub Pages 部署路径

  organizationName: 'LiangHChao',
  projectName: 'docs',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // ✅ 关键：使用 plugins 定义多个 docs 实例
  plugins: [
    // 主文档（默认）
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'default',
        path: 'docs',
        routeBasePath: 'docs', // ← 无前导 /
        sidebarPath: require.resolve('./sidebars.ts'),
        editUrl: 'https://github.com/LiangHChao/docs/edit/master',
      },
    ],
    // 👇 Javadoc 文档（修正版）
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'javadoc',
        path: 'javadoc',         // 源文件目录
        routeBasePath: 'javadoc', // ← 重点：不要 / 开头！
        sidebarPath: require.resolve('./sidebarsJavadoc.ts'), // ← 独立侧边栏
        // breadcrumbs: true,
        editUrl: 'https://github.com/LiangHChao/docs/edit/master',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'sqlDoc',
        path: 'sql-doc',         // 源文件目录
        routeBasePath: 'sqlDoc', // ← 重点：不要 / 开头！
        sidebarPath: require.resolve('./sidebarsSQLdoc.ts'), // ← 独立侧边栏
        // breadcrumbs: true,
        editUrl: 'https://github.com/LiangHChao/docs/edit/master',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: false, // 已在 plugins 中配置，此处禁用
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/LiangHChao/docs/edit/master',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '我的文档',
      logo: {
        alt: '我的文档 Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '文档',
        },
        // ✅ 导航到 javadoc 首页
        {
          type: 'docSidebar',
          sidebarId: 'javaSidebar',
          docsPluginId: 'javadoc',
          position: 'left',
          label: 'Java',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sqlSidebar',
          docsPluginId: 'sqlDoc',
          position: 'left',
          label: 'SQL',
        },
        {to: '/blog', label: '博客', position: 'left'},
        {
          href: 'https://github.com/LiangHChao/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: '文档',
              to: '/docs/docs/intro',
            },
          ],
        },
        {
          title: 'Learn More',
          items: [
            {
              label: 'RuoYi-Plus',
              href: 'https://plus-doc.top/',
            },
            {
              label: 'no-ip',
              href: 'https://my.noip.com/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: '博客',
              to: '/blog',
            },
            {
              label: 'Dinosaurs',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;