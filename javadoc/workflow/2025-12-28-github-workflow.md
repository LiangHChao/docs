---
slug: server-github-workflow
title: GitHub Workflow
authors: [ lianghchao ]
tags: [ server, github, workflow ]
---

## GitHub Pages 静态网站托管服务
- github自动化构建工作流
- 在项目根目录下创建文件`.github/workflows/deploy.yml`,格式如下
```yml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
push:
  branches: [ master ]  # 当 master 分支有推送时触发

jobs:
deploy:
runs-on: ubuntu-latest
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: Setup pnpm
    uses: pnpm/action-setup@v4  # 👈 关键！官方 pnpm 安装器
    with:
      version: 10  # 可选：指定版本，不写则用最新

  - name: Setup Node
    uses: actions/setup-node@v4
    with:
      node-version: '22'
      cache: 'pnpm'


  - name: Install dependencies
    run: pnpm i

  - name: Build
    run: pnpm run build

  - name: Deploy to GitHub Pages
    uses: peaceiris/actions-gh-pages@v4
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
      publish_dir: ./dist


```