import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeGuestAppCheck } from "./lib/appCheck";
import "./styles/globals.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

initializeGuestAppCheck();
  
