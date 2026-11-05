// Links out to CodeBash, where students have accounts and do auto-marked
// practice. Tasks live in a "C# at Home" topic inside each year's course.
// Students reach them by logging in and opening the course, so we link to the
// login page and tell them which task to look for (there is no per-task public
// URL). Keep this in one place so the login URL and names stay consistent.

export const CODEBASH_LOGIN = 'https://www.codebash.co.uk/simple-login';

// TODO: confirm the CodeBash topic and course names for C# with Mr Gordon.
export const CODEBASH_TOPIC = 'C# at Home';

export function codebashCourse(year: number): string {
  return `Year ${year} C# Programming`;
}
