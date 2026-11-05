// Hash the hedgehog, the C# at Home mascot (src/components/Mascot.astro).

export const MASCOT_NAME = 'Hash';

export type Mood = 'idle' | 'happy' | 'tryagain';

export const mascotLabels: Record<Mood, string> = {
  idle: 'Hash the hedgehog, waiting',
  happy: 'Hash the hedgehog, celebrating',
  tryagain: 'Hash the hedgehog, cheering you on to try again',
};

/** Change the mascot's mood. Pass one mascot, or a container to change every mascot inside it. */
export function setMood(target: Element | null, mood: Mood) {
  if (!target) return;
  const all = target.matches('.mascot') ? [target] : Array.from(target.querySelectorAll('.mascot'));
  for (const el of all) {
    el.setAttribute('data-mood', mood);
    if (el.getAttribute('role') === 'img') el.setAttribute('aria-label', mascotLabels[mood]);
  }
}
