import { getCollection, type CollectionEntry } from 'astro:content';
import { url } from './url';

export type Lesson = CollectionEntry<'lessons'>;
export type Task = {
  id: string;
  title: string;
  starter: string;
  brief?: string;
  note?: string;
  tests: { input: string; output: string }[];
  hints?: Partial<Record<string, string>>;
};
export type LessonInfo = {
  id: string;
  year: number;
  lesson: number;
  videos: Lesson['data']['videos'];
  tasks: Task[];
};

const taskFiles = import.meta.glob<{ tasks: Task[] }>('../content/lessons/**/tasks.json', {
  eager: true,
  import: 'default',
});

export function tasksFor(entry: Lesson): Task[] {
  const key = Object.keys(taskFiles).find((k) => k.endsWith(`/lessons/${entry.id}/tasks.json`));
  return key ? taskFiles[key].tasks : [];
}

/** All published lessons for a year (drafts only in development), in folder order. */
export async function getLessons(year?: number): Promise<Lesson[]> {
  const all = await getCollection('lessons', (e) => (import.meta.env.PROD ? !e.data.draft : true));
  return all
    .filter((e) => year === undefined || e.data.year === year)
    .sort((a, b) => a.data.year - b.data.year || a.id.localeCompare(b.id, 'en', { numeric: true }));
}

export function lessonSlug(entry: Lesson): string {
  const folder = entry.id.split('/').pop()!.replace(/^\d+-/, '');
  return `lesson-${entry.data.lesson}-${folder}`;
}

export function lessonPath(entry: Lesson): string {
  return `/year-${entry.data.year}/${entry.data.unitSlug}/${lessonSlug(entry)}/`;
}

export const lessonUrl = (entry: Lesson) => url(lessonPath(entry));
