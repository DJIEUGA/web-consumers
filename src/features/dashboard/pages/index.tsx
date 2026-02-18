
import React from "react";
import AdminDashboard from "./admin";
import EnterpriseDashboard from "./enterprise";
import ProDashboard from "./pro";
import CustomerDashboard from "./customer";
import ModeratorDashboard from "./moderator";
import { Navigate } from "react-router-dom";
import {Connexion} from "@/features/auth/pages";
import { useAuthStore } from "../../../stores/auth.store";

const UserDashboard = () => {
  const { role } = useAuthStore();


  const renderDashboard = () => {
    {
      switch (role) {
        case "ROLE_ADMIN":
          return <AdminDashboard />;
        case "ROLE_CUSTOMER":
          return <CustomerDashboard />;
        case "ROLE_PRO":
          return <ProDashboard />;
        case "ROLE_ENTERPRISE":
          return <EnterpriseDashboard />;
        case "ROLE_MODERATOR":
          return <ModeratorDashboard />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  };
  return <>{renderDashboard()}</>;
};

export default UserDashboard;
