import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";
const GENERIC_AVATAR = "https://ui-avatars.com/api/?name=Usuario&background=cccccc&color=555555&size=64";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";

const PerfilEspecialista = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [especialista, setEspecialista] = useState(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Toggles para mostrar/ocultar contraseñas
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Obtener datos de especialista (especialidad) al montar
    useEffect(() => {
        const fetchEspecialista = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    apiUrl(`/api/especialistas/buscar-espe/${user.id_usuario}`),
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const data = await res.json();
                if (res.ok) {
                    setEspecialista(data.especialista);
                }
            } catch (err) {
                setEspecialista(null);
            }
        };
        if (user?.id_usuario) fetchEspecialista();
    }, [user]);

    const validatePassword = (password) => {
        // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            Swal.fire({
                title: 'Error',
                text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: 'Error',
                text: 'Las contraseñas nuevas no coinciden.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                apiUrl('/api/users/cambiar-password'),
                {
                    id_usuario: user.id_usuario,
                    currentPassword,
                    newPassword
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            Swal.fire({
                title: '¡Contraseña cambiada!',
                text: 'Tu contraseña se actualizó correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
            setShowPasswordForm(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || "Error al cambiar la contraseña.",
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
        setLoading(false);
    };

    const fotoPerfil = user?.imagen || GENERIC_AVATAR;

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#f8f9fa" }}>
            <Navbar />
            <div className="container mt-4 mb-5 flex-grow-1">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        <div
                            className="card shadow p-4"
                            style={{
                                border: `2px solid ${COLOR_ACCENT}`,
                                borderRadius: 18,
                                background: "#fff"
                            }}
                        >
                            <h2 className="mb-4 text-center" style={{ color: COLOR_DARK, fontWeight: "bold" }}>
                                Mi Perfil
                            </h2>
                            <div className="row align-items-center">
                                <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
                                    <img
                                        src={fotoPerfil}
                                        alt="Perfil"
                                        width="120"
                                        height="120"
                                        style={{
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: `3px solid ${COLOR_ACCENT}`,
                                            background: "#f8f9fa",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                                        }}
                                    />
                                </div>
                                <div className="col-12 col-md-8">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Nombres:</span>
                                            <div>{user?.nombres}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Apellidos:</span>
                                            <div>{user?.apellidos}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Especialidad:</span>
                                            <div>{especialista?.especialidad || "No registrada"}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Correo:</span>
                                            <div>{user?.correo}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Teléfono:</span>
                                            <div>{user?.telefono || "No registrado"}</div>
                                        </div>
                                        <div className="col-12 col-sm-6 mb-3">
                                            <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Dirección:</span>
                                            <div>{user?.direccion || "No registrada"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex flex-column flex-md-row justify-content-center mt-4">
                                <button
                                    className="btn mb-3 mb-md-0 me-md-3"
                                    style={{
                                        background: COLOR_PRIMARY,
                                        color: "#fff",
                                        fontWeight: "bold",
                                        minWidth: 180,
                                        borderRadius: 8,
                                        boxShadow: "0 2px 8px rgba(69,123,157,0.08)"
                                    }}
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    Cambiar contraseña
                                </button>
                            </div>
                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="card p-3 mt-4 border-0" style={{ background: "#f8f9fa", borderRadius: 12 }}>
                                    <div className="mb-3">
                                        <label style={{ color: COLOR_DARK, fontWeight: "bold" }}>Contraseña actual</label>
                                        <div className="input-group">
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                className="form-control"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                tabIndex={-1}
                                                onClick={() => setShowCurrent((v) => !v)}
                                                style={{ borderTopRightRadius: 6, borderBottomRightRadius: 6 }}
                                            >
                                                {showCurrent
                                                    ? <i className="bi bi-eye-slash"></i>
                                                    : <i className="bi bi-eye"></i>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label style={{ color: COLOR_DARK, fontWeight: "bold" }}>Nueva contraseña</label>
                                        <div className="input-group">
                                            <input
                                                type={showNew ? "text" : "password"}
                                                className="form-control"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                tabIndex={-1}
                                                onClick={() => setShowNew((v) => !v)}
                                                style={{ borderTopRightRadius: 6, borderBottomRightRadius: 6 }}
                                            >
                                                {showNew
                                                    ? <i className="bi bi-eye-slash"></i>
                                                    : <i className="bi bi-eye"></i>
                                                }
                                            </button>
                                        </div>
                                        <div className="form-text" style={{ color: COLOR_PRIMARY }}>
                                            Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label style={{ color: COLOR_DARK, fontWeight: "bold" }}>Confirmar nueva contraseña</label>
                                        <div className="input-group">
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                className="form-control"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                tabIndex={-1}
                                                onClick={() => setShowConfirm((v) => !v)}
                                                style={{ borderTopRightRadius: 6, borderBottomRightRadius: 6 }}
                                            >
                                                {showConfirm
                                                    ? <i className="bi bi-eye-slash"></i>
                                                    : <i className="bi bi-eye"></i>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column flex-md-row justify-content-center">
                                        <button
                                            className="btn me-md-3 mb-2 mb-md-0"
                                            style={{
                                                background: COLOR_ACCENT,
                                                color: "#fff",
                                                fontWeight: "bold",
                                                minWidth: 150,
                                                borderRadius: 8
                                            }}
                                            type="submit"
                                            disabled={loading}
                                        >
                                            Guardar cambios
                                        </button>
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{
                                                background: COLOR_DARK,
                                                color: "#fff",
                                                fontWeight: "bold",
                                                minWidth: 150,
                                                borderRadius: 8
                                            }}
                                            onClick={() => setShowPasswordForm(false)}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PerfilEspecialista;