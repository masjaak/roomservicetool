import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import App from "./App";
import { AdminDashboard } from "./views/AdminDashboard";
import { initializeGuestAppCheck } from "./lib/appCheck";
import "./styles/globals.css";
import "./index.css";

const ADMIN_HASH = "#admin";

function Root() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === ADMIN_HASH);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === ADMIN_HASH);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return isAdmin ? <AdminDashboard /> : <App />;
}

createRoot(document.getElementById("root")!).render(<Root />);

initializeGuestAppCheck();
  
