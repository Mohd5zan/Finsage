
import { useState } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );

  function handleLogin(token: string, _userName: string) {
    setAccessToken(token);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userName");
    setAccessToken(null);
  }

  if (!accessToken) {
    return <Auth onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
