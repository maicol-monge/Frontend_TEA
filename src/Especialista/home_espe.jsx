import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';

const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

// Iconos SVG accesibles y coloridos
const icons = {
    registrar: (
        <svg width="48" height="48" fill={COLOR_ACCENT} viewBox="0 0 24 24">
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Zm8-7h-2V3a1 1 0 0 0-2 0v2h-2a1 1 0 0 0 0 2h2v2a1 1 0 0 0 2 0V7h2a1 1 0 0 0 0-2Z"/>
        </svg>
    ),
    revision: (
        <svg width="48" height="48" fill={COLOR_PRIMARY} viewBox="0 0 24 24">
            <path d="M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Zm-1 14H4V6h16ZM7 8h10v2H7Zm0 4h10v2H7Zm0 4h7v2H7Z"/>
        </svg>
    ),
    adir: (
        <svg width="48" height="48" fill={COLOR_DARK} viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 17.93V20a1 1 0 0 1-2 0v-.07A8 8 0 1 1 20 12a7.93 7.93 0 0 1-7 7.93ZM12 4a8 8 0 0 1 8 8 7.93 7.93 0 0 1-7 7.93V20a1 1 0 0 1-2 0v-.07A8 8 0 0 1 12 4Zm-1 8V7a1 1 0 0 1 2 0v5a1 1 0 0 1-.293.707l-3 3a1 1 0 0 1-1.414-1.414Z"/>
        </svg>
    ),
    reportes: (
        <svg width="48" height="48" fill={COLOR_ACCENT} viewBox="0 0 24 24">
            <path d="M19 3h-1V1a1 1 0 0 0-2 0v2H8V1a1 1 0 0 0-2 0v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 18H5V8h14Zm0-13H5V5h14Z"/>
        </svg>
    ),
};

const Home = () => {
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!user) {
            navigate("/"); // Redirige al login si no hay usuario
            return;
        }

        setUserName(user.nombres);

        axios.get(
            apiUrl(`/api/especialistas/buscar-espe/${user.id_usuario}`),
            { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(res => {
            if (res.data.especialista?.terminos_privacida !== 1) {
                navigate("/consentimiento-especialista");
            }
        })
        .catch(() => {
            navigate("/consentimiento-especialista");
        });
    }, [navigate]);

    const opciones = [
        {
            titulo: "Registrar Usuarios",
            color: COLOR_ACCENT,
            icon: icons.registrar,
            onClick: () => navigate("/registrar"),
            descripcion: "Registra nuevos usuarios en la plataforma."
        },
        {
            titulo: "Evaluación ADI-R",
            color: COLOR_PRIMARY,
            icon: icons.revision,
            onClick: () => navigate("/pacientes"),
            descripcion: "Realiza una nueva evaluación ADI-R."
        },
        {
            titulo: "Evaluación ADOS-2",
            color: COLOR_DARK,
            icon: icons.adir,
            onClick: () => navigate("/pacientesados"),
            descripcion: "Realiza una nueva evaluación ADOS-2."
        },
        {
            titulo: "Generación de Reportes",
            color: COLOR_ACCENT,
            icon: icons.reportes,
            onClick: () => navigate("/reportes"),
            descripcion: "Genera y descarga reportes clínicos."
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
            </div>
            <Footer />
        </div>
    );
};

export default Home;