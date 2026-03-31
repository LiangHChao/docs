---
slug: html-css-tailwindcss
title: Tailwind CSS 使用教程
authors: [ lianghchao ]
tags: [ html, css ]
---
# Tailwind CSS 使用教程

这份文档面向初学者到进阶开发者，讲解 Tailwind CSS 的核心使用方式，并提供可直接复制的示例代码。

---

## 1. Tailwind CSS 是什么

Tailwind CSS 是一个 **Utility-First（工具类优先）** 的 CSS 框架。  
它通过大量原子类（如 `p-4`、`text-center`、`bg-blue-500`）快速组合样式，而不是手写大量自定义 CSS。

### 1.1 优点
- 开发快：不频繁在 HTML/CSS 文件来回切换。
- 一致性高：间距、颜色、字号都在统一体系内。
- 易维护：删除组件时，对应类名也随组件删除，减少“无用 CSS”。

### 1.2 适用场景
- 后台管理系统
- 活动页和营销页
- 组件库开发
- 与 React/Vue/Next.js 等项目配合

---

## 2. 快速开始（CDN 方式）

适合学习和小 Demo，直接在 HTML 中使用：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>Tailwind Demo</title>
</head>
<body class="bg-slate-100 min-h-screen flex items-center justify-center">
  <h1 class="text-3xl font-bold text-blue-600">Hello Tailwind CSS</h1>
</body>
</html>
```

---

## 3. 常用语法速查

## 3.1 间距（margin/padding）
- `m-4`：外边距
- `p-4`：内边距
- `mx-auto`：水平居中
- `space-y-4`：子元素纵向间距

```html
<div class="p-6 bg-white rounded-lg shadow">
  <h2 class="text-xl font-semibold mb-4">标题</h2>
  <p class="text-gray-600">这是一段描述文字</p>
</div>
```

## 3.2 颜色与文字
- `text-gray-700`：文字颜色
- `bg-blue-500`：背景色
- `font-bold`：加粗
- `text-sm` / `text-lg` / `text-2xl`：字号

```html
<button class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded">
  提交
</button>
```

## 3.3 布局（flex/grid）

```html
<div class="flex items-center justify-between p-4 bg-white rounded">
  <span>左侧</span>
  <span>右侧</span>
</div>

<div class="grid grid-cols-3 gap-4 mt-4">
  <div class="bg-white p-4 rounded">1</div>
  <div class="bg-white p-4 rounded">2</div>
  <div class="bg-white p-4 rounded">3</div>
</div>
```

---

## 4. 状态与响应式

## 4.1 伪类状态
- `hover:` 鼠标悬停
- `focus:` 聚焦
- `active:` 按下
- `disabled:` 禁用

```html
<input
  class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="请输入内容"
/>
```

## 4.2 响应式断点
Tailwind 默认断点前缀：
- `sm:` >= 640px
- `md:` >= 768px
- `lg:` >= 1024px
- `xl:` >= 1280px

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="bg-white p-4 rounded">卡片 A</div>
  <div class="bg-white p-4 rounded">卡片 B</div>
  <div class="bg-white p-4 rounded">卡片 C</div>
  <div class="bg-white p-4 rounded">卡片 D</div>
</div>
```

---

## 5. 组件示例（可直接复用）

## 5.1 按钮组

```html
<div class="flex gap-3">
  <button class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">主按钮</button>
  <button class="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">次按钮</button>
  <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">危险按钮</button>
</div>
```

## 5.2 卡片组件

```html
<article class="bg-white rounded-xl shadow p-5">
  <h3 class="text-lg font-semibold mb-2">卡片标题</h3>
  <p class="text-gray-600 mb-4">卡片内容说明文本，支持多行展示。</p>
  <a class="text-blue-600 hover:underline" href="#">查看详情</a>
</article>
```

## 5.3 登录表单

```html
<form class="max-w-sm mx-auto bg-white p-6 rounded-xl shadow space-y-4">
  <h2 class="text-xl font-bold">登录</h2>
  <input class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="邮箱" />
  <input type="password" class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="密码" />
  <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">登录</button>
</form>
```

---

## 6. 实战示例：后台列表页布局

