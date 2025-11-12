import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/tea_logo.png";

const COLOR_PRIMARY = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_LIGHT = "#f1faee";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const fotoPerfil =
    user?.imagen || "https://ui-avatars.com/api/?name=Usuario&background=cccccc&color=555555&size=64";
  const nombreUsuario = `${user?.nombres ?? "Usuario"} ${user?.apellidos ?? ""}`.trim();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showEval, setShowEval] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 992px)").matches : true
  );

  // Detectar tamaño de pantalla
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const handler = (e) => setIsLargeScreen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const especialistaId = user?.id_especialista ?? user?.id_usuario ?? user?.id;
  const statsPath = especialistaId
    ? `/estadisticas_especialista/${especialistaId}`
    : "/estadisticas_especialista";

  const navigateAndClose = (path) => {
    navigate(path);
    setMenuAbierto(false);
    setShowEval(false);
  };

  const handleLogout = () => {
    import("sweetalert2").then((Swal) => {
      Swal.default
        .fire({
          title: "¿Cerrar sesión?",
          text: "¿Estás seguro que deseas cerrar sesión?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: COLOR_ACCENT,
          cancelButtonColor: COLOR_PRIMARY,
          confirmButtonText: "Sí, salir",
          cancelButtonText: "Cancelar",
        })
        .then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem("user");
            navigate("/");
          }
        });
    });
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        background: COLOR_PRIMARY,
        borderBottom: `4px solid ${COLOR_ACCENT}`,
      }}
    >
      {/* Estilos inline para mantener la animación y hover */}
      <style>{`
        .navbar .nav-link.btn-link {
          transition: background .15s ease, color .15s ease;
          border-radius: 6px;
          padding: 0.3rem 0.7rem;
        }
        .navbar .nav-link.btn-link:hover,
        .navbar .nav-link.btn-link:focus {
          background: ${COLOR_ACCENT};
          color: ${COLOR_PRIMARY} !important;
          text-decoration: none;
        }
        .navbar .dropdown-menu .dropdown-item:hover {
          background: ${COLOR_ACCENT};
          color: ${COLOR_PRIMARY};
        }
        .navbar img[alt="Logo"],
        .navbar img[alt="Perfil"] {
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .navbar img[alt="Logo"]:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        }
        .navbar img[alt="Perfil"]:hover {
          transform: scale(1.03);
          box-shadow: 0 0 0 4px rgba(243,133,158,0.12);
        }
        /* Asegurar que el menú se apile bien en móvil */
        @media (max-width: 991px) {
          .navbar-collapse {
            flex-direction: column !important;
            align-items: center !important;
          }
          .navbar-nav {
            flex-direction: column !important;
            align-items: center !important;
            margin-bottom: 1rem;
          }
          .navbar .dropdown-menu {
            position: static !important;
            float: none !important;
            box-shadow: none !important;
            margin-top: 0.5rem;
          }
          .navbar img[alt="Perfil"] {
            width: 40px !important;
            height: 40px !important;
          }
          .navbar .btn-light {
            width: 100%;
            margin-top: 0.4rem;
          }
        }
      `}</style>

      <div className="container-fluid px-4">
        {/* Logo + título */}
        <div
          className="d-flex align-items-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/home_espe")}
        >
          <img
            src={Logo}
            alt="Logo"
            width="42"
            height="42"
            className="me-2"
            style={{
              background: "#fff",
              borderRadius: "50%",
              border: `2px solid ${COLOR_ACCENT}`,
              objectFit: "contain",
            }}
          />
          <h5 className="m-0 fw-bold text-white">TEA Diagnóstico</h5>
        </div>

        {/* Botón hamburguesa */}
        <button
          className="navbar-toggler text-white"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuAbierto((s) => !s)}
        >
          ☰
        </button>

        {/* Menú principal */}
        <div
          id="navbarNav"
          className={`collapse navbar-collapse ${menuAbierto ? "show" : ""} mt-2 mt-lg-0`}
        >
          {/* Wrapper to provide responsive layout without breaking Bootstrap's collapse */}
          <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between w-100">
          {/* Enlaces centrados */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex justify-content-center flex-wrap">
            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigateAndClose("/home_espe")}
              >
                Inicio
              </button>
            </li>
            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigateAndClose("/registrar")}
              >
                Registrar Usuario
              </button>
            </li>

            {/* Dropdown Evaluaciones */}
            <li
              className="nav-item dropdown mx-2"
              onMouseEnter={() => isLargeScreen && setShowEval(true)}
              onMouseLeave={() => isLargeScreen && setShowEval(false)}
            >
              <button
                className="btn btn-link nav-link dropdown-toggle text-white"
                onClick={() => {
                  if (!isLargeScreen) setShowEval((s) => !s);
                }}
              >
                Evaluaciones
              </button>
              <ul
                className={`dropdown-menu ${showEval ? "show" : ""} text-center`}
                style={{
                  background: COLOR_LIGHT,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigateAndClose("/pacientes")}
                  >
                    ADI-R
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigateAndClose("/pacientesados")}
                  >
                    ADOS-2
                  </button>
                </li>
              </ul>
            </li>

            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigateAndClose("/reportes")}
              >
                Reportes
              </button>
            </li>

            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigateAndClose(statsPath)}
              >
                Estadísticas
              </button>
            </li>
          </ul>

          {/* Usuario (a la derecha) */}
          <div className="d-flex align-items-center mt-3 mt-lg-0">
            <img
              src={fotoPerfil}
              alt="Perfil"
              width="45"
              height="45"
              className="me-2"
              style={{
                borderRadius: "50%",
                border: `2px solid ${COLOR_ACCENT}`,
                cursor: "pointer",
              }}
              onClick={() => navigate("/perfil-especialista")}
            />
            <div className="dropdown">
              <button
                className="btn btn-sm btn-light dropdown-toggle fw-semibold"
                data-bs-toggle="dropdown"
              >
                {nombreUsuario}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/perfil-especialista")}
                  >
                    Perfil
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
