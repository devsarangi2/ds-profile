# Personal Portfolio Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a markdown-driven personal portfolio site with About, Projects, Blog, Experience, and Contact sections, deployed to GitHub Pages.

**Architecture:** Astro static site generator with markdown content collections for blog/projects and YAML data files for experience/skills/certifications. Light/dark editorial theme with ADA-compliant colors, deployed via GitHub Actions to GitHub Pages.

**Tech Stack:** Astro 4.x, TypeScript, TailwindCSS v3, GitHub Actions, GitHub Pages

**Design Reference:** `docs/plans/2026-04-18-personal-portfolio-design.md`

---

### Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`

**Step 1: Scaffold Astro project**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-git --no-install
```

**Step 2: Install dependencies**

```bash
npm install
npm install @astrojs/tailwind @astrojs/mdx tailwindcss @tailwindcss/typography
npm install @astrojs/rss
```

**Step 3: Update `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://devsarangi.github.io',
  integrations: [tailwind(), mdx()],
});
```

**Step 4: Verify build runs clean**

```bash
npm run build
```
Expected: `dist/` folder created, no errors.

**Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Astro project with Tailwind and MDX"
```

---

### Task 2: Configure Tailwind Theme & Design Tokens

**Files:**
- Modify: `tailwind.config.mjs`
- Create: `src/styles/global.css`

**Step 1: Write `tailwind.config.mjs` with design tokens**

```js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#F8F9FA',
          dark: '#1A1D27',
        },
        accent: {
          light: '#2563EB',
          dark: '#60A5FA',
        },
        muted: {
          light: '#6B7280',
          dark: '#94A3B8',
        },
        border: {
          light: '#E5E7EB',
          dark: '#2D3748',
        },
      },
      fontFamily: {
        serif: ['Lora', ...defaultTheme.fontFamily.serif],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            h1: { fontFamily: theme('fontFamily.serif').join(', ') },
            h2: { fontFamily: theme('fontFamily.serif').join(', ') },
            h3: { fontFamily: theme('fontFamily.serif').join(', ') },
            code: { fontFamily: theme('fontFamily.mono').join(', ') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

**Step 2: Create `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@layer base {
  html {
    @apply bg-white text-gray-900 dark:bg-[#0F1117] dark:text-[#F1F5F9];
  }
  ::selection {
    @apply bg-blue-600/20;
  }
}
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: No errors.

**Step 4: Commit**

```bash
git add tailwind.config.mjs src/styles/global.css
git commit -m "feat: add design tokens and global styles"
```

---

### Task 3: Dark Mode Toggle Script

**Files:**
- Create: `src/scripts/theme.ts`

**Step 1: Write theme script**

```ts
// src/scripts/theme.ts
const theme = localStorage.getItem('theme') ??
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (theme === 'dark') document.documentElement.classList.add('dark');

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

**Step 2: Commit**

```bash
git add src/scripts/theme.ts
git commit -m "feat: add dark mode toggle with localStorage persistence"
```

---

### Task 4: Base Layout Component

**Files:**
- Create: `src/layouts/BaseLayout.astro`

**Step 1: Write `BaseLayout.astro`**

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Personal portfolio and blog of Devsarangi.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title} | devsarangi</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script is:inline>
      const t = localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (t === 'dark') document.documentElement.classList.add('dark');
    </script>
  </head>
  <body class="min-h-screen flex flex-col font-sans antialiased">
    <Nav />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add base layout with head meta and slot"
```

---

### Task 5: Navigation Component

**Files:**
- Create: `src/components/Nav.astro`

**Step 1: Write `Nav.astro`**

```astro
---
// src/components/Nav.astro
const navLinks = [
  { href: '/', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];
const currentPath = Astro.url.pathname;
---
<header class="sticky top-0 z-50 bg-white/80 dark:bg-[#0F1117]/80 backdrop-blur border-b border-[#E5E7EB] dark:border-[#2D3748]">
  <nav class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
      devsarangi
    </a>

    <!-- Desktop links -->
    <ul class="hidden md:flex items-center gap-6 text-sm font-medium">
      {navLinks.map(({ href, label }) => (
        <li>
          <a
            href={href}
            class:list={[
              'transition-colors hover:text-blue-600 dark:hover:text-blue-400',
              currentPath === href
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-[#6B7280] dark:text-[#94A3B8]',
            ]}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>

    <!-- Dark mode toggle -->
    <button
      id="theme-toggle"
      aria-label="Toggle dark mode"
      class="p-2 rounded-lg text-[#6B7280] dark:text-[#94A3B8] hover:bg-[#F8F9FA] dark:hover:bg-[#1A1D27] transition-colors"
    >
      <svg id="icon-sun" class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
      <svg id="icon-moon" class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  </nav>
</header>

<script>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

**Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: add sticky nav with dark mode toggle"
```

---

### Task 6: Footer / Contact Component

**Files:**
- Create: `src/components/Footer.astro`

**Step 1: Write `Footer.astro`**

```astro
---
// src/components/Footer.astro
const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/devsarangi',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/></svg>`,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/devsarangi',
    icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
  {
    label: 'Email',
    href: 'mailto:hello@devsarangi.dev',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  },
];
---
<footer id="contact" class="border-t border-[#E5E7EB] dark:border-[#2D3748] mt-16">
  <div class="max-w-4xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
    <p class="text-sm text-[#6B7280] dark:text-[#94A3B8]">
      &copy; {new Date().getFullYear()} devsarangi — built with Astro
    </p>
    <div class="flex items-center gap-4">
      {socials.map(({ label, href, icon }) => (
        <a
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          class="text-[#6B7280] dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          set:html={icon}
        />
      ))}
    </div>
  </div>
