import React, { useState } from "react";
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

  const especialistaId = user?.id_especialista ?? user?.id_usuario ?? user?.id;
  const statsPath = especialistaId
    ? `/estadisticas_especialista/${especialistaId}`
    : "/estadisticas_especialista";

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
      <style>{`
        /* Hover styles added: only visual hover effects, no structure/logic changes */
        .navbar .nav-link.btn-link {
          transition: background .15s ease, color .15s ease, transform .12s ease, box-shadow .15s ease;
          border-radius: 6px;
          padding: 0.25rem 0.6rem;
        }

        .navbar .nav-link.btn-link:hover,
        .navbar .nav-link.btn-link:focus {
          background: ${COLOR_ACCENT};
          color: ${COLOR_PRIMARY} !important;
          text-decoration: none;
        }

        .navbar .dropdown-menu .dropdown-item {
          transition: background .12s ease, color .12s ease;
          border-radius: 6px;
        }

        .navbar .dropdown-menu .dropdown-item:hover,
        .navbar .dropdown-menu .dropdown-item:focus {
          background: ${COLOR_ACCENT};
          color: ${COLOR_PRIMARY};
        }

        /* Logo hover */
        .navbar img[alt="Logo"] {
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .navbar img[alt="Logo"]:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        }

        /* Perfil hover */
        .navbar img[alt="Perfil"] {
          transition: transform .18s ease, box-shadow .18s ease, border-color .12s ease;
        }
        .navbar img[alt="Perfil"]:hover {
          transform: scale(1.03);
          box-shadow: 0 0 0 4px rgba(243,133,158,0.12);
          border-color: ${COLOR_LIGHT};
        }

        /* Small elevation for the user dropdown button on hover */
        .navbar .btn-light:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          ☰
        </button>

        {/* Contenido del menú */}
        <div
          className={`collapse navbar-collapse ${
            menuAbierto ? "show" : ""
          } mt-2 mt-lg-0 d-flex align-items-center justify-content-between`}
        >
          {/* Menú centrado */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex justify-content-center flex-wrap">
            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigate("/home_espe")}
              >
                Inicio
              </button>
            </li>

            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigate("/registrar")}
              >
                Registrar Usuario
              </button>
            </li>

            {/* Dropdown Evaluaciones */}
            <li
              className="nav-item dropdown mx-2"
              onMouseEnter={() => setShowEval(true)}
              onMouseLeave={() => setShowEval(false)}
            >
              <button
                className="btn btn-link nav-link dropdown-toggle text-white"
                data-bs-toggle="dropdown"
              >
                Evaluaciones
              </button>
              {showEval && (
                <ul
                  className="dropdown-menu show text-center"
                  style={{
                    background: COLOR_LIGHT,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/pacientes")}
                    >
                      ADI-R
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/pacientesados")}
                    >
                      ADOS-2
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigate("/reportes")}
              >
                Reportes
              </button>
            </li>

            <li className="nav-item mx-2">
              <button
                className="btn btn-link nav-link text-white"
                onClick={() => navigate(statsPath)}
              >
                Estadísticas
              </button>
            </li>
          </ul>

          {/* Usuario (a la derecha) */}
          <div className="d-flex align-items-center ms-lg-3">
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
    </nav>
  );
};

export default Navbar;
