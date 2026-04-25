import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles && user && !allowedRoles.includes(user.role.toUpperCase())) {
        // Redirect to proper dashboard
        import("../../services/Authservice").then(({ authService }) => {
            window.location.href = authService.getDashboardPath(user.role);
        });
        return null;
    }

    return <>{children}</>;
}