</footer>
```

**Step 2: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add footer with social icon links"
```

---

### Task 7: Configure Astro Content Collections

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/blog/.gitkeep`
- Create: `src/content/projects/.gitkeep`

**Step 1: Write `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
```

**Step 2: Verify build still passes**

```bash
npm run build
```
Expected: Clean build, no errors.

**Step 3: Commit**

```bash
git add src/content/
git commit -m "feat: define blog and projects content collections"
```

---

### Task 8: YAML Data Files for Experience, Certifications, Skills

**Files:**
- Create: `src/data/experience.yaml`
- Create: `src/data/certifications.yaml`
- Create: `src/data/skills.yaml`

**Step 1: Create `src/data/experience.yaml`** (placeholder — user fills in)

```yaml
- company: "Company Name"
  title: "Job Title"
  location: "City, Country"
  start: "Jan 2022"
  end: "Present"
  bullets:
    - "Led key initiative resulting in measurable outcome"
    - "Built or improved something important"
```

**Step 2: Create `src/data/certifications.yaml`**

```yaml
- name: "Certification Name"
  issuer: "Issuing Organization"
  date: "Jun 2024"
  badge: "/images/certs/placeholder.png"
  url: "https://example.com/verify"
```

**Step 3: Create `src/data/skills.yaml`**

```yaml
- category: "Languages"
  items: ["Python", "TypeScript", "SQL"]
- category: "Cloud"
  items: ["AWS", "GCP", "Terraform"]
- category: "Tools"
  items: ["Docker", "Git", "GitHub Actions"]
```

**Step 4: Install js-yaml for reading YAML in Astro**

```bash
npm install js-yaml
npm install --save-dev @types/js-yaml
```

**Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add placeholder YAML data files for experience, certs, skills"
```

---

### Task 9: Home / About Page

**Files:**
- Modify: `src/pages/index.astro`
- Create: `public/images/avatar.jpg` (user adds their own photo)

**Step 1: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);

const featuredProjects = (await getCollection('projects', ({ data }) => data.featured))
  .slice(0, 3);
