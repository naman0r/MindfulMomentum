import { useState, useEffect } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EXTENSION_ID =
  import.meta.env.VITE_EXTENSION_ID || "fhnmaioanoafpmkikblmoahbnlnboikk";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // upon mouting, if user exists, then we navigate to "/profile". this useEffect is also called when th4 state of user chages.
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault(); // prevents the screen from refreshing when form is sibmitted.
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (error) {
      setError(error.message);
    }
  };

  const sendTokenToExtension = async (token) => {
    console.log("Attempting to send token to extension...");
    console.log("Extension ID being used:", EXTENSION_ID);
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
      console.log("Chrome runtime API is available");
      try {
        // Try sending to the extension
        await chrome.runtime.sendMessage(EXTENSION_ID, {
          type: "SAVE_TOKEN",
          token: token,
        });
        console.log("Token sent to extension successfully");
      } catch (err) {
        // If there's an error, it might be because the extension isn't installed
        console.error("Extension communication error:", err);
        console.log("Error details:", {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      }
    } else {
      console.log("Chrome runtime API is not available", {
        windowChrome: !!window.chrome,
        chromeRuntime: !!(window.chrome && chrome.runtime),
        sendMessage: !!(
          window.chrome &&
          chrome.runtime &&
          chrome.runtime.sendMessage
        ),
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // console.log("Google sign in successful:", result);

      const userData = {
        google_id: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        profile_picture: result.user.photoURL,
      };

      // console.log("Sending user data to backend:", userData);
      // console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      console.log("Backend response status:", response.status);

      // Clone the response for debugging
      const responseClone = response.clone();
      const rawResponse = await responseClone.text();
      // console.log("Raw response:", rawResponse);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage || "Failed to store user data");
      }

      let data;
      try {
        data = JSON.parse(rawResponse);
        //console.log("Parsed response data:", data);
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error("Invalid response from server");
      }

      if (!data.access_token) {
        throw new Error("No access token received from server");
      }

      console.log("Login successful, received access token");

      // Store token in localStorage for web app
      localStorage.setItem("token", data.access_token);

      // Try to send token to extension
      await sendTokenToExtension(data.access_token);

      navigate("/profile");
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(`Authentication Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Mindful Momentum
          </h2>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google logo"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
