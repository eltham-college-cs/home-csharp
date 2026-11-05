// Particle burst for when every test passes (Year 7 only).
const COLOURS = ['#F2B533', '#2F7DD1', '#1F9D5C', '#D9578A', '#E3C783'];

export function celebrate(container: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.body.dataset.year !== '7') return;
  const layer = document.createElement('div');
  layer.className = 'burst';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 140 + Math.random() * 200;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist * 0.6}px`);
    p.style.background = COLOURS[i % COLOURS.length];
    p.style.animationDelay = `${Math.random() * 0.15}s`;
    layer.appendChild(p);
  }
  container.appendChild(layer);
  window.setTimeout(() => layer.remove(), 1600);
}
