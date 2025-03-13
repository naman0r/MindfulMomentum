import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import TopNav from "./components/TopNav.jsx";
import Footer from "./components/Footer.jsx";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Habits from "./pages/Habits.jsx";
import Journal from "./pages/Journal.jsx";
import Productivity from "./pages/Productivity.jsx";
import Profile from "./pages/Profile.jsx";
import Error404 from "./pages/Error404.jsx";
import Settings from "./pages/Settings.jsx"; // this is the faq page, need to rename
import JournalView from "./pages/JournalView.jsx";
import Blocked from "./pages/Blocked.jsx";
const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/app", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/habits", element: <Habits /> },
  { path: "/journal", element: <Journal /> },
  { path: "/productivity", element: <Productivity /> },
  { path: "/profile", element: <Profile /> },
  { path: "/*", element: <Error404 /> },
  { path: "/faq", element: <Settings /> },
  { path: "/journal/:id", element: <JournalView /> },
  { path: "/blocked", element: <Blocked /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
