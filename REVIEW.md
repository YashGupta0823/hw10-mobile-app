# RepTrack — Independent Review (HW10 Step 5)

**Reviewed commit:** `625bcfa` ("Raw agentic build output") · **Reviewer:** independent Claude Code session (review only, no code changed) · **Date:** 2026-11-22

## 1. Overall Assessment

The implementation is small, readable, and maps closely onto SPEC.md. Navigation (Expo Router `Stack`), input, validation, persistence (AsyncStorage), ordering, empty state, and styling are all implemented, and **all 9 acceptance criteria pass on code inspection**. TypeScript compiles cleanly, `expo-doctor` reports no issues, and a production iOS JS bundle builds successfully.

The most significant problem is **data-loss handling**: if the stored AsyncStorage value is corrupted, the app silently treats it as "no workouts" and the next save **permanently overwrites** the existing data. There is also **one lint error** (in unused template code), which violates the AGENTS.md rule to pass lint before declaring work done.

Nothing in this review has been tested on a physical iPhone. Criteria marked PASS below pass **code inspection only**. Each one notes whether it still needs testing in Expo Go.

### Note on the spec vs. the review request

- **SPEC.md contains 9 numbered acceptance criteria, not 12.** I checked the working copy and the committed version (`930eb4f`), and both are identical with 9 criteria. All 9 are evaluated below. I did not invent criteria 10–12. Section 6 ("Requirements") of SPEC.md is reviewed separately in §3.
- **SPEC.md does not mention corrupted AsyncStorage data.** It never requires an error message or protection against overwriting. Corruption handling is still reviewed below (§3.1) as a data-persistence and data-loss issue, because it is a real defect. It is not scored as a spec failure, though. If you have a newer version of the spec with 12 criteria and a corruption requirement, it was not saved to SPEC.md. Under that version, the corruption behaviour would be a **FAIL**.

---

## 2. Acceptance Criteria (SPEC.md §5)

Legend: **Code** = verified by reading the code / static checks · **Device** = still requires testing on a physical iPhone in Expo Go.

