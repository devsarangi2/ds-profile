// src/scripts/theme.ts
const theme = localStorage.getItem('theme') ??
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

if (theme === 'dark') document.documentElement.classList.add('dark');

export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
