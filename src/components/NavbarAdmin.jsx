import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";

const NavbarAdmin = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¿Deseas cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate("/");
            }
        });
    };

    const handleNav = (path) => {
        setShowMenu(false);
        navigate(path);
    };

    return (
        <nav className="navbar navbar-expand-lg" style={{ background: COLOR_PRIMARY, borderBottom: `4px solid ${COLOR_ACCENT}` }}>
            <div className="container-fluid">
                <span className="navbar-brand text-white fw-bold" style={{ cursor: "pointer" }} onClick={() => handleNav("/admin/home")}>
                    Admin TEA Diagnóstico
                </span>
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
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/usuarios")}>Usuarios</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/pacientes")}>Pacientes</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/especialistas")}>Especialistas</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/areas")}>Áreas</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/preguntas")}>Preguntas ADI</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/actividades")}>Actividades ADOS</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/tests-adir")}>Tests ADI-R</button>
                        </li>
                        <li className="nav-item mb-2 mb-lg-0 me-2">
                            <button className="btn btn-light me-2 w-100" onClick={() => handleNav("/admin/tests-ados")}>Tests ADOS-2</button>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-danger w-100" onClick={handleLogout}>Cerrar sesión</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdmin;