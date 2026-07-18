import React, { useState } from "react";
import Auth from "./components/Auth.jsx";
import Keystone from "./components/Keystone.jsx";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("keystone_token"));
  const [email, setEmail] = useState(() => localStorage.getItem("keystone_email") || "");

  const handleAuthed = (newToken, user) => {
    localStorage.setItem("keystone_token", newToken);
    localStorage.setItem("keystone_email", user.email);
    setToken(newToken);
    setEmail(user.email);
  };

  const signOut = () => {
    localStorage.removeItem("keystone_token");
    localStorage.removeItem("keystone_email");
    setToken(null);
    setEmail("");
  };

  if (!token) {
    return <Auth onAuthed={handleAuthed} />;
  }

  return <Keystone email={email} onSignOut={signOut} />;
}