---
<BaseLayout title="Home" description="Personal portfolio of devsarangi.">
  <!-- Hero -->
  <section class="max-w-4xl mx-auto px-6 pt-20 pb-16 flex flex-col md:flex-row items-center gap-10">
    <div class="flex-1">
      <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 tracking-wide uppercase">Hello, I'm</p>
      <h1 class="font-serif text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
        Devsarangi
      </h1>
      <p class="text-lg text-[#6B7280] dark:text-[#94A3B8] max-w-lg leading-relaxed">
        Engineer, builder, and occasional writer. I work on interesting problems at the intersection of data and software.
      </p>
      <div class="mt-6 flex gap-4">
        <a href="/projects" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          View Projects
        </a>
        <a href="/blog" class="px-5 py-2.5 border border-[#E5E7EB] dark:border-[#2D3748] rounded-lg text-sm font-medium text-[#6B7280] dark:text-[#94A3B8] hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
          Read Blog
        </a>
      </div>
    </div>
    <div class="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-blue-600/20 flex-shrink-0 bg-[#F8F9FA] dark:bg-[#1A1D27]">
      <img src="/images/avatar.jpg" alt="Devsarangi" class="w-full h-full object-cover" />
    </div>
  </section>

  <!-- Featured Projects -->
  {featuredProjects.length > 0 && (
    <section class="max-w-4xl mx-auto px-6 py-12 border-t border-[#E5E7EB] dark:border-[#2D3748]">
      <h2 class="font-serif text-2xl font-bold mb-6 text-gray-900 dark:text-white">Featured Projects</h2>
      <div class="grid md:grid-cols-3 gap-6">
        {featuredProjects.map((p) => (
          <a href={`/projects/${p.slug}`} class="group block p-5 rounded-xl border border-[#E5E7EB] dark:border-[#2D3748] bg-[#F8F9FA] dark:bg-[#1A1D27] hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">{p.data.title}</h3>
            <p class="text-sm text-[#6B7280] dark:text-[#94A3B8] mb-3">{p.data.description}</p>
            <div class="flex flex-wrap gap-1.5">
              {p.data.tags.map((tag) => (
                <span class="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded text-xs">{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
      <a href="/projects" class="inline-block mt-5 text-sm text-blue-600 dark:text-blue-400 hover:underline">All projects &rarr;</a>
    </section>
  )}

  <!-- Recent Blog Posts -->
  {posts.length > 0 && (
    <section class="max-w-4xl mx-auto px-6 py-12 border-t border-[#E5E7EB] dark:border-[#2D3748]">
      <h2 class="font-serif text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Writing</h2>
      <div class="flex flex-col gap-5">
        {posts.map((post) => (
          <a href={`/blog/${post.slug}`} class="group flex items-start justify-between gap-4 py-4 border-b border-[#E5E7EB] dark:border-[#2D3748] last:border-0">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">{post.data.title}</h3>
              <p class="text-sm text-[#6B7280] dark:text-[#94A3B8]">{post.data.excerpt}</p>
            </div>
            <time class="text-xs text-[#6B7280] dark:text-[#94A3B8] whitespace-nowrap mt-1">
              {post.data.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </time>
          </a>
        ))}
      </div>
      <a href="/blog" class="inline-block mt-5 text-sm text-blue-600 dark:text-blue-400 hover:underline">All posts &rarr;</a>
    </section>
  )}
</BaseLayout>
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: Clean build. Home page generated at `dist/index.html`.

**Step 3: Preview locally**

```bash
npm run dev
```
Open `http://localhost:4321` and visually verify hero section renders.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build home/about page with hero, projects teaser, blog teaser"
```

---

### Task 10: Projects Listing Page

**Files:**
- Create: `src/pages/projects/index.astro`

**Step 1: Write `src/pages/projects/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
---
<BaseLayout title="Projects" description="Side projects and builds by devsarangi.">
  <section class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-3">Projects</h1>
    <p class="text-[#6B7280] dark:text-[#94A3B8] mb-12 max-w-lg">
      A collection of side projects I've built — ranging from data tools to developer utilities.
    </p>

    {projects.length === 0 && (
      <p class="text-[#6B7280] dark:text-[#94A3B8]">Projects coming soon.</p>
    )}

    <div class="grid md:grid-cols-2 gap-6">
      {projects.map((p) => (
        <a href={`/projects/${p.slug}`} class="group block rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-[#2D3748] hover:shadow-lg hover:-translate-y-0.5 transition-all">
          {p.data.coverImage && (
            <div class="h-40 overflow-hidden">
              <img src={p.data.coverImage} alt={p.data.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          <div class="p-5 bg-[#F8F9FA] dark:bg-[#1A1D27]">
            <h2 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">{p.data.title}</h2>
            <p class="text-sm text-[#6B7280] dark:text-[#94A3B8] mb-3">{p.data.description}</p>
            <div class="flex flex-wrap gap-1.5">
              {p.data.tags.map((tag) => (
                <span class="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `dist/projects/index.html` generated.

**Step 3: Commit**

```bash
git add src/pages/projects/index.astro
git commit -m "feat: add projects listing page"
```

---

### Task 11: Project Detail Page

**Files:**
- Create: `src/pages/projects/[slug].astro`
- Create: `src/content/projects/sample-project.md` (placeholder)

**Step 1: Create placeholder project**

```markdown
---
title: "Sample Project"
description: "A placeholder project to test the layout."
tags: ["astro", "typescript"]
featured: true
---

## Overview

This is a sample project write-up. Replace with your own content.

## Problem

Describe the problem this project solves.

## Solution

Explain your approach and key technical decisions.
```

**Step 2: Write `src/pages/projects/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, getEntry } from 'astro:content';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((p) => ({ params: { slug: p.slug }, props: { project: p } }));
}

const { project } = Astro.props;
const { Content } = await project.render();
---
<BaseLayout title={project.data.title} description={project.data.description}>
  <article class="max-w-3xl mx-auto px-6 py-16">
    {project.data.coverImage && (
      <div class="rounded-xl overflow-hidden mb-10 h-64">
        <img src={project.data.coverImage} alt={project.data.title} class="w-full h-full object-cover" />
      </div>
    )}
    <div class="flex flex-wrap gap-2 mb-4">
      {project.data.tags.map((tag) => (
        <span class="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded text-xs">{tag}</span>
      ))}
    </div>
    <h1 class="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-4">{project.data.title}</h1>
    <div class="flex gap-4 mb-10 text-sm">
      {project.data.github && (
        <a href={project.data.github} target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">GitHub &rarr;</a>
      )}
      {project.data.demo && (
        <a href={project.data.demo} target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Live Demo &rarr;</a>
      )}
    </div>
    <div class="prose dark:prose-invert prose-lg max-w-none font-sans prose-headings:font-serif">
      <Content />
    </div>
    <div class="mt-12 pt-6 border-t border-[#E5E7EB] dark:border-[#2D3748]">
      <a href="/projects" class="text-sm text-[#6B7280] dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400">&larr; Back to projects</a>
    </div>
  </article>
</BaseLayout>
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: `dist/projects/sample-project/index.html` generated.

**Step 4: Commit**

```bash
git add src/pages/projects/ src/content/projects/
git commit -m "feat: add project detail page with markdown write-up support"
```

---

### Task 12: Blog Listing Page

**Files:**
- Create: `src/pages/blog/index.astro`

**Step 1: Write `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const allTags = [...new Set(posts.flatMap((p) => p.data.tags))].sort();
---
<BaseLayout title="Blog" description="Writing on engineering, ideas, and life.">
  <section class="max-w-3xl mx-auto px-6 py-16">
    <h1 class="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-3">Blog</h1>
    <p class="text-[#6B7280] dark:text-[#94A3B8] mb-10">
      Thoughts on engineering, side projects, and whatever else is on my mind.
    </p>

    {posts.length === 0 && (
      <p class="text-[#6B7280] dark:text-[#94A3B8]">Posts coming soon.</p>
    )}

    <div class="flex flex-col divide-y divide-[#E5E7EB] dark:divide-[#2D3748]">
      {posts.map((post) => (
        <a href={`/blog/${post.slug}`} class="group py-6 flex gap-6 items-start">
          <time class="text-xs text-[#6B7280] dark:text-[#94A3B8] w-20 flex-shrink-0 mt-1">
            {post.data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
          <div>
            <h2 class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1 transition-colors">
              {post.data.title}
            </h2>
            <p class="text-sm text-[#6B7280] dark:text-[#94A3B8] mb-2">{post.data.excerpt}</p>
            <div class="flex flex-wrap gap-1.5">
              {post.data.tags.map((tag) => (
                <span class="px-2 py-0.5 bg-[#F8F9FA] dark:bg-[#1A1D27] border border-[#E5E7EB] dark:border-[#2D3748] rounded text-xs text-[#6B7280] dark:text-[#94A3B8]">{tag}</span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `dist/blog/index.html` generated.

**Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: add blog listing page with tags"
```

---

### Task 13: Blog Post Page

**Files:**
- Create: `src/pages/blog/[slug].astro`
- Create: `src/content/blog/hello-world.md` (placeholder)

**Step 1: Create placeholder blog post**

```markdown
---
title: "Hello World"
date: 2026-04-18
tags: ["personal", "intro"]
excerpt: "The first post — an introduction to this space and what I plan to write about."
draft: false
---

## Welcome

This is my first post. I plan to write about engineering, side projects, and things I find interesting.

Here's a code snippet to test syntax highlighting:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```
```

**Step 2: Write `src/pages/blog/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await post.render();

const readingTime = post.data.readingTime ??
  Math.ceil(post.body.split(/\s+/).length / 200);
---
<BaseLayout title={post.data.title} description={post.data.excerpt}>
  <article class="max-w-3xl mx-auto px-6 py-16">
    <div class="mb-8">
      <div class="flex flex-wrap gap-1.5 mb-4">
        {post.data.tags.map((tag) => (
          <span class="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded text-xs">{tag}</span>
        ))}
      </div>
      <h1 class="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
        {post.data.title}
      </h1>
      <div class="flex items-center gap-3 text-sm text-[#6B7280] dark:text-[#94A3B8]">
        <time>{post.data.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
        <span>&middot;</span>
        <span>{readingTime} min read</span>
      </div>
    </div>
    <div class="prose dark:prose-invert prose-lg max-w-none font-sans prose-headings:font-serif prose-code:font-mono">
      <Content />
    </div>
    <div class="mt-12 pt-6 border-t border-[#E5E7EB] dark:border-[#2D3748]">
      <a href="/blog" class="text-sm text-[#6B7280] dark:text-[#94A3B8] hover:text-blue-600 dark:hover:text-blue-400">&larr; Back to blog</a>
    </div>
  </article>
</BaseLayout>
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: `dist/blog/hello-world/index.html` generated.

**Step 4: Commit**

```bash
git add src/pages/blog/ src/content/blog/
git commit -m "feat: add blog post page with reading time"
```

---

### Task 14: Experience Page

**Files:**
- Create: `src/pages/experience.astro`

**Step 1: Write `src/pages/experience.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { parse } from 'js-yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const experience = parse(readFileSync(resolve('src/data/experience.yaml'), 'utf8')) as any[];
const certifications = parse(readFileSync(resolve('src/data/certifications.yaml'), 'utf8')) as any[];
const skills = parse(readFileSync(resolve('src/data/skills.yaml'), 'utf8')) as any[];
---
<BaseLayout title="Experience" description="Professional experience, certifications, and skills.">
  <section class="max-w-4xl mx-auto px-6 py-16">
    <h1 class="font-serif text-4xl font-bold text-gray-900 dark:text-white mb-12">Experience</h1>

    <!-- Work Timeline -->
    <div class="mb-16">
      <h2 class="font-serif text-2xl font-semibold text-gray-900 dark:text-white mb-8">Work History</h2>
      <div class="relative border-l-2 border-[#E5E7EB] dark:border-[#2D3748] pl-8 flex flex-col gap-10">
        {experience.map((role) => (
          <div class="relative">
            <div class="absolute -left-[2.65rem] top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-[#0F1117]" />
            <div class="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">{role.title}</h3>
                <p class="text-sm text-blue-600 dark:text-blue-400">{role.company}</p>
              </div>
              <span class="text-xs text-[#6B7280] dark:text-[#94A3B8] whitespace-nowrap">
                {role.start} — {role.end}
              </span>
            </div>
            <ul class="list-disc list-inside space-y-1">
              {role.bullets.map((b: string) => (
                <li class="text-sm text-[#6B7280] dark:text-[#94A3B8]">{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <!-- Certifications -->
    <div class="mb-16">
      <h2 class="font-serif text-2xl font-semibold text-gray-900 dark:text-white mb-8">Certifications</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {certifications.map((cert) => (
          <a href={cert.url} target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2D3748] bg-[#F8F9FA] dark:bg-[#1A1D27] hover:shadow-md transition-shadow">
            {cert.badge && (
              <img src={cert.badge} alt={cert.name} class="w-12 h-12 object-contain flex-shrink-0" />
            )}
            <div>
              <p class="font-medium text-sm text-gray-900 dark:text-white">{cert.name}</p>
              <p class="text-xs text-[#6B7280] dark:text-[#94A3B8]">{cert.issuer} &middot; {cert.date}</p>
            </div>
          </a>
        ))}
      </div>
    </div>

    <!-- Skills -->
    <div>
      <h2 class="font-serif text-2xl font-semibold text-gray-900 dark:text-white mb-8">Skills</h2>
      <div class="flex flex-col gap-6">
        {skills.map((group: any) => (
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-widest text-[#6B7280] dark:text-[#94A3B8] mb-3">{group.category}</h3>
            <div class="flex flex-wrap gap-2">
              {group.items.map((skill: string) => (
                <span class="px-3 py-1.5 bg-[#F8F9FA] dark:bg-[#1A1D27] border border-[#E5E7EB] dark:border-[#2D3748] rounded-lg text-sm text-gray-900 dark:text-[#F1F5F9]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
</BaseLayout>
```

**Step 2: Verify build**

```bash
npm run build
```
Expected: `dist/experience/index.html` generated.

**Step 3: Commit**

```bash
git add src/pages/experience.astro
git commit -m "feat: add experience page with timeline, certs, skills"
```

---

### Task 15: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs` (ensure `site` and `base` are set)

**Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Step 2: Enable GitHub Pages in repo settings**

Go to repo Settings → Pages → Source → "GitHub Actions"

**Step 3: Commit and push**

```bash
git add .github/
git commit -m "feat: add GitHub Actions deploy workflow"
git push origin main
```

Expected: GitHub Actions runs, site deploys to `https://devsarangi.github.io`.

---

### Task 16: Final Checks

**Step 1: Run local dev server and manually verify all pages**

```bash
npm run dev
```

Checklist:
- [ ] Home page renders hero, project teasers, blog teasers
- [ ] Dark mode toggle works and persists on refresh
- [ ] Projects listing shows cards
- [ ] Project detail renders markdown with code highlighting
- [ ] Blog listing shows posts with dates and tags
- [ ] Blog post renders markdown with reading time
- [ ] Experience page shows timeline, certs, skills
- [ ] Footer contact icons render and link correctly
- [ ] Nav active state highlights current page
- [ ] Site is readable on mobile (responsive)

**Step 2: Check accessibility with browser DevTools**

Open Chrome DevTools → Lighthouse → Accessibility audit.
Target: Score ≥ 90.

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: final pre-deploy check — all pages verified"
```
