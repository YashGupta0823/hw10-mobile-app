import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '@/types/workout';

const STORAGE_KEY = 'reptrack.workouts.v1';

/**
 * Thrown when workout data exists in storage but cannot be trusted
 * (invalid JSON, not an array, or containing malformed entries).
 *
 * Callers must not write to storage after seeing this error, otherwise the
 * existing data would be overwritten and lost.
 */
export class StoredWorkoutsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoredWorkoutsError';
  }
}

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

/** Reads and validates the stored list exactly as saved (unsorted). */
async function readStoredWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StoredWorkoutsError('Stored workout data is not valid JSON.');
  }
  if (!Array.isArray(parsed)) {
    throw new StoredWorkoutsError('Stored workout data is not a list.');
  }
  const invalidCount = parsed.filter((entry) => !isWorkout(entry)).length;
  if (invalidCount > 0) {
    throw new StoredWorkoutsError(
      `${invalidCount} stored workout ${invalidCount === 1 ? 'entry is' : 'entries are'} invalid.`
    );
  }
  return parsed as Workout[];
}

/**
 * Loads all saved workouts, newest first.
 * Throws if storage cannot be read, or a StoredWorkoutsError if the stored
 * data is corrupted or contains invalid entries.
 */
export async function loadWorkouts(): Promise<Workout[]> {
  return sortNewestFirst(await readStoredWorkouts());
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a workout stamped with the current date/time and persists it.
 * Throws if storage cannot be read or written. If the existing data is
 * corrupted or invalid, throws a StoredWorkoutsError and writes nothing,
 * so the existing data is never overwritten.
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
  const existing = await readStoredWorkouts();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([workout, ...existing]));
  return workout;
}
