import { year9 } from './year-9';
import { baseName } from '../../lib/videos';
import type { VideoPlan } from './types';

export const plans: VideoPlan[] = [...year9];
export const planId = (p: VideoPlan) => baseName(p.year, p.lesson, p.clip);
export const clipLabel: Record<VideoPlan['clip'], string> = {
  bigIdea: 'The big idea',
  predictRun: 'Predict, then run',
  fixBug: 'Fix the bug',
};
export type { VideoPlan, Block, Step } from './types';
