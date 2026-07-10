import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config.js";

function ProtectedRoute({ children }) {
  const location = useLocation();
  

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        if (isMounted && response.data?.success) {
          localStorage.setItem("isAuthenticated", "true");
          setAuthenticated(true);
        } else if (isMounted) {
          localStorage.removeItem("isAuthenticated");
          setAuthenticated(false);
        }
      } catch (error) {
        if (isMounted) {
          localStorage.removeItem("isAuthenticated");
          setAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;