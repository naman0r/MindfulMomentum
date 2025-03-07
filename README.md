# MindfulMomentul

## tech stack

- Frontend: React.js, Tailwind.css, PrimeReact, React-router-dom, vite
- Backend: Flask server with python, supabase as the official sql database.
- Authentication: Firebase (already implemented), JWT (implemented)

## how this works:

### login and token storage:

- sends a login POST request to http://localhost:8000/api/login, and receives a response with a JWT token.
- handleGoogleLogin function in Login.jsx ->
  1.stores token (JWT) in localStorage under "token". 2. sends token to chrome extension (sends to extension id)

- extension receives token (background.js), and sets token in chrome.storage
- extension uses token to fetch tasks in popup.js in the async fetchTasks function.

flow:

- User logs in through web app
- Web app gets token from backend
- Web app sends token to extension
- Extension stores token in Chrome storage
- Extension uses token to fetch tasks
- Tasks are displayed in extension popup

### Why Am I doing this project, and what I hope to gain by the end:

- this would be a cool project for me to work on and deploy, and I can learn a lot through it.
- I actually want to understand a lot of the backend stuff, which I did not fully grasp during developing mindmapr.
- using flask to develop the backend is a lot more low level, and I feel that it is giving me a better picture of how things are working under the hood.
- I really want to learn TailwindCSS and use it in a project, and get really comfortable with it (learning by doing)
- I want to learn more complex topics like authorization using JWT and Cookies, and I want to learn the low level concepts behind these.
- Authentication with firebase and full deployment: I want to DEPLOY this project, and develop it in such a way that it is extremely secure and usable by the average user
- State management?? What it is, why I need it, and smart solution implemented (libraries to look at: Zustand, Redux)

- cool feature integration: I want to integrate a bunch of cool features such as Google Calendar API (if i can figure it out) to add tasks (habits) to user's google calendar automatically, or develop my own calendar like thing in this project.
- Push notifications, through email and in-app reminder system.
- Progress Charts & Stats – Graphs showing habit completion rates (find out what library we used in NUtrition and try to use that or use something better)
- Gamification of UI: learn UI design and have fun with it

- AI- powered habit suggestions:
- adaptive streak system : allows flexibility. if a user misses a day, we can develop an algorithm that allows them to make up for it and regain their streak.
- social feature: /community and /challenges frontend routes after ddevelopment to make it fun, display user stats to the public.
- accountability partner feature
- Journalling function (CAN IMPLEMENT VOXYL IN THIS!!!!!!!)
- level up and XP
- speech to text apis, openai api to extract action items from users logs and journal entries

## architecture:

### FRONTENEnd Main components:

- Login.jsx // Handles authentication with Google
- Habits.jsx // Manages user habits
- Journal.jsx // Manages journal entries
- Productivity.jsx // Manages tasks and productivity features
- AuthContext.jsx // Global state management for user auth

#### Key Features:

Uses Firebase for Google Authentication
Stores JWT token in localStorage
Makes API calls to your backend
Communicates with Chrome extension

### BACKEND Main components:

- main.py // Entry point, sets up Flask app
- api.py // Combined API routes
- config.py // Configuration and Supabase setup

### chrome extension (extension/) Main components:

- popup/ // UI that appears when clicking extension
- background/ // Background scripts for focus mode
- content/ // Scripts that run on web pages

### Login Flow:

User -> Google Auth -> Frontend -> Backend -> Supabase
-> Store Token -> Extension

Task Management Flow:
Frontend -> Backend -> Supabase
Extension -> Backend -> Supabase

Focus Mode Flow:
Extension Popup -> Background Script -> Website Blocking

### Database architecture:

tables:

- users

  - google_id
  - email
  - name
  - profile_picture

- habits

  - user_id
  - title
  - description
  - frequency
  - streak

- tasks

  - user_id
  - title
  - description
  - due_date
  - priority
  - completed

- journal_entries
  - user_id
  - title
  - content
  - mood
  - date

## Key technologies:

Frontend:

- React
- Firebase Auth
- TailwindCSS

Backend:

- Flask
- JWT
- Supabase

Extension:

- Chrome APIs
- HTML/CSS/JS
