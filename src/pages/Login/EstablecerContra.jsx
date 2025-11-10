import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../../assets/tea_logo.png"; // Ajusta la ruta si tu logo está en otra carpeta

const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

const EstablecerContra = () => {
    const [nuevaContra, setNuevaContra] = useState('');
    const [confirmarContra, setConfirmarContra] = useState('');
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { id_usuario, correo } = location.state || {};

    const validatePassword = (password) => {
        // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(nuevaContra)) {
            Swal.fire({
                title: 'Error',
                text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }
        if (nuevaContra !== confirmarContra) {
            Swal.fire({
                title: 'Error',
                text: 'Las contraseñas no coinciden.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            
            await axios.post(apiUrl('/api/users/cambiar-contrasena'), {
                id_usuario,
                nuevaContra
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            Swal.fire({
                title: '¡Contraseña actualizada!',
                text: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
                icon: 'success',
                confirmButtonText: 'Ir al login',
            }).then(() => navigate('/'));
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar la contraseña. Intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
        setLoading(false);
    };

    if (!id_usuario || !correo) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6">
                        <div className="alert alert-danger text-center">
                            Información de usuario no encontrada. Inicia sesión nuevamente.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: COLOR_BG, minHeight: "100vh" }}
        >
            <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                <div
                    className="card shadow m-3"
                    style={{
                        borderTop: `6px solid ${COLOR_ACCENT}`,
                        borderRadius: 18,
                        background: "#fff"
                    }}
                >
                    <div
                        className="card-header text-white text-center"
                        style={{
                            background: COLOR_PRIMARY,
                            borderTopLeftRadius: 18,
                            borderTopRightRadius: 18
                        }}
                    >
                        <img
                            src={logo}
                            alt="Logo"
                            style={{ width: 100, height: 100, objectFit: "contain", marginBottom: 8 }}
                            className="mb-2"
                        />
                        <h4 className="mb-0" style={{ color: "#fff" }}>Establecer Nueva Contraseña</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: COLOR_DARK }}>Nueva contraseña</label>
                                <div className="input-group">
                                    <input
                                        type={showNueva ? "text" : "password"}
                                        className="form-control"
                                        value={nuevaContra}
                                        onChange={e => setNuevaContra(e.target.value)}
                                        required
                                        style={{ borderRight: 0 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        tabIndex={-1}
                                        onClick={() => setShowNueva(!showNueva)}
                                        style={{ borderLeft: 0 }}
                                    >
                                        {showNueva ? (
                                            <i className="bi bi-eye-slash-fill"></i>
                                        ) : (
                                            <i className="bi bi-eye-fill"></i>
                                        )}
                                    </button>
                                </div>
                                <div className="form-text" style={{ color: COLOR_PRIMARY }}>
                                    Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: COLOR_DARK }}>Confirmar contraseña</label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmar ? "text" : "password"}
                                        className="form-control"
                                        value={confirmarContra}
                                        onChange={e => setConfirmarContra(e.target.value)}
                                        required
                                        style={{ borderRight: 0 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        tabIndex={-1}
                                        onClick={() => setShowConfirmar(!showConfirmar)}
                                        style={{ borderLeft: 0 }}
                                    >
                                        {showConfirmar ? (
                                            <i className="bi bi-eye-slash-fill"></i>
                                        ) : (
                                            <i className="bi bi-eye-fill"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{
                                        background: COLOR_PRIMARY,
                                        color: "#fff",
                                        fontWeight: "bold"
                                    }}
                                    disabled={loading}
                                >
                                    Guardar nueva contraseña
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{
                                        background: COLOR_ACCENT,
                                        color: "#fff",
                                        fontWeight: "bold"
                                    }}
                                    onClick={() => navigate('/')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstablecerContra;