/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the lesson page so components inside MDX can read the lesson. */
    lesson?: import('./lib/lessons').LessonInfo;
  }
}
