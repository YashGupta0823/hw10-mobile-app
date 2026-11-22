import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/types/workout';

const STORAGE_KEY = 'reptrack.workouts.v1';

function isWorkout(value: unknown): value is Workout {
  if (typeof value !== 'object' || value === null) return false;
  const w = value as Record<string, unknown>;
  return (
    typeof w.id === 'string' &&
    typeof w.exercise === 'string' &&
    Number.isInteger(w.sets) &&
    (w.sets as number) > 0 &&
    Number.isInteger(w.reps) &&
    (w.reps as number) > 0 &&
    typeof w.date === 'string' &&
    !Number.isNaN(Date.parse(w.date))
  );
}

function sortNewestFirst(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Loads all saved workouts, newest first. Throws if storage cannot be read. */
export async function loadWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('RepTrack: stored workout data was corrupted; starting fresh.');
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return sortNewestFirst(parsed.filter(isWorkout));
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a workout stamped with the current date/time and persists it.
 * Throws if storage cannot be read or written.
 */
export async function addWorkout(input: {
  exercise: string;
  sets: number;
  reps: number;
}): Promise<Workout> {
  const workout: Workout = {
    id: createId(),
    exercise: input.exercise,
    sets: input.sets,
    reps: input.reps,
    date: new Date().toISOString(),
  };
  const existing = await loadWorkouts();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([workout, ...existing]));
  return workout;
}
