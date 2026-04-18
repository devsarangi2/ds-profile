# Personal Portfolio & Profile Site — Design

**Date:** 2026-04-18  
**URL:** `devsarangi.github.io`  
**Status:** Validated

---

## Goals

- Primary: professional portfolio and presence
- Secondary: personal creative space
- Host side projects with detailed write-ups
- Maintain a mixed technical/personal blog
- Showcase experience, skills, and certifications

---

## Architecture & Stack

- **Framework:** Astro (static site generator)
- **Hosting:** GitHub Pages via GitHub Actions
- **Content:** Markdown files + YAML data files
- **Deployment:** Push to `main` → auto build → deploy

### Project Structure

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Home / About
│   │   ├── projects/
│   │   │   ├── index.astro          # Projects listing
│   │   │   └── [slug].astro         # Project write-ups
│   │   ├── blog/
│   │   │   ├── index.astro          # Blog listing
│   │   │   └── [slug].astro         # Blog posts
│   │   └── experience.astro         # Experience + Skills + Certs
│   ├── data/
│   │   ├── experience.yaml
│   │   ├── certifications.yaml
│   │   └── skills.yaml
│   └── components/
├── content/
│   ├── projects/                    # .md files per project
│   └── blog/                        # .md files per post
└── public/                          # Images, icons, static assets
```

---

## Pages & Navigation

**Top nav:** Name/logo (left) · `About · Projects · Blog · Experience · Contact` (right) · dark/light toggle (far right). Mobile: hamburger menu.

### Home / About
- Hero: photo/avatar, name, tagline, short bio
- Teasers: latest 2-3 blog posts, featured projects, skills snapshot

### Projects
- Intro paragraph + card grid (name, description, tech tags, "Read more")
- Each card links to a full markdown write-up page

### Blog
- Listing: title, date, read time, tags, excerpt
- Full posts with syntax highlighting, code blocks

### Experience
- Timeline of work history (from `experience.yaml`)
- Certification badge grid (from `certifications.yaml`)
- Skills tag cloud by category (from `skills.yaml`)

### Contact (Footer — every page)
- LinkedIn, GitHub, and email icons
- No contact form

---

## Visual Design

### Aesthetic
Light editorial / magazine-style with dark mode. ADA WCAG AA compliant.

### Typography
- Headings: `Playfair Display` or `Lora` (serif, editorial)
- Body: `Inter` or `DM Sans` (sans-serif, clean)
- Code: `JetBrains Mono`

### Color Palette

| Token | Light Mode | Dark Mode |
|---|---|---|
| Background | `#FFFFFF` | `#0F1117` |
| Surface | `#F8F9FA` | `#1A1D27` |
| Text Primary | `#111827` | `#F1F5F9` |
| Text Muted | `#6B7280` | `#94A3B8` |
| Accent | `#2563EB` | `#60A5FA` |
| Border | `#E5E7EB` | `#2D3748` |

All contrast ratios meet WCAG AA (4.5:1 minimum).

### Dark Mode
- Toggle button in nav, persisted in `localStorage`
- Respects `prefers-color-scheme` on first visit

### Visual Details
- Subtle dot/grid pattern on hero section
- Gradient overlays on project cover images
- Astro View Transitions API for page transitions
- Card hover: subtle lift shadow
- Syntax highlighting matched to light/dark mode

---

## Content Schema

### Blog Post (`content/blog/post-name.md`)
```yaml
---
title: "Post Title"
date: 2026-04-18
tags: [engineering, personal]
excerpt: "Short description for listing."
coverImage: /images/blog/post-name.jpg
readingTime: 5   # auto-calculated if omitted
draft: false
---
```

### Project (`content/projects/project-name.md`)
```yaml
---
title: "Project Name"
description: "One-liner for card."
tags: [python, aws]
coverImage: /images/projects/project-name.jpg
github: https://github.com/...
demo: https://...        # optional
featured: true           # shows on home page teaser
---
```

### `experience.yaml`
```yaml
- company: "Company Name"
  title: "Job Title"
  start: 2022-01
  end: present
  bullets:
    - "Achievement or responsibility"
```

### `certifications.yaml`
```yaml
- name: "AWS Solutions Architect"
  issuer: "Amazon"
  date: 2024-06
  badge: /images/certs/aws-sa.png
  url: https://...
```

### `skills.yaml`
```yaml
- category: "Languages"
  items: [Python, TypeScript, SQL]
- category: "Cloud"
  items: [AWS, GCP, Terraform]
```
