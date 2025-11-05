import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";
import dayjs from "dayjs";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const COLOR_BG = "#a8dadc";

const ResponderAdir = () => {
    const { id_adir } = useParams();
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [codigosPorPregunta, setCodigosPorPregunta] = useState({});
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [areaActual, setAreaActual] = useState(0);
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [codigoLocal, setCodigoLocal] = useState("");
    const [obsLocal, setObsLocal] = useState("");
    const [idPaciente, setIdPaciente] = useState(null);
    const [datosPaciente, setDatosPaciente] = useState(null);
    const [showSidebarMobile, setShowSidebarMobile] = useState(false);
    const [navegacionManual, setNavegacionManual] = useState(false);
    const navigate = useNavigate();

    // Agrupar preguntas por área
    const preguntasPorArea = preguntas.reduce((acc, p) => {
        if (!acc[p.id_area]) acc[p.id_area] = { nombre: p.area, preguntas: [] };
        acc[p.id_area].preguntas.push(p);
        return acc;
    }, {});

    const areas = Object.keys(preguntasPorArea).map(id => ({
        id: parseInt(id),
        nombre: preguntasPorArea[id].nombre,
        preguntas: preguntasPorArea[id].preguntas
    }));

    // Pregunta actual
    const area = areas[areaActual] || { preguntas: [] };
    const pregunta = area.preguntas[preguntaActual] || {};

    // Cargar preguntas y códigos
    useEffect(() => {
        const token = localStorage.getItem("token");
        // Obtener preguntas y respuestas
        axios.get(apiUrl(`/api/adir/preguntas-con-respuestas/${id_adir}`), {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setPreguntas(res.data.preguntas);
            setRespuestas(res.data.respuestas || {});
            setLoading(false);
            if (res.data.paciente) setDatosPaciente(res.data.paciente);
        });
        // Obtener id_paciente del test
        axios.get(apiUrl(`/api/adir/id-paciente/${id_adir}`), {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setIdPaciente(res.data.id_paciente);
        });
        axios.get(apiUrl('/api/adir/codigos-por-pregunta'), {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setCodigosPorPregunta(res.data));
    }, [id_adir]);



    // Actualiza los inputs locales cuando cambia la pregunta
    useEffect(() => {
        if (pregunta && pregunta.id_pregunta) {
            setCodigoLocal(respuestas[pregunta.id_pregunta]?.codigo || "");
            setObsLocal(respuestas[pregunta.id_pregunta]?.observacion || "");
        }
        // eslint-disable-next-line
    }, [pregunta.id_pregunta, respuestas]);

    // Encuentra la última pregunta respondida SOLO si no hubo navegación manual
    useEffect(() => {
        if (!preguntas.length || navegacionManual) return;
        let lastAnsweredIndex = 0;
        let lastAreaIndex = 0;
        areas.forEach((area, aIdx) => {
            area.preguntas.forEach((p, pIdx) => {
                if (respuestas[p.id_pregunta]?.codigo) {
                    lastAreaIndex = aIdx;
                    lastAnsweredIndex = pIdx;
                }
            });
        });
        setAreaActual(lastAreaIndex);
        setPreguntaActual(lastAnsweredIndex);
        // eslint-disable-next-line
    }, [preguntas, respuestas, navegacionManual]);

    // Navegación directa a pregunta (GUARDANDO antes de cambiar)
    const irAPregunta = async (areaIdx, preguntaIdx) => {
        if (pregunta && pregunta.id_pregunta) {
            await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
        }
        setAreaActual(areaIdx);
        setPreguntaActual(preguntaIdx);
        setNavegacionManual(true); // <- Esto evita que el useEffect te regrese
        // Limpiar inputs locales para la nueva pregunta
        const nuevaPregunta = areas[areaIdx]?.preguntas[preguntaIdx];
        setCodigoLocal(respuestas[nuevaPregunta?.id_pregunta]?.codigo || "");
        setObsLocal(respuestas[nuevaPregunta?.id_pregunta]?.observacion || "");
    };

    // Guardar/actualizar respuesta
    const guardarRespuesta = async (id_pregunta, codigo, observacion) => {
        setGuardando(true);
        setError("");
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                apiUrl('/api/adir/guardar-respuesta'),
                { id_adir, id_pregunta, codigo, observacion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRespuestas(prev => ({
                ...prev,
                [id_pregunta]: { codigo, observacion }
            }));
        } catch (err) {
            setError("Error al guardar la respuesta.");
        }
        setGuardando(false);
    };

    // Navegación
    const irAnterior = async () => {
        if (!pregunta.id_pregunta) return;
        await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
        setNavegacionManual(true); // <-- Agrega esto
        if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
        else if (areaActual > 0) {
            setAreaActual(areaActual - 1);
            setPreguntaActual(areas[areaActual - 1].preguntas.length - 1);
        }
    };
    const irSiguiente = async () => {
        if (!pregunta.id_pregunta) return;
        await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
        setNavegacionManual(true); // <-- Agrega esto
        if (preguntaActual < area.preguntas.length - 1) setPreguntaActual(preguntaActual + 1);
        else if (areaActual < areas.length - 1) {
            setAreaActual(areaActual + 1);
            setPreguntaActual(0);
        }
    };
    // Guardar y pausar
    const pausar = async () => {
        if (pregunta && pregunta.id_pregunta) {
            await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
        }
        if (idPaciente) {
            navigate(`/tests-paciente/${idPaciente}`);
        } else {
            navigate("/home_espe");
        }
    };

    const preguntasMeses = [2, 9, 10, 20, 87];

    if (loading) return <div>Cargando...</div>;
    if (!pregunta) return <div>No hay preguntas.</div>;

    const codigosValidos = codigosPorPregunta[pregunta.id_pregunta] || [];

    const todasRespondidas = preguntas.length > 0 && preguntas.every(
        p =>
            respuestas[p.id_pregunta] &&
            respuestas[p.id_pregunta].codigo != null &&
            respuestas[p.id_pregunta].observacion &&
            respuestas[p.id_pregunta].observacion.trim() !== ""
    );

    // Cambia la función finalizarEntrevista para guardar antes de navegar
    const finalizarEntrevista = async () => {
        if (pregunta && pregunta.id_pregunta) {
            await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
        }
        navigate(`/algoritmo/${id_adir}`);
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <div className="row">
                    {/* Barra lateral de preguntas - escritorio */}
                    <div className="col-12 col-md-3 mb-3 d-none d-md-block">
                        <div
                            className="card"
                            style={{ borderRadius: 12, maxHeight: 660, overflowY: "auto" }}
                        >
                            <div className="card-body">
                                <h6 style={{ fontWeight: "bold", color: COLOR_PRIMARY }}>Preguntas</h6>
                                {areas.map((area, aIdx) => (
                                    <div key={area.id}>
                                        <div style={{ fontWeight: "bold", fontSize: 13, marginTop: 8 }}>{area.nombre}</div>
                                        {area.preguntas.map((p, pIdx) => {
                                            const resp = respuestas[p.id_pregunta];
                                            const respondida = resp &&
                                                resp.codigo != null &&
                                                resp.observacion &&
                                                resp.observacion.trim() !== "";
                                            return (
                                                <button
                                                    key={p.id_pregunta}
                                                    className="btn btn-sm w-100 mb-1"
                                                    style={{
                                                        background: respondida ? "#38b000" : "#e63946",
                                                        color: "#fff",
                                                        fontWeight: pregunta.id_pregunta === p.id_pregunta ? "bold" : "normal",
                                                        border: pregunta.id_pregunta === p.id_pregunta ? "2px solid #1d3557" : "none"
                                                    }}
                                                    onClick={async () => await irAPregunta(aIdx, pIdx)}
                                                >
                                                    {p.id_pregunta}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            {todasRespondidas && (
                                <button
                                    className="btn btn-success w-100 mt-3"
                                    onClick={finalizarEntrevista}
                                >
                                    Finalizar entrevista
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Botón para mostrar barra lateral en móvil */}
                    <div className="d-block d-md-none mb-2">
                        <button
                            className="btn btn-primary"
                            style={{ position: "sticky", top: 0, zIndex: 1001 }}
                            onClick={() => setShowSidebarMobile(true)}
                        >
                            Ver preguntas
                        </button>
                    </div>
                    {/* Sidebar móvil desplegable */}
                    {showSidebarMobile && (
                        <div
                            className="position-fixed top-0 start-0 w-100 h-100"
                            style={{
                                background: "rgba(0,0,0,0.4)",
                                zIndex: 2000
                            }}
                            onClick={() => setShowSidebarMobile(false)}
                        >
                            <div
                                className="card"
                                style={{
                                    position: "absolute",
                                    top: 40,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "90vw",
                                    maxHeight: "80vh",
                                    overflowY: "auto",
                                    borderRadius: 16,
                                    zIndex: 2001
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 style={{ fontWeight: "bold", color: COLOR_PRIMARY, margin: 0 }}>Preguntas</h6>
                                        <button className="btn btn-sm btn-danger" onClick={() => setShowSidebarMobile(false)}>
                                            Cerrar
                                        </button>
                                    </div>
                                    {areas.map((area, aIdx) => (
                                        <div key={area.id}>
                                            <div style={{ fontWeight: "bold", fontSize: 13, marginTop: 8 }}>{area.nombre}</div>
                                            {area.preguntas.map((p, pIdx) => {
                                                const resp = respuestas[p.id_pregunta];
                                                const respondida = resp &&
                                                    resp.codigo != null &&
                                                    resp.observacion &&
                                                    resp.observacion.trim() !== "";
                                                return (
                                                    <button
                                                        key={p.id_pregunta}
                                                        className="btn btn-sm w-100 mb-1"
                                                        style={{
                                                            background: respondida ? "#38b000" : "#e63946",
                                                            color: "#fff",
                                                            fontWeight: pregunta.id_pregunta === p.id_pregunta ? "bold" : "normal",
                                                            border: pregunta.id_pregunta === p.id_pregunta ? "2px solid #1d3557" : "none"
                                                        }}
                                                        onClick={async () => {
                                                            await irAPregunta(aIdx, pIdx);
                                                            setShowSidebarMobile && setShowSidebarMobile(false); // Solo en móvil
                                                        }}
                                                    >
                                                        {p.id_pregunta}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Contenido principal */}
                    <div className="col-12 col-md-9">
                        <div className="card shadow mx-auto mb-4" style={{ maxWidth: 700, borderRadius: 18 }}>
                            <div className="card-body">
                                <h5 className="mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>Datos del Paciente</h5>
                                {datosPaciente ? (
                                    <div>
                                        <div><b>Nombre:</b> {datosPaciente.nombres} {datosPaciente.apellidos}</div>
                                        <div><b>Fecha de nacimiento:</b> {datosPaciente.fecha_nacimiento ? new Date(datosPaciente.fecha_nacimiento).toLocaleDateString() : ""}</div>
                                        <div>
                                            <b>Edad cronológica:</b>{" "}
                                            {datosPaciente.fecha_nacimiento
                                                ? Math.floor(
                                                    (dayjs().diff(dayjs(datosPaciente.fecha_nacimiento), "year", true))
                                                ) + " años"
                                                : ""}
                                        </div>
                                        <div><b>Sexo:</b> {datosPaciente.sexo}</div>
                                        <div><b>ID Test:</b> {id_adir}</div>
                                    </div>
                                ) : (
                                    <div className="text-muted">Cargando datos del paciente...</div>
                                )}
                            </div>
                        </div>
                        <div className="card shadow mx-auto" style={{ maxWidth: 700, borderRadius: 18 }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                        Área: {area.nombre}
                                    </span>
                                    <button className="btn btn-warning btn-sm" onClick={pausar}>
                                        Pausar y salir
                                    </button>
                                </div>
                                <h5 style={{ fontWeight: "bold" }}>
                                    Pregunta {preguntaActual + 1} de {area.preguntas.length} en esta área
                                </h5>
                                <p style={{ fontSize: 18 }}>{pregunta.id_pregunta}. {pregunta.pregunta}</p>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Código <span className="text-muted">(0 si no aplica)</span></label>
                                    {preguntasMeses.includes(pregunta.id_pregunta) ? (
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={codigoLocal === "" ? "" : codigoLocal}
                                            onChange={e => setCodigoLocal(e.target.value.replace(/^0+(?!$)/, ""))}
                                            disabled={guardando}
                                            min={0}
                                            placeholder="Cantidad de meses"
                                        />
                                    ) : (
                                        <select
                                            className="form-select"
                                            value={codigoLocal !== "" ? codigoLocal : "0"}
                                            onChange={e => setCodigoLocal(e.target.value)}
                                            disabled={guardando}
                                        >
                                            <option value="0">0</option>
                                            {codigosValidos
                                                .filter(c => c.codigo !== 0)
                                                .map(c => (
                                                    <option key={c.id_codigo} value={c.codigo}>{c.codigo}</option>
                                                ))}
                                        </select>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Observación <span className="text-muted">(Escribir N/A si no aplica)</span></label>

                                    <textarea
                                        className="form-control"
                                        value={obsLocal}
                                        onChange={e => setObsLocal(e.target.value)}
                                        disabled={guardando}
                                        maxLength={255}
                                        rows={3}
                                    />
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn"
                                        style={{ background: COLOR_DARK, color: "#fff" }}
                                        onClick={irAnterior}
                                        disabled={areaActual === 0 && preguntaActual === 0}
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ background: COLOR_ACCENT, color: "#fff" }}
                                        onClick={irSiguiente}
                                        disabled={
                                            areaActual === areas.length - 1 &&
                                            preguntaActual === area.preguntas.length - 1
                                        }
                                    >
                                        Siguiente
                                    </button>
                                </div>
                                <div className="mt-3 text-end">
                                    <span style={{ color: "#888" }}>
                                        Área {areaActual + 1} de {areas.length}
                                    </span>
                                </div>
                                {pregunta.id_pregunta === 97 && (
                                    <div className="mt-3">
                                        <button
                                            className="btn btn-secondary w-100 mb-2"
                                            onClick={async () => {
                                                if (pregunta && pregunta.id_pregunta) {
                                                    await guardarRespuesta(pregunta.id_pregunta, codigoLocal, obsLocal);
                                                }
                                            }}
                                            disabled={guardando}
                                        >
                                            Guardar
                                        </button>
                                        {todasRespondidas && (
                                            <button
                                                className="btn btn-success w-100"
                                                onClick={finalizarEntrevista}
                                                disabled={!todasRespondidas}
                                            >
                                                Finalizar entrevista
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResponderAdir;