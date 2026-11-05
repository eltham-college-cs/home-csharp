export type Mood = 'idle' | 'happy' | 'tryagain';

export const yokaLabels: Record<Mood, string> = {
  idle: 'Yoka the python, waiting',
  happy: 'Yoka the python, celebrating',
  tryagain: 'Yoka the python, cheering you on to try again',
};

/** Change Yoka's mood. Pass one Yoka, or a container to change every Yoka inside it. */
export function setMood(target: Element | null, mood: Mood) {
  if (!target) return;
  const all = target.matches('.yoka') ? [target] : Array.from(target.querySelectorAll('.yoka'));
  for (const el of all) {
    el.setAttribute('data-mood', mood);
    if (el.getAttribute('role') === 'img') el.setAttribute('aria-label', yokaLabels[mood]);
  }
}
