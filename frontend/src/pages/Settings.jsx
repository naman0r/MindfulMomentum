import React from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div
            className={`mb-8 rounded-3xl border p-6 ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-sky-300" : "text-sky-700"}`}>
              Appearance
            </p>
            <h1 className="mt-3 text-3xl font-bold">Settings</h1>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold">Theme Mode</p>
                <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                  Dark mode is the default. Your selection is saved on this device.
                </p>
              </div>
              <div
                className={`flex items-center gap-2 rounded-2xl border p-1 ${
                  isDark
                    ? "border-slate-700 bg-slate-950"
                    : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isDark
                      ? "bg-sky-500 text-white"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    !isDark
                      ? "bg-sky-500 text-white"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`mt-4 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isDark
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Quick Toggle
            </button>
          </div>

          <h2 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>FAQ</h2>

          <ul>
            Latest Updates:
            <li>
              - added end to end encryption for journals. No one can hack your
              journal entries, and admins cannot view your journals.{" "}
            </li>
            <li>
              - added a new feature to the journal page. you can disable or
              enable preview mode.
            </li>
          </ul>

          <li>
            <strong>Why are my habits/journals not loading?:</strong> The
            Tokenization system used logs you out of the server every two hours
            even if you are logged in through the web app. please log out and
            log back in.
          </li>

          <br />
          <br />
          <p>
            Welcome to MindfulMomentum! Our app is designed to help you stay
            focused and manage your tasks effectively. Here's how it works:
          </p>

          <ul className="list-disc pl-5">
            <br></br>

            <li>
              <strong>Task Management:</strong> Easily add, view, and manage
              your tasks to stay organized and productive.
            </li>
            <li>
              <strong>Focus Mode:</strong> Activate focus mode to block
              distracting websites and concentrate on your work. The timer helps
              you manage your focus sessions effectively.
            </li>
            <li>
              <strong>Site Blocking:</strong> Customize a list of websites to
              block during focus mode, ensuring you stay on track.
            </li>
          </ul>

          <p>We prioritize your privacy and security:</p>

          <ul className="list-disc pl-5">
            <li>
              We do not collect or store any personal data without your consent.
            </li>
            <li>
              All data related to tasks and focus sessions is stored locally on
              your device.
            </li>
            <li>
              We use secure methods to handle any data necessary for the app's
              functionality.
            </li>
            <li>Your data is never shared with third parties.</li>
          </ul>

          <p>
            Thank you for choosing MindfulMomentum. We are committed to
            providing a secure and effective tool to enhance your productivity.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Settings;
