import type { CleaningTask } from "./plan.ts";

export type CleaningStatus = "done" | "overdue" | "today" | "upcoming" | "unscheduled";
export function cleaningStatus(task: CleaningTask, today: string): CleaningStatus {
  if (task.done) return "done";
  if (!task.date) return "unscheduled";
  return task.date < today ? "overdue" : task.date === today ? "today" : "upcoming";
}
export function sortCleaningTasks(tasks: CleaningTask[]): CleaningTask[] {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31") || a.time.localeCompare(b.time) || a.title.localeCompare(b.title, "cs"));
}
