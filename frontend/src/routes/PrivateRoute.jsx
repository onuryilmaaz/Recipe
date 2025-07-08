import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";
import ModernLoader from "../components/Loader/ModernLoader";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ModernLoader
          size="large"
          type="gradient"
          text="Loading..."
          className="flex-col gap-4"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
