import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar_paciente";
import Footer from "../components/Footer";

const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

const DesactivarCuenta = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDesactivar = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!user || !token) return;

        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción desactivará tu cuenta y no podrás acceder hasta que un administrador la reactive.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: COLOR_ACCENT,
            cancelButtonColor: COLOR_DARK,
            confirmButtonText: "Sí, desactivar",
            cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);
        try {
            await axios.put(
                apiUrl(`/api/pacientes/desactivar/${user.id_usuario}`),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Swal.fire({
                title: "Cuenta desactivada",
                text: "Tu cuenta ha sido desactivada correctamente.",
                icon: "success",
                confirmButtonColor: COLOR_PRIMARY
            }).then(() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                navigate("/");
            });
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: "No se pudo desactivar la cuenta. Intenta más tarde.",
                icon: "error",
                confirmButtonColor: COLOR_ACCENT
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="card shadow p-4" style={{ maxWidth: 480, borderRadius: 18 }}>
                    <h2 className="text-center mb-4" style={{ color: COLOR_ACCENT, fontWeight: "bold" }}>
                        Desactivar Cuenta
                    </h2>
                    <div className="alert alert-warning" style={{ fontSize: "1.1rem" }}>
                        <strong>Advertencia:</strong> Esta acción desactivará tu cuenta y no podrás acceder hasta que un administrador la reactive.
                        <br />
                        Si tienes dudas, contacta al soporte al correo <span className="fw-bold">aplicaciondediagnosticodetea@gmail.com</span> o a tu especialista.
                    </div>
                    <button
                        className="btn w-100"
                        style={{
                            background: COLOR_ACCENT,
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "1.1rem"
                        }}
                        onClick={handleDesactivar}
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Desactivar mi cuenta"}
                    </button>
                    <button
                        className="btn btn-link mt-3"
                        style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}
                        onClick={() => navigate("/home_paciente")}
                    >
                        Cancelar y volver al inicio
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DesactivarCuenta;