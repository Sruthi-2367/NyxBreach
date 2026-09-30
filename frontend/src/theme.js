export function initTheme() {
  const saved = localStorage.getItem('nyxbreach_theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('nyxbreach_theme', next)
  return next
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark'
}