import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Habits from "./pages/Habits.jsx";
import Journal from "./pages/Journal.jsx";
import Productivity from "./pages/Productivity.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/app", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/habits", element: <Habits /> },
  { path: "/journal", element: <Journal /> },
  { path: "/productivity", element: <Productivity /> },
  { path: "/profile", element: <Profile /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
