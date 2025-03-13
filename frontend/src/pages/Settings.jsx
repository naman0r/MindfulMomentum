import React from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";

const Settings = () => {
  return (
    <div>
      <TopNav />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>

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
