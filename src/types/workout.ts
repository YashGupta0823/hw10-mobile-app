export type Workout = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  /** ISO 8601 timestamp of when the workout was saved. */
  date: string;
};
