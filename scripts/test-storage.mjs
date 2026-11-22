// Focused tests for src/storage/workouts.ts (corrupted / invalid stored data).
// Uses Node's built-in test runner with an in-memory AsyncStorage mock.
// Run: npm run test:storage
import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

const KEY = 'reptrack.workouts.v1';
const store = new Map();

mock.module('@react-native-async-storage/async-storage', {
  defaultExport: {
    getItem: async (k) => (store.has(k) ? store.get(k) : null),
    setItem: async (k, v) => {
      store.set(k, v);
    },
  },
});

const { addWorkout, loadWorkouts, StoredWorkoutsError } = await import(
  '../src/storage/workouts.ts'
);

const valid = (id, date) => ({ id, exercise: 'Squat', sets: 3, reps: 5, date });
const input = { exercise: 'Bench Press', sets: 3, reps: 10 };

beforeEach(() => store.clear());

test('empty storage loads as an empty list', async () => {
  assert.deepEqual(await loadWorkouts(), []);
});

test('valid data loads newest first', async () => {
  store.set(KEY, JSON.stringify([valid('a', '2026-01-01T00:00:00Z'), valid('b', '2026-02-01T00:00:00Z')]));
  assert.deepEqual((await loadWorkouts()).map((w) => w.id), ['b', 'a']);
});

test('addWorkout prepends to valid data', async () => {
  store.set(KEY, JSON.stringify([valid('a', '2026-01-01T00:00:00Z')]));
  const saved = await addWorkout(input);
  assert.deepEqual(JSON.parse(store.get(KEY)).map((w) => w.id), [saved.id, 'a']);
});

for (const [name, raw] of [
  ['invalid JSON', '{not json'],
  ['a non-array JSON value', '{"id":"a"}'],
  ['a malformed entry', JSON.stringify([valid('a', '2026-01-01T00:00:00Z'), { id: 'b', sets: '3' }])],
  ['an entry with an invalid date', JSON.stringify([{ ...valid('a', 'nope') }])],
  ['an entry with zero sets', JSON.stringify([{ ...valid('a', '2026-01-01T00:00:00Z'), sets: 0 }])],
]) {
  test(`${name}: loadWorkouts throws StoredWorkoutsError`, async () => {
    store.set(KEY, raw);
    await assert.rejects(loadWorkouts(), StoredWorkoutsError);
  });

  test(`${name}: addWorkout throws and leaves stored data untouched`, async () => {
    store.set(KEY, raw);
    await assert.rejects(addWorkout(input), StoredWorkoutsError);
    assert.equal(store.get(KEY), raw);
  });
}
