import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/Authservice";

export default function ProtectedRoute({ children, allowedRoles }: any) {
    const { user, isAuthenticated, loading } = useAuth();

    console.log("AUTH DEBUG:", { user, isAuthenticated, loading });

    // ⛔ ATTENTE AUTH
    if (loading) {
        return <div>Chargement...</div>;
    }

    // ❌ pas de token
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // ❌ role check
    if (allowedRoles && user) {
        const role = user.role.toUpperCase();

        if (!allowedRoles.map((r: string) => r.toUpperCase()).includes(role)) {
            return (
                <Navigate
                    to={authService.getDashboardPath(user.role)}
                    replace
                />
            );
        }
    }

    return <>{children}</>;
}