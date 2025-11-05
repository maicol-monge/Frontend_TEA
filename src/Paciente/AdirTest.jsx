import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar_paciente";
import Footer from "../components/Footer";

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const AdirTest = () => {
    const { idAdir } = useParams();
    const [preguntasAgrupadas, setPreguntasAgrupadas] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [idPaciente, setIdPaciente] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const id_usuario = localStorage.getItem("id_usuario");

        // 1. Buscar el paciente por id_usuario
        axios.get(apiUrl(`/api/paciente/buscar-por-usuario/${id_usuario}`), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.data && res.data.paciente && res.data.paciente.id_paciente) {
                setIdPaciente(res.data.paciente.id_paciente);
            }
        })
        .catch(error => {
            console.error("Error al buscar paciente:", error);
        });

        // 2. Obtener preguntas del test
        axios.get(apiUrl('/api/adir/preguntas-test'), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            const agrupadas = {};
            res.data.forEach(p => {
                if (!agrupadas[p.area]) agrupadas[p.area] = [];
                agrupadas[p.area].push(p);
            });
            setPreguntasAgrupadas(agrupadas);
        })
        .catch(error => {
            console.error("Error al obtener las preguntas:", error);
        });
    }, []);

    const handleChange = (id_pregunta, campo, valor) => {
        setRespuestas(prev => ({
            ...prev,
            [id_pregunta]: {
                ...prev[id_pregunta],
                [campo]: valor
            }
        }));
    };

    const handleSubmit = () => {
        const totalPreguntas = Object.values(preguntasAgrupadas).reduce((acc, arr) => acc + arr.length, 0);
        const respondidas = Object.values(respuestas).filter(r => r && r.calificacion !== undefined && r.calificacion !== "").length;

        if (respondidas < totalPreguntas) {
            alert("Por favor responde todas las preguntas antes de enviar el test.");
            return;
        }

        const respuestasPayload = Object.entries(respuestas).map(([id_pregunta, r]) => ({
            id_pregunta: parseInt(id_pregunta),
            calificacion: parseInt(r.calificacion),
            observacion: r.observacion || ""
        }));

        // Usa el idPaciente obtenido del backend
        const payload = {
            id_paciente: parseInt(idPaciente),
            respuestas: respuestasPayload
        };

        const token = localStorage.getItem("token");
        axios.post(apiUrl('/api/adir/crear-con-respuestas'), payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            alert("Test completado correctamente");
            navigate(`/paciente`);
        });
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <h2 className="text-center" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                    Evaluación ADI-R
                </h2>

                {Object.entries(preguntasAgrupadas).map(([area, preguntas]) => (
                    <div key={area} className="mb-4">
                        <h4 className="text-primary mt-4">{area}</h4>
                        {preguntas.map(p => (
                            <div key={p.id_pregunta} className="mb-3">
                                <p><strong>{p.pregunta}</strong></p>
                                <select
                                    className="form-select mb-2"
                                    onChange={e => handleChange(p.id_pregunta, 'calificacion', e.target.value)}
                                >
                                    <option value="">Seleccione calificación</option>
                                    {[0, 1, 2, 3].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder="Observación (opcional)"
                                    onChange={e => handleChange(p.id_pregunta, 'observacion', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <div className="text-center">
                    <button
                        className="btn"
                        style={{ background: COLOR_ACCENT, color: "#fff", fontWeight: "bold" }}
                        onClick={handleSubmit}
                        disabled={!idPaciente} // Deshabilita hasta tener el idPaciente
                    >
                        Enviar Test
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdirTest;
