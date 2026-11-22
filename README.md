RepTrack - Workout Logger

About
RepTrack is a simple mobile workout logger that lets users record exercises, sets, and reps while keeping track of their workout history. I chose this idea because I wanted to build something practical, easy to use, and useful for tracking workouts without unnecessary features.

Features and Screens
1. Home Screen
- Displays previously logged workouts with exercise names, sets, reps, and dates.
- Shows the most recent workouts first.
- Includes an "Add Workout" button to log a new exercise.
- Displays a message when no workouts have been recorded.

2. Add Workout Screen
- Allows users to enter an exercise name, sets, and reps.
- Validates inputs to prevent invalid entries.
- Saves workouts and automatically returns to the Home screen.
- Includes a back button to cancel without saving.

Workouts are saved locally using AsyncStorage, so they remain available even after closing and reopening the app.

Setup and Running the App
Technology: React Native, Expo SDK 58, Expo Router, TypeScript, and AsyncStorage.

To run the project:

1. Clone the repository:
   bash
   git clone https://github.com/YashGupta0823/hw10-mobile-app.git
   
2. Navigate into the project:
   bash
   cd hw10-mobile-app
   
3. Install dependencies (Node.js 22.13 or newer required):
   bash
   npm install
   
4. Start Expo:
   bash
   npx expo start
   
5. Open Expo Go on your phone and scan the QR code. Make sure your phone and computer are on the same Wi-Fi network.

What I Learned

One thing that surprised me about mobile development was how easily Expo Go lets me run an actual mobile app on my iPhone without using Xcode or publishing anything to the App Store. I also learned how React Native uses components for screens and how AsyncStorage allows data to persist between app sessions.

AI Development Process
I used Claude Code to implement the application based on my initial SPEC.md. After the build, I used a separate Claude Code session to independently review the code against the specification. I then addressed the review findings and tested the app on my iPhone.

The repository includes SPEC.md, REVIEW.md, and a prompt log documenting the development process.