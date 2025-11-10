import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginRegisterPage from "./login/page";
import OrderingPage from "./order/page";
import RestaurantMenuManager from "./addDetails/page";
import AdminDashboard from "./admin/page";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegisterPage/>} />
      <Route path="/order" element={<OrderingPage/>} />
      <Route path="/addDetails" element={<RestaurantMenuManager/>} />
      <Route path="/admin" element={<AdminDashboard/>}/>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

