RepTrack - Workout Logger

1. App Overview
RepTrack is a simple mobile workout logging app that allows users to record their exercises, sets, and reps and view their workout history. The goal is to make tracking workouts quick without requiring an account or internet connection.
Target Users are anyone who wants a simple way to keep track of their workouts.

Screen 1: Home/Workout History
This is the main screen users see when opening the app.

- Display the app name "RepTrack" at the top.
- Show a list of previously logged workouts.
- Each workout displays the exercise name, number of sets, number of reps, and date logged.
- Workouts appear in reverse chronological order, with the newest at the top.
- If no workouts have been logged, display a message such as "No workouts yet. Log your first workout!"
- Include a clearly visible "+ Add Workout" button that navigates to the Add Workout screen.

Screen 2: Add Workout
- Display a title labeled "Add Workout."
- Provide a text input for Exercise Name (example: Bench Press).
- Provide an input for Sets (example: 3).
- Provide an input for Reps (example: 10).
- Include a "Save Workout" button.
- Include a back button to return to the Home screen without saving.
- Automatically record the current date and time when a workout is saved.
- After successfully saving, return to the Home screen and display the new workout.

3. Data Storage
Each saved workout should contain:

- `id`: A unique identifier for the workout.
- `exercise`: The name of the exercise.
- `sets`: Number of sets, stored as a positive integer.
- `reps`: Number of repetitions, stored as a positive integer.
- `date`: The date and time the workout was recorded, stored as an ISO timestamp.

#4. Design Requirements
- Use a dark navy background with blue and white text.
- Use consistent spacing, rounded buttons, and readable typography.
- Display workout entries as individual cards.
- Make buttons and input fields large enough to use comfortably on a phone.
- Keep navigation simple and intuitive.
- Ensure the layout works on an iPhone screen.

5. Numbered Acceptance Criteria
1. App Launch: Opening the app in Expo Go displays the RepTrack Home screen without crashing.

2. Navigation: Tapping "+ Add Workout" opens the Add Workout screen.

3. User Input: The user can enter an exercise name, number of sets, and number of reps using the appropriate input fields.

4. Saving Workouts: Entering "Bench Press," 3 sets, and 10 reps and tapping "Save Workout" saves the entry and returns to the Home screen.

5. Workout Display: The newly saved workout appears on the Home screen with the exercise name, sets, reps, and date.

6. Workout Ordering: Saving multiple workouts displays the most recently saved workout at the top of the list.

7. Data: After saving a workout, completely closing Expo Go and reopening the project still displays the previously saved workout.

8. Empty State: If no workouts have been saved, the Home screen displays a message telling the user that no workouts have been logged.

9. Visual Design: Both screens use the same navy and blue color scheme, readable text, consistent spacing, and clearly identifiable buttons.

6. Requirements

- Use React Native with Expo SDK 58.
- Use Expo Router for navigation between screens.
- Use React hooks such as `useState` and `useEffect` where appropriate.
- Use `@react-native-async-storage/async-storage` for local persistence.
- Follow existing project instructions in `AGENTS.md`.
- Keep the implementation simple and avoid unnecessary dependencies.
- The completed project should run using `npm install` followed by `npx expo start`.
- The app must work on a physical iPhone through Expo Go.