```html
<div class="min-h-screen bg-gray-100">
  <header class="h-14 bg-white border-b px-6 flex items-center justify-between">
    <h1 class="font-semibold">管理后台</h1>
    <div class="text-sm text-gray-600">管理员：Alex</div>
  </header>

  <div class="grid grid-cols-[220px_1fr]">
    <aside class="bg-slate-900 text-slate-200 min-h-[calc(100vh-56px)] p-4">
      <nav class="space-y-2">
        <a class="block px-3 py-2 rounded bg-slate-700" href="#">首页</a>
        <a class="block px-3 py-2 rounded hover:bg-slate-800" href="#">列表</a>
      </nav>
    </aside>

    <main class="p-6 space-y-4">
      <section class="bg-white rounded-xl p-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input class="border rounded px-3 py-2" placeholder="关键词" />
          <select class="border rounded px-3 py-2"><option>全部状态</option></select>
          <button class="bg-blue-600 text-white rounded px-3 py-2">搜索</button>
          <button class="bg-emerald-600 text-white rounded px-3 py-2">新增</button>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3">ID</th>
              <th class="text-left px-4 py-3">名称</th>
              <th class="text-left px-4 py-3">状态</th>
              <th class="text-left px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t">
              <td class="px-4 py-3">1001</td>
              <td class="px-4 py-3">示例数据 A</td>
              <td class="px-4 py-3">启用</td>
              <td class="px-4 py-3 space-x-2">
                <button class="px-3 py-1 rounded bg-amber-500 text-white">编辑</button>
                <button class="px-3 py-1 rounded bg-red-500 text-white">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</div>
```

---

## 7. 在工程中使用（推荐）

生产项目建议使用构建工具（Vite/Next.js）集成 Tailwind。

常见流程：
1. 安装依赖：`tailwindcss`、`postcss`、`autoprefixer`
2. 初始化配置：生成 `tailwind.config.js`
3. 在主 CSS 中引入：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. 配置 `content` 扫描模板文件，避免无用类被遗漏

---

## 8. 自定义主题（颜色、圆角、阴影）

在 `tailwind.config.js` 扩展主题：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          500: "#1d9bf0",
          700: "#136db0"
        }
      },
      borderRadius: {
        "2xl-plus": "1.25rem"
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
}
```

使用：

```html
<button class="bg-brand-500 hover:bg-brand-700 text-white rounded-2xl-plus shadow-soft px-4 py-2">
  品牌按钮
</button>
```

---

## 9. 常见问题与实践建议

## 9.1 类名太长怎么办？
- 拆组件（React/Vue）分块。
- 对重复组合抽成组件或 `@apply`（适度使用）。
- 使用格式化工具保持可读性。

## 9.2 是否还能写普通 CSS？
可以。Tailwind 不是禁止写 CSS，而是优先使用工具类。  
复杂动画、第三方覆盖、极少量全局样式可继续写在 CSS 文件中。

## 9.3 如何保持风格统一？
- 在配置中统一颜色、间距、圆角、阴影 token。
- 按钮、输入框、卡片优先组件化复用。

---

## 10. 中高级技巧示例（重点）

### 10.1 动画：过渡 + 关键帧 + 进入动效

```html
<div class="p-6">
  <button
    class="px-4 py-2 rounded-lg bg-indigo-600 text-white
           transition duration-300 ease-out
           hover:-translate-y-1 hover:shadow-xl hover:bg-indigo-500
           active:translate-y-0"
  >
    Hover 动画按钮
  </button>

  <div class="mt-6 size-10 rounded-full bg-pink-500 animate-bounce"></div>
</div>
```

扩展说明：
- `transition duration-300 ease-out` 适合交互反馈动画。
- `animate-bounce`、`animate-pulse` 等是内置动画类。
- 复杂项目建议在配置中定义语义动画名，避免页面里散落大量临时动画参数。

### 10.2 自适应布局：断点 + 网格 + 容器最大宽度

```html
<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <article class="rounded-xl bg-white p-4 shadow">卡片 1</article>
    <article class="rounded-xl bg-white p-4 shadow">卡片 2</article>
    <article class="rounded-xl bg-white p-4 shadow">卡片 3</article>
    <article class="rounded-xl bg-white p-4 shadow">卡片 4</article>
  </section>
