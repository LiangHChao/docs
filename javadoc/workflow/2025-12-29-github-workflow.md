---
slug: server-github-workflow-2
title: GitHub Workflow2
authors: [ lianghchao ]
tags: [ server, github, workflow ]
---

## GitHub Pages 静态网站托管服务更新版
- github自动化构建工作流
- 在项目根目录下创建文件
```
.github/workflows/deploy.yml
```
- 内容如下
```yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # 👈 显式授权（GitHub Actions 最佳实践）

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Verify build output
        run: |
          ls -la ./build
          if [ ! -d "./build" ] || [ -z "$(ls -A ./build)" ]; then
            echo "❌ Build directory is missing or empty!"
            exit 1
          fi

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
```