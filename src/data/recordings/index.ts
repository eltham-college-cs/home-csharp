import { year7 } from './year-7';
import { year8 } from './year-8';
import { baseName } from '../../lib/videos';
import type { VideoPlan } from './types';

export const plans: VideoPlan[] = [...year7, ...year8];
export const planId = (p: VideoPlan) => baseName(p.year, p.lesson, p.clip);
export const clipLabel: Record<VideoPlan['clip'], string> = {
  bigIdea: 'The big idea',
  predictRun: 'Predict, then run',
  fixBug: 'Fix the bug',
};
export type { VideoPlan, Block, Step } from './types';
