// components/custom/PublicRoute.tsx
import { useSessionStore } from "@/store/sessionStore";
import { JSX } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSessionStore((state) => state.user);

  if (user) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default PublicRoute;
