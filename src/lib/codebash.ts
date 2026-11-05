// Links out to CodeBash, where students have accounts and do auto-marked C# practice.
// CodeBash C# tasks, like this site's, are just the statements that go inside Main.
// Tasks live in a "C# at Home" topic inside the Year 9 C# course. Students reach them by
// logging in and opening the course, so we link to the login page and tell them which
// task to look for (there is no per-task public URL). The names below are shown to
// students, so they must match CodeBash exactly. Keep them in this one place.

export const CODEBASH_LOGIN = 'https://www.codebash.co.uk/simple-login';

export const CODEBASH_TOPIC = 'C# at Home';

export function codebashCourse(year: number): string {
  return `Year ${year} C# Programming`;
}
