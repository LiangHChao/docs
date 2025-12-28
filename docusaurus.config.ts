// docusaurus.config.ts
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '文档',
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
        path: '/docs/docs',
        routeBasePath: 'docs', // ← 无前导 /
        sidebarPath: require.resolve('./sidebars.js'),
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
        sidebarPath: require.resolve('./sidebarsJavadoc.js'), // ← 独立侧边栏
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
          label: '示例',
        },
        {to: '/blog', label: '博客', position: 'left'},
        // ✅ 导航到 javadoc 首页
        {to: '/javadoc', label: 'Java', position: 'left'}, // 自动跳转到 javadoc/intro
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
              label: 'Tutorial',
              to: '/docs/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
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