import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedPrivileges }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

    useEffect(() => {
        const handleStorage = () => {
            setUser(JSON.parse(localStorage.getItem("user")));
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    // También verifica cada vez que cambia la ruta (opcional, pero útil)
    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem("user")));
    }, [window.location.pathname]);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedPrivileges && !allowedPrivileges.includes(user.privilegio)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;