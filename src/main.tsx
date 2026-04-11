
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import App from "./App.tsx";
import { AdminDashboard } from "./views/AdminDashboard.tsx";
import "./index.css";

function Root() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return isAdmin ? <AdminDashboard /> : <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);
  