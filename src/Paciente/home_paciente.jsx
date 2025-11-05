import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar_paciente";
import Dsm5Test from "./Dsm5Test"; // importa el componente

// Paleta de colores
const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

// Iconos SVG accesibles y coloridos
const icons = {
    adir: (
        <svg width="48" height="48" fill={COLOR_PRIMARY} viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 17.93V20a1 1 0 0 1-2 0v-.07A8 8 0 1 1 20 12a7.93 7.93 0 0 1-7 7.93ZM12 4a8 8 0 0 1 8 8 7.93 7.93 0 0 1-7 7.93V20a1 1 0 0 1-2 0v-.07A8 8 0 0 1 12 4Zm-1 8V7a1 1 0 0 1 2 0v5a1 1 0 0 1-.293.707l-3 3a1 1 0 0 1-1.414-1.414Z"/>
        </svg>
    ),
    reportes: (
        <svg width="48" height="48" fill={COLOR_DARK} viewBox="0 0 24 24">
            <path d="M19 3h-1V1a1 1 0 0 0-2 0v2H8V1a1 1 0 0 0-2 0v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 18H5V8h14Zm0-13H5V5h14Z"/>
        </svg>
    ),
    resultados: (
        <svg width="48" height="48" fill={COLOR_ACCENT} viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 17.93V20a1 1 0 0 1-2 0v-.07A8 8 0 1 1 20 12a7.93 7.93 0 0 1-7 7.93ZM12 4a8 8 0 0 1 8 8 7.93 7.93 0 0 1-7 7.93V20a1 1 0 0 1-2 0v-.07A8 8 0 0 1 12 4Zm-1 8V7a1 1 0 0 1 2 0v5a1 1 0 0 1-.293.707l-3 3a1 1 0 0 1-1.414-1.414Z"/>
        </svg>
    ),
};

const Home = () => {
    const [userName, setUserName] = useState("");
    const [mostrarHome, setMostrarHome] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!userData) {
            navigate("/");
            return;
        }
        setUser(userData);
        setUserName(userData.nombres);

        axios.get(
            apiUrl(`/api/pacientes/buscar-paciente/${userData.id_usuario}`),
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(res => {
                if (res.data.paciente?.terminos_privacida !== 1) {
                    navigate("/consentimiento-informado");
                } else if (res.data.paciente?.filtro_dsm_5 !== 1) {
                    setMostrarHome(false);
                } else {
                    setMostrarHome(true);
                }
            })
            .catch(() => {
                navigate("/consentimiento-informado");
            });
    }, [navigate]);

    if (!mostrarHome && user) {
        return (
            <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
                <Navbar />
                <div className="container py-5 flex-grow-1">
                    <Dsm5Test
                        user={user}
                        token={localStorage.getItem("token")}
                        onAprobado={() => setMostrarHome(true)}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    // Opciones del home
    const opciones = [
        
        {
            titulo: "Resultados",
            color: COLOR_ACCENT,
            icon: icons.resultados,
            onClick: () => navigate("/resultados"),
            descripcion: "Consulta tus resultados de evaluaciones previas."
        }
    ];

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-5 flex-grow-1">
                <h1 className="text-center mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                    APLICACIÓN PARA LA EVALUACIÓN DE PERSONAS CON TRASTORNO DEL ESPECTRO AUTISTA (TEA)
                </h1>
                <h2 className="text-center mb-5" style={{ color: COLOR_DARK, fontWeight: "bold" }}>¡Bienvenido/a, {userName}!</h2>
                
                <div className="row g-4 justify-content-center">
                    {opciones.map((op, idx) => (
                        <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div
                                className="card h-100 shadow text-center"
                                style={{
                                    borderTop: `6px solid ${op.color}`,
                                    borderRadius: 18,
                                    background: "#fff",
                                    transition: "transform 0.2s",
                                    cursor: "pointer"
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={op.titulo}
                                onClick={op.onClick}
                                onKeyDown={e => (e.key === "Enter" || e.key === " ") && op.onClick()}
                            >
                                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                    <div className="mb-3">{op.icon}</div>
                                    <h5 className="card-title" style={{ color: op.color, fontWeight: "bold" }}>{op.titulo}</h5>
                                    <p className="card-text" style={{ color: COLOR_DARK, fontSize: "1.05rem" }}>{op.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Botón pequeño en la esquina inferior izquierda */}
                <div className="d-flex justify-content-end mt-5">
                    <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                        style={{
                            fontWeight: "bold",
                            fontSize: "0.95rem",
                            borderRadius: 20,
                            padding: "6px 14px"
                        }}
                        title="Desactivar cuenta"
                        aria-label="Desactivar cuenta"
                        onClick={() => navigate("/desactivar-cuenta")}
                    >
                        <i className="bi bi-person-x-fill"></i>
                        Desactivar cuenta
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;