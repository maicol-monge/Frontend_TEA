import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/TEA Logo.png";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const GENERIC_AVATAR = "https://ui-avatars.com/api/?name=Usuario&background=cccccc&color=555555&size=64";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const fotoPerfil = user?.imagen ? user.imagen : GENERIC_AVATAR;
    const nombreUsuario = user?.nombres + " " + user?.apellidos || "Usuario";
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        import("sweetalert2").then(Swal => {
            Swal.default.fire({
                title: "¿Cerrar sesión?",
                text: "¿Estás seguro que deseas cerrar sesión?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: COLOR_ACCENT,
                cancelButtonColor: COLOR_DARK,
                confirmButtonText: "Sí, salir",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("user");
                    navigate("/");
                }
            });
        });
    };

    return (
        <nav
            className="navbar navbar-expand-lg"
            style={{
                background: COLOR_PRIMARY,
                borderBottom: `4px solid ${COLOR_ACCENT}`,
                minHeight: 60,
            }}
        >
            <div className="container-fluid">
                <div className="d-flex align-items-center">
                    <span
                        className="navbar-brand d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/home_espe")}
                    >
                        <img
                            src={Logo}
                            alt="Logo"
                            width="40"
                            height="40"
                            className="d-inline-block align-top me-2"
                            style={{
                                background: "#fff",
                                borderRadius: "50%",
                                border: `2px solid ${COLOR_ACCENT}`,
                                objectFit: "contain"
                            }}
                        />
                        <span style={{ color: "#fff", fontWeight: "bold", fontSize: 20, marginRight: 12 }}>
                            TEA Diagnóstico
                        </span>
                    </span>
                    {/* Botones al lado del logo en escritorio */}
                    <button
                        className="btn btn-sm ms-2 d-none d-lg-inline"
                        style={{
                            background: COLOR_DARK,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                        onClick={() => navigate("/home_espe")}
                    >
                        Inicio
                    </button>
                    <button
                        className="btn btn-sm ms-2 d-none d-lg-inline"
                        style={{
                            background: COLOR_DARK,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                        onClick={() => navigate("/registrar")}
                    >
                        Registrar Usuario
                    </button>
                    <button
                        className="btn btn-sm ms-2 d-none d-lg-inline"
                        style={{
                            background: COLOR_DARK,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                        onClick={() => navigate("/pacientes")}
                    >
                        Evaluación ADI-R
                    </button>
                    <button
                        className="btn btn-sm ms-2 d-none d-lg-inline"
                        style={{
                            background: COLOR_DARK,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                        onClick={() => navigate("/pacientesados")}
                    >
                        Evaluación ADOS-2
                    </button>
                    <button
                        className="btn btn-sm ms-2 d-none d-lg-inline"
                        style={{
                            background: COLOR_DARK,
                            color: "#fff",
                            fontWeight: "bold"
                        }}
                        onClick={() => navigate("/reportes")}
                    >
                        Reportes
                    </button>
                </div>
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label="Toggle navigation"
                    style={{ borderColor: "#fff" }}
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
                </button>
                <div className={`collapse navbar-collapse justify-content-end ${showMenu ? "show" : ""}`}>
                    <ul className={`navbar-nav align-items-lg-center ms-auto ${showMenu ? "flex-column text-center" : ""}`}>
                        {/* Botones solo visibles en menú sandwich */}
                        <li className="nav-item d-lg-none mb-2">
                            <button
                                className="btn btn-sm w-100"
                                style={{
                                    background: COLOR_DARK,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/home_espe");
                                }}
                            >
                                Inicio
                            </button>
                        </li>
                        <li className="nav-item d-lg-none mb-2">
                            <button
                                className="btn btn-sm w-100"
                                style={{
                                    background: COLOR_DARK,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/registrar");
                                }}
                            >
                                Registrar Usuario
                            </button>
                        </li>
                        <li className="nav-item d-lg-none mb-2">
                            <button
                                className="btn btn-sm w-100"
                                style={{
                                    background: COLOR_DARK,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/pacientes");
                                }}
                            >
                                Evaluación ADI-R
                            </button>
                        </li>
                        <li className="nav-item d-lg-none mb-2">
                            <button
                                className="btn btn-sm w-100"
                                style={{
                                    background: COLOR_DARK,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/pacientesados");
                                }}
                            >
                                Evaluación ADOS-2
                            </button>
                        </li>
                        <li className="nav-item d-lg-none mb-2">
                            <button
                                className="btn btn-sm w-100"
                                style={{
                                    background: COLOR_DARK,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/reportes");
                                }}
                            >
                                Reportes
                            </button>
                        </li>
                        <li className="nav-item d-flex flex-column flex-lg-row align-items-center ms-lg-3 mt-2 mt-lg-0">
                            <p className="text-light mb-2 mb-lg-0 me-lg-2" style={{ fontSize: 16 }}>
                                ¡Bienvenido/a,{" "}
                                <span style={{ color: "#fff", fontWeight: "bold" }}>
                                    {nombreUsuario}
                                </span>
                                !
                            </p>
                            <img
                                src={fotoPerfil}
                                alt="Perfil"
                                width="50"
                                height="50"
                                style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `2px solid ${COLOR_ACCENT}`,
                                    marginRight: 10,
                                    marginLeft: 5,
                                    cursor: "pointer" // Para indicar que es clickeable
                                }}
                                onClick={() => navigate("/perfil-especialista")}
                            />
                            <button
                                className="btn mt-2 mt-lg-0"
                                style={{
                                    background: COLOR_ACCENT,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={handleLogout}
                            >
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;