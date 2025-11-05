import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const COLOR_BG = "#a8dadc";

const CrearAdir = () => {
    const { id_paciente } = useParams();
    const [confirmEdadMental, setConfirmEdadMental] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!confirmEdadMental) {
            setError("Debe confirmar que el paciente tiene al menos 2 años de edad mental.");
            return;
        }
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            // Obtener id_especialista desde user
            const resp = await axios.get(
                apiUrl(`/api/especialistas/buscar-espe/${user.id_usuario}`),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const id_especialista = resp.data.especialista.id_especialista;

            // Crear test ADI-R (sin algoritmo ni tipo sujeto por ahora)
            const res = await axios.post(
                apiUrl('/api/adir/crear-test'),
                {
                    id_paciente,
                    id_especialista,
                    algoritmo: 0, // temporal
                    tipo_sujeto: "",
                    edad_mental_confirmada: confirmEdadMental
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(`/responder-adir/${res.data.id_adir}`);
        } catch (err) {
            setError(err.response?.data?.message || "Error al crear la evaluación.");
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <button
                    className="btn mb-3"
                    style={{ background: COLOR_DARK, color: "#fff", fontWeight: "bold" }}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>
                <div className="card shadow mx-auto" style={{ maxWidth: 500, borderRadius: 18 }}>
                    <div className="card-body">
                        <h2 className="text-center mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Nueva Evaluación ADI-R
                        </h2>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="edadMental"
                                    checked={confirmEdadMental}
                                    onChange={e => setConfirmEdadMental(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="edadMental">
                                    Confirmo que el paciente cuenta con una edad mental mínima de 2 años.
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="btn w-100"
                                style={{ background: COLOR_ACCENT, color: "#fff", fontWeight: "bold" }}
                            >
                                Iniciar Evaluación
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CrearAdir;