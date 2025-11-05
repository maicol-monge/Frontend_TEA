import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Swal from "sweetalert2";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        if (email && password) {
            axios
                .post(apiUrl('/api/users/login'), { correo: email, contrasena: password })
                .then((response) => {
                    const data = response.data;
                    // Si requiere cambio de contraseña, redirige a establecer contraseña
                    if (data.requirePasswordChange) {
                        Swal.fire({
                            title: "¡Bienvenido!",
                            text: "Por seguridad, debes establecer una nueva contraseña.",
                            icon: "info",
                            confirmButtonText: "Continuar"
                        }).then(() => {
                            localStorage.setItem("token", data.token);
                            navigate("/establecer-contra", {
                                state: {
                                    id_usuario: data.user.id_usuario,
                                    correo: data.user.correo
                                }
                            });
                        });
                        return;
                    }
                    // Login normal: guarda token y datos de usuario
                    const { id_usuario, nombres, apellidos, direccion, telefono, correo, privilegio, imagen } = data.user;
                    localStorage.setItem("user", JSON.stringify({ id_usuario, nombres, apellidos, direccion, telefono, correo, privilegio, imagen }));
                    localStorage.setItem("token", data.token); // Guarda el token para futuras peticiones

                    if (privilegio === 0) {
                        navigate("/home_espe");
                    } else if (privilegio === 1) {
                        navigate("/home_paciente");
                    }else if (privilegio === 3) {
                        navigate("/admin/home"); 
                    }else {
                        navigate("/");
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        title: "Error",
                        text: "Usuario o contraseña incorrectos",
                        icon: "error",
                        showConfirmButton: false,
                        timer: 1500
                    });
                });
        } else {
            Swal.fire({
                title: "Error",
                text: "Por favor, completa todos los campos.",
                icon: "error",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) return;
        try {
            await axios.post(apiUrl('/api/users/recuperar-contrasena'), { correo: forgotEmail });
            Swal.fire({
                title: "¡Revisa tu correo!",
                text: "Si el correo está registrado, recibirás una nueva contraseña.",
                icon: "success",
                confirmButtonText: "Aceptar"
            });
            setShowForgot(false);
            setForgotEmail("");
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "No se pudo enviar el correo.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    };

    return (
        <div className="container-fluid d-flex justify-content-center align-items-center px-2">
            <div className="w-100" style={{ maxWidth: 400 }}>
                <div className="text-center mb-3">
                    <p className="fw-bold" style={{ color: "#f3859e", fontSize: "1.2rem" }}>Iniciar sesión</p>
                </div>
                <div>
                    <input
                        className="form-control mb-3"
                        type="text"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                    />
                    <div className="input-group mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                        <span
                            className="input-group-text"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ cursor: "pointer" }}
                        >
                            {showPassword ? (
                                <i className="bi bi-eye-slash-fill fs-5" style={{color: '#f3859e'}}></i>
                            ) : (
                                <i className="bi bi-eye-fill fs-5" style={{color: '#f3859e'}}></i>
                            )}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn w-100"
                        style={{ background: "#457b9d", color: "#fff" }}
                        onClick={handleLogin}
                    >
                        Acceder
                    </button>
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-link p-0"
                            style={{ color: "#f3859e", textDecoration: "underline" }}
                            onClick={() => setShowForgot(true)}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                    {/* Modal simple */}
                    {showForgot && (
                        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Recuperar contraseña</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowForgot(false)}></button>
                                    </div>
                                    <form onSubmit={handleForgotPassword}>
                                        <div className="modal-body">
                                            <label>Correo electrónico</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={forgotEmail}
                                                onChange={e => setForgotEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowForgot(false)}>
                                                Cancelar
                                            </button>
                                            <button type="submit" className="btn btn-primary" style={{ background: "#457b9d" }}>
                                                Enviar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