</main>
```

扩展说明：
- `max-w-7xl mx-auto`：大屏限制内容宽度，小屏自动贴边。
- `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`：按设备宽度渐进增强。
- 推荐把“内容最大宽度、栅格列数、间距”抽成统一设计规则。

### 10.3 常见后台布局：侧边栏可折叠 + 主区自适应

```html
<div class="min-h-screen bg-slate-100">
  <div class="flex">
    <aside class="hidden md:block w-64 shrink-0 bg-slate-900 text-slate-100 p-4">
      <nav class="space-y-2">
        <a class="block rounded px-3 py-2 bg-slate-700" href="#">首页</a>
        <a class="block rounded px-3 py-2 hover:bg-slate-800" href="#">列表</a>
      </nav>
    </aside>

    <section class="flex-1 min-w-0 p-4 md:p-6">
      <header class="bg-white rounded-xl p-4 shadow-sm mb-4">顶部信息</header>
      <main class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm">主内容</div>
        <div class="bg-white rounded-xl p-4 shadow-sm">侧栏统计</div>
      </main>
    </section>
  </div>
</div>
```

扩展说明：
- `min-w-0` 很关键，可防止主区长内容撑破布局。
- `hidden md:block` 可实现移动端隐藏侧栏（搭配抽屉按钮更完整）。

### 10.4 暗黑模式 + 主题切换思路

```html
<html class="dark">
<body class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
  <div class="max-w-md mx-auto mt-10 rounded-xl border border-slate-200
              dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
    <h2 class="text-lg font-semibold">主题卡片</h2>
    <p class="text-slate-600 dark:text-slate-300">支持 dark 模式颜色切换</p>
  </div>
</body>
</html>
```

扩展说明：
- `dark:` 前缀配合 `class` 策略最常见，便于手动切换主题。
- 生产中建议把颜色抽到 `tailwind.config.js` 的语义 token（如 `bg-surface`、`text-primary`）。

### 10.5 表单体验增强：错误态、禁用态、可访问性

```html
<form class="max-w-lg space-y-4">
  <div>
    <label class="mb-1 block text-sm font-medium">邮箱</label>
    <input
      type="email"
      aria-invalid="true"
      class="w-full rounded-lg border border-red-400 bg-white px-3 py-2
             text-slate-900 placeholder:text-slate-400
             focus:outline-none focus:ring-2 focus:ring-red-500"
      placeholder="name@example.com"
    />
    <p class="mt-1 text-sm text-red-600">邮箱格式不正确</p>
  </div>

  <button disabled class="rounded-lg bg-slate-300 px-4 py-2 text-slate-500 cursor-not-allowed">
    提交（禁用）
  </button>
</form>
```

扩展说明：
- 用 `aria-*` 属性配合视觉状态，提升可访问性。
- 表单可搭配 `@tailwindcss/forms` 统一基础样式。

### 10.6 性能与工程化：减少类名膨胀

```css
/* app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-lg
           bg-blue-600 px-4 py-2 font-medium text-white
           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

```html
<button class="btn-primary">保存</button>
```

扩展说明：
- 高频重复样式可抽到 `@layer components`，减少模板噪音。
- `@apply` 适合“重复组合”，不建议把所有样式都改成自定义 class。

---

## 11. 进阶扩展方向

- 插件生态：`@tailwindcss/forms`、`@tailwindcss/typography`、`@tailwindcss/aspect-ratio`
- 深浅色模式：`dark:` + 本地存储主题偏好
- 动画库搭配：`animate-*` + 自定义 keyframes + Framer Motion（React）
- 与 Headless UI、Radix UI 结合提升可访问性和交互能力
- 多人协作：统一 `tailwind.config.js` token 与组件命名规范

---

## 12. 小结

Tailwind CSS 的核心思路是：  
**用可组合的原子类快速搭建 UI，再通过配置收敛设计规范。**

建议学习路线：
1. 先掌握常用工具类（间距、颜色、布局、状态、响应式）  
2. 再写 2~3 个完整页面（登录页、列表页、详情页）  
3. 加入中高级能力（动画、暗黑模式、自适应后台布局）  
4. 最后做主题配置与组件封装，形成自己的 UI 基础库  