1. **[PASS] App Launch:** RepTrack Home screen displays without crashing.
   - [src/app/_layout.tsx:6-19](src/app/_layout.tsx#L6-L19) defines a minimal root `Stack` with `index` and `add` screens. [src/app/index.tsx:120-125](src/app/index.tsx#L120-L125) renders "RepTrack" as the header.
   - Evidence: `tsc --noEmit` passes, `expo-doctor` passes 20/20, and `npx expo export --platform ios` produced a Hermes bundle without errors (exported to a temp directory, not the project).
   - All dependencies used at runtime (expo-router, safe-area-context, async-storage, status-bar) are bundled in Expo Go.
   - **Device:** launch in Expo Go on an iPhone is not verified.

2. **[PASS] Navigation:** "+ Add Workout" opens the Add Workout screen.
   - [src/app/index.tsx:130-136](src/app/index.tsx#L130-L136): `Pressable` with label "+ Add Workout" calls `router.push('/add')`. The route file [src/app/add.tsx](src/app/add.tsx) exists. `typedRoutes` is enabled and tsc passes, so the route string is valid.
   - Minor edge case: there is no guard against a rapid double tap, which can push two Add screens (see §3.5).
   - **Device:** tap behaviour not verified.

3. **[PASS] User Input:** exercise name, sets, and reps can be entered.
   - Exercise: text input with `autoCapitalize="words"` and a 50-char limit ([add.tsx:119-135](src/app/add.tsx#L119-L135)).
   - Sets/Reps: `keyboardType="number-pad"`, with non-digits stripped on change ([add.tsx:142-155](src/app/add.tsx#L142-L155), [add.tsx:161-173](src/app/add.tsx#L161-L173)). Labels and placeholders match the spec examples.
   - Edge cases: the iOS number pad has no Return/Done key, so the user dismisses it by tapping outside the inputs (`keyboardShouldPersistTaps="handled"`, [add.tsx:112](src/app/add.tsx#L112)). Exercise → Sets focus chaining exists, but Sets → Reps does not.
   - **Device:** keyboard behaviour and `KeyboardAvoidingView` padding are not verified.

4. **[PASS] Saving Workouts:** "Bench Press", 3, 10 → Save → returns Home.
   - [add.tsx:58-91](src/app/add.tsx#L58-L91) validates the input, calls `addWorkout`, then `goBack()` (`router.back()`, with a fallback to `router.replace('/')`, [add.tsx:50-56](src/app/add.tsx#L50-L56)). These inputs pass validation (`parsePositiveInt`, [add.tsx:31-39](src/app/add.tsx#L31-L39)).
   - A `saving` flag prevents duplicate saves ([add.tsx:59](src/app/add.tsx#L59), [add.tsx:182](src/app/add.tsx#L182)). A save failure shows an `Alert` and keeps the user's input ([add.tsx:86-90](src/app/add.tsx#L86-L90)).
   - **Device:** not verified.

5. **[PASS] Workout Display:** the new workout appears with exercise, sets, reps, and date.
   - Home reloads on focus via `useFocusEffect` ([index.tsx:71-75](src/app/index.tsx#L71-L75)), so the new entry appears after `router.back()`.
   - `WorkoutCard` ([index.tsx:31-50](src/app/index.tsx#L31-L50)) shows the exercise, sets, reps (with singular/plural handling), and a formatted date and time ([index.tsx:17-29](src/app/index.tsx#L17-L29)).
   - **Device:** locale date formatting under Hermes is not verified visually.

6. **[PASS] Workout Ordering:** the newest workout appears at the top.
   - New workouts are prepended ([src/storage/workouts.ts:63](src/storage/workouts.ts#L63)), and `loadWorkouts` also sorts by `date` descending ([workouts.ts:22-24](src/storage/workouts.ts#L22-L24), [workouts.ts:39](src/storage/workouts.ts#L39)).
   - Edge case: ordering depends on the device clock. If the clock is changed backwards, a newer entry can sort below older ones. This is acceptable for the spec.

7. **[PASS] Data persistence:** saved workouts survive fully closing and reopening Expo Go.
   - Data is written to AsyncStorage under `reptrack.workouts.v1` ([workouts.ts:5](src/storage/workouts.ts#L5), [workouts.ts:63](src/storage/workouts.ts#L63)) and read on every Home focus.
   - The stored shape matches SPEC §3: `id` is a string, `sets`/`reps` are positive integers, and `date` is ISO via `toISOString()` ([workouts.ts:55-61](src/storage/workouts.ts#L55-L61)).
   - Caveat: under the corrupted-data path, saved data can be lost permanently (§3.1). That is not part of this criterion's normal flow.
   - **Device:** this criterion needs a real force-quit and relaunch test in Expo Go, which has not been done.

8. **[PASS] Empty State:** a message is shown when there are no workouts.
   - `ListEmptyComponent` shows "No workouts yet." / "Log your first workout!" ([index.tsx:108-113](src/app/index.tsx#L108-L113)), centred with `flexGrow: 1` ([index.tsx:106](src/app/index.tsx#L106), [index.tsx:171-173](src/app/index.tsx#L171-L173)).
   - Caveat: corrupted storage also shows this empty state, which misleads the user (§3.1).

9. **[PASS] Visual Design:** both screens share the navy/blue scheme, readable text, consistent spacing, and clear buttons.
   - Both screens use the shared palette [src/constants/colors.ts](src/constants/colors.ts), the same navy background (also set as the `Stack` `contentStyle` and splash background), the same primary button style (blue, radius 14, `minHeight: 56`), and 20px horizontal padding.
   - Inputs are `minHeight: 54`, and the back button is `minHeight: 44` with `hitSlop` (meets the iOS 44pt guideline). Workouts are rendered as individual cards. Text sizes are 14–36pt. White/light-blue on `#0B1A33` gives good contrast.
   - Minor: the two style sheets duplicate the button and pressed styles (§3.6).
   - **Device:** layout on an actual iPhone (notch, home indicator, small screens such as the iPhone SE) is not verified.

**Tally: 9 PASS, 0 FAIL, 0 WARN** (all on code inspection; criteria 1, 3, 7 and 9 especially need device confirmation).

---

## 3. Additional Findings

### 3.1 Data persistence — corrupted storage is silently discarded and then overwritten (HIGH)

[src/storage/workouts.ts:31-39](src/storage/workouts.ts#L31-L39):

```ts
try { parsed = JSON.parse(raw); }
catch { console.warn('...corrupted; starting fresh.'); return []; }
if (!Array.isArray(parsed)) return [];
return sortNewestFirst(parsed.filter(isWorkout));
```

[src/storage/workouts.ts:62-63](src/storage/workouts.ts#L62-L63):

```ts
const existing = await loadWorkouts();
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([workout, ...existing]));
```

Failure scenario (verified by code inspection):
1. The stored value is invalid JSON, or valid JSON that is not an array.
2. `loadWorkouts` returns `[]` and does not throw. Home's `catch` never runs, so the user sees "No workouts yet." instead of an error ([index.tsx:57-68](src/app/index.tsx#L57-L68)). The only signal is a `console.warn`.
3. The user saves a workout. `addWorkout` reads `[]` and calls `setItem` with only the new workout. **The original data is overwritten and cannot be recovered.**

This is the opposite of the protective behaviour described in the review request (show an error and do not overwrite). The Home screen already has a working error and Retry UI ([index.tsx:85-100](src/app/index.tsx#L85-L100)) that would display it if `loadWorkouts` threw.

### 3.2 Data persistence — invalid individual entries are silently dropped (MEDIUM)

`parsed.filter(isWorkout)` ([workouts.ts:39](src/storage/workouts.ts#L39)) removes any entry that fails validation, without telling the user. The next `addWorkout` writes the filtered list back, so those entries are deleted from storage permanently. The validation is reasonable. The problem is that the filtered result is written back.

### 3.3 Error handling

- Good: AsyncStorage read failures surface on Home with Retry. Write failures raise an `Alert` and keep the form data. The save button is disabled while saving.
- `refresh()` runs from `useFocusEffect` with no cancellation ([index.tsx:71-75](src/app/index.tsx#L71-L75)). If the user leaves the screen mid-load, `setState` runs after blur or unmount. This is harmless in React 19. Low priority.
- If a reload after a successful load fails, the existing list is replaced by the error view. That is acceptable.

### 3.4 Input validation

The validation is solid. Empty or whitespace-only names are rejected, internal whitespace is collapsed, and names are limited to 50 characters. Sets must be 1–100 and reps 1–1000. Leading zeros (`"003"`) parse to 3. `0` is rejected. Pasted non-digits are stripped. Errors are shown per field, with red borders, and clear when the user edits that field.

Minor UX inconsistency: `maxLength={3}` on Sets allows typing up to 999, which then shows "must be 100 or less". This is not a bug.

### 3.5 Navigation

- Correct use of an Expo Router `Stack` with `headerShown: false` and a custom back button. The native iOS swipe-back gesture still works by default.
- No guard against a double tap on "+ Add Workout" ([index.tsx:133](src/app/index.tsx#L133)). Two quick taps can push `/add` twice. Low priority; needs a device check.
- The `goBack` fallback to `router.replace('/')` handles a deep link straight to `/add`. Good.

### 3.6 Code quality / maintainability

- **Unused template code remains.** These files are not imported by any route: `src/components/*` (animated-icon, themed-text, themed-view, hint-row, web-badge, external-link, ui/collapsible), `src/hooks/*`, `src/constants/theme.ts`, `src/global.css`, and `scripts/reset-project.js`. The one lint error lives in this dead code.
- **Unused dependencies** from the template remain in [package.json](package.json): `@expo/ui`, `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-web-browser`, `expo-device`, and (unused by app code) `react-native-reanimated`/`react-native-worklets`. SPEC §6 says "avoid unnecessary dependencies". The build agent itself only added `async-storage` and ESLint, which were appropriate.
- `README.md` is still the create-expo-app boilerplate.
- The button, `pressed`, and `errorText` styles are duplicated between [index.tsx:241-276](src/app/index.tsx#L241-L276) and [add.tsx:261-280](src/app/add.tsx#L261-L280). That is acceptable at this size, but a shared component would keep the screens consistent.
- `app.json` `name` is still `hw10-mobile-app` ([app.json:3](app.json#L3)), so Expo Go lists the project under that name rather than "RepTrack". This is cosmetic and does not break the spec.
- The storage module is cleanly separated, the types are shared ([src/types/workout.ts](src/types/workout.ts)), and there is no unnecessary complexity in the app code itself.

### 3.7 React Native / Expo SDK 58 practices

- Uses `react-native-safe-area-context`'s `SafeAreaView` (not the deprecated RN one), `FlatList` for the list, `Pressable` with accessibility roles and labels, and `expo-status-bar`. `userInterfaceStyle: "dark"` matches the design.
- `KeyboardAvoidingView` sits inside a `SafeAreaView` that includes the bottom edge ([add.tsx:94-97](src/app/add.tsx#L94-L97)). On iPhones with a home indicator this can add extra bottom padding while the keyboard is open. This needs a device check.
- `useCallback` is used manually while `reactCompiler: true` is enabled. This is harmless but redundant.

### 3.8 SPEC §6 Requirements

| Requirement | Status |
|---|---|
| React Native + Expo SDK 58 | Met (`expo ~58.0.26`, RN 0.88.1) |
| Expo Router for navigation | Met |
| React hooks (`useState`, `useEffect`, …) | Met (`useState`, `useRef`, `useCallback`, `useFocusEffect`) |
| `@react-native-async-storage/async-storage` | Met (2.2.0; accepted by expo-doctor) |
| Follow AGENTS.md | **Partially:** lint does not pass (AGENTS.md: "Run lint and typecheck before declaring any task done") |
| Avoid unnecessary dependencies | **Partially:** the template's unused dependencies remain (§3.6) |
| `npm install` + `npx expo start` | Not executed in this review. `package-lock.json` is present and the iOS bundle export succeeds |
| Works on a physical iPhone via Expo Go | **Requires device testing** |

---

## 4. Static Check Results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **Pass:** exit 0, no errors |
| `npx expo lint` | **Fail:** exit 1, **1 error, 0 warnings** |
| `npx expo-doctor` | **Pass:** "20/20 checks passed. No issues detected!" |
| `npx expo export --platform ios` (output to a temp dir outside the project) | **Pass:** Hermes bundle built (2.5 MB) |

Lint error (independently confirmed; matches what the build agent reported):

```
src/hooks/use-color-scheme.web.ts
  11:5  error  Calling setState synchronously within an effect can trigger cascading renders
               react-hooks/set-state-in-effect
```

This file is template code from the initial commit (`2b6fb36`) and is **not imported anywhere** in the app, so it has no runtime impact. It still makes `expo lint` fail.

`git status` was clean before and after all checks.

---

## 5. Prioritized Issues to Fix Before Submission

1. **HIGH: Corrupted storage causes silent data loss** ([workouts.ts:34-38](src/storage/workouts.ts#L34-L38), [workouts.ts:62-63](src/storage/workouts.ts#L62-L63)). Make `loadWorkouts` throw a distinguishable error for unparseable or non-array data so that Home shows its existing error UI. Make `addWorkout` refuse to write when the existing data cannot be read, or back up the raw value to a separate key first.
2. **MEDIUM: Lint fails** (`src/hooks/use-color-scheme.web.ts:11`). Either delete the unused template file (preferred, see item 4) or fix it, so that `npx expo lint` exits 0 as AGENTS.md requires.
3. **MEDIUM: Invalid entries are dropped and then erased on the next save** ([workouts.ts:39](src/storage/workouts.ts#L39)). At minimum, avoid writing back a filtered list without telling the user.
4. **LOW: Remove the unused template files and dependencies** (§3.6) to meet "avoid unnecessary dependencies" and to cut down on dead code. Run `npx expo-doctor` and `tsc` again afterwards.
5. **LOW: Reconcile SPEC.md** if the intended spec has 12 criteria and a corruption requirement, so that the review and the spec match.
6. **LOW: UX polish.** Guard the "+ Add Workout" button against double taps, chain Sets → Reps focus, and consider renaming the Expo project to "RepTrack" in `app.json`.
7. **REQUIRED: Device testing.** Run criteria 1–9 on a physical iPhone in Expo Go, especially the force-quit persistence test (criterion 7), keyboard and layout behaviour (3, 9), and the empty state on a fresh install (8).

## 6. Conclusion

The app is **functionally close to ready**. All 9 SPEC.md acceptance criteria are met on code inspection, and typecheck, expo-doctor and bundling all pass. It is **not yet ready to submit**, for two reasons:
- The corrupted-storage path can silently destroy user data.
- `npx expo lint` fails, which conflicts with AGENTS.md.

Both are small, contained fixes. After those, and a full pass of the acceptance criteria on a physical iPhone in Expo Go, the project should be ready to submit.
