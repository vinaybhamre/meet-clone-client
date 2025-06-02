import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/custom/ProtectedRoute";
import PublicRoute from "./components/custom/PublicRoute";
import { fetchCurrentUser } from "./lib/utils";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MeetPage from "./pages/MeetPage";
import Signup from "./pages/Signup";
import { useSessionStore } from "./store/sessionStore";

function App() {
  const setUser = useSessionStore((state) => state.setUser);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch {
        setUser(null); // not logged in or token invalid
      }
    };

    checkLogin();
  }, [setUser]);

  return (
    <Routes>
      {/* Home page: only when not logged in */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      {/* Landing page: only for logged-in users */}
      <Route
        path="/landing"
        element={
          <ProtectedRoute>
            <Landing />
          </ProtectedRoute>
        }
      />

      {/* Meet page: protected */}
      <Route
        path="/meet/:meetId"
        element={
          <ProtectedRoute>
            <MeetPage />
          </ProtectedRoute>
        }
      />

      {/* Auth routes: only when not logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  );
}

export default App;
