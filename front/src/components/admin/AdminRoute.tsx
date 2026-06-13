import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAuth";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}