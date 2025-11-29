import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FileComplaint from "./components/FileComplaint";
import Feed from "./components/Feed";
import TopBar from "./components/TopBar";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(admin: boolean) => {
          setIsLoggedIn(true);
          setIsAdmin(admin);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <TopBar />
      <div className="w-screen h-screen overflow-auto pt-20">
        <Routes>
          <Route path="/complaint" element={<FileComplaint />} />
          <Route path="/feed" element={<Feed />} />
          {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
