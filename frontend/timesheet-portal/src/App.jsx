import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import React from "react";
import AdminDashboard from "./components/AdminDashboard";
import AddClient from "./components/AddClient";
import ViewClients from "./components/ViewClient";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/add-client" element={<AddClient />} />
        <Route path="/view-client" element={<ViewClients />} />
        

      </Routes>
    </Router>
  );
}

export default App;
