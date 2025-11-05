import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const ResponderItemsAlgoritmo = () => {
    const { id_ados, id_algoritmo } = useParams();
    const [codificaciones, setCodificaciones] = useState([]);
    const [puntuaciones, setPuntuaciones] = useState({});
    const [respuestas, setRespuestas] = useState({});
    const [indice, setIndice] = useState(0);
    const [tituloAlgoritmo, setTituloAlgoritmo] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            try {
                const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTituloAlgoritmo(algRes.data.titulo || "");
            } catch (e) {
                setTituloAlgoritmo("");
            }
            const codRes = await axios.get(apiUrl(`/api/ados/codificaciones-algoritmo/${id_algoritmo}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCodificaciones(codRes.data);

            let punts = {};
            for (const cod of codRes.data) {
                const puntRes = await axios.get(apiUrl(`/api/ados/puntuaciones-codificacion/${cod.id_codificacion}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                punts[cod.id_codificacion] = puntRes.data;
            }
            setPuntuaciones(punts);

            const respRes = await axios.get(apiUrl(`/api/ados/respuestas-algoritmo/${id_ados}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            let respObj = {};
            respRes.data.forEach(r => {
                respObj[r.id_codificacion] = r.id_puntuacion_codificacion;
            });
            setRespuestas(respObj);

            const idx = codRes.data.findIndex(c => !respObj[c.id_codificacion]);
            setIndice(idx >= 0 ? idx : 0);

            const testRes = await axios.get(apiUrl(`/api/ados/test/${id_ados}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (testRes.data && testRes.data.id_paciente) {
                localStorage.setItem("id_paciente_actual", testRes.data.id_paciente);
            }
        };
        fetchData();
    }, [id_algoritmo, id_ados]);

    const handleRespuesta = (id_codificacion, id_puntuacion_codificacion) => {
        setRespuestas({ ...respuestas, [id_codificacion]: id_puntuacion_codificacion });
    };

    // Guardar respuesta actual (al avanzar)
    const handleGuardar = async () => {
        const token = localStorage.getItem("token");
        const cod = codificaciones[indice];
        const id_puntuacion_codificacion = respuestas[cod.id_codificacion];
        if (!id_puntuacion_codificacion) {
            Swal.fire("Selecciona una respuesta antes de continuar.");
            return;
        }
        await axios.post(apiUrl('/api/ados/responder-codificacion'), {
            id_ados,
            id_puntuacion_codificacion
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (indice < codificaciones.length - 1) {
            setIndice(indice + 1);
        } else {
            // Al finalizar, calcula sumatoria y clasificación para TODOS los algoritmos
            const res = await axios.get(apiUrl(`/api/ados/puntuaciones-aplicadas/${id_ados}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Respuestas del backend:", res.data);

            let suma = 0;
            let totalAS = 0;
            let totalCRR = 0;
            let totalC = 0;
            let totalISR = 0;
            const algNum = parseInt(id_algoritmo, 10);

            for (const r of res.data) {
                // Para algoritmo 6, excluye ciertos id_codificacion
                if (
                    algNum === 6 &&
                    [116, 117, 118, 120, 121].includes(r.id_codificacion)
                ) {
                    continue; // los omite
                }
                // Excluye la pregunta de selección de algoritmo solo para algoritmos 1 y 2
                if (
                    ([1, 2].includes(algNum) && r.id_codificacion === 1) ||
                    ((algNum === 7 || algNum === 8) && r.id_codificacion === 125)
                ) {
                    continue; // omite esta codificación
                }
                const convertido = convertirPuntaje(r.puntaje, id_algoritmo, r.id_codificacion);

                // Obtener el grupo aquí (línea 106 aprox)
                let grupo = null;
                try {
                    grupo = await obtenerNombreGrupo(r.id_codificacion, token);
                } catch (e) {
                    grupo = null;
                }
                console.log(grupo);
                // Sumar a las variables según el grupo
                if (grupo === "comunicacion") {
                    totalAS += convertido;
                    totalC += convertido;
                } else if (grupo === "interacción_social_reciproca") {
                    totalAS += convertido;
                    totalISR += convertido;
                } else if (grupo === "comportamientos_restringidos_repetitivos") {
                    totalCRR += convertido;
                }
                suma += convertido;
            }
            console.log("Suma final de puntajes convertidos:", suma);

            let clasificacion = "Sin Clasificación";
            if (algNum === 6) {
                if (suma >= 10) clasificacion = "Autismo";
                else if (suma >= 7 && suma <= 9) clasificacion = "Espectro Autista";
                else if (suma <= 6) clasificacion = "No TEA";
            } else {
                clasificacion = clasificarSumatoria(suma, id_algoritmo);
            }
            console.log("Clasificación final:", clasificacion);

            await axios.put(apiUrl(`/api/ados/clasificacion/${id_ados}`), {
                clasificacion,
                total_punto: suma
            }, { headers: { Authorization: `Bearer ${token}` } });

            let estadoFinal;
            if ([1, 2, 3, 4, 5].includes(algNum)) {
                estadoFinal = 3;
            } else {
                estadoFinal = 4;
            }

            await axios.put(apiUrl(`/api/ados/pausar/${id_ados}`),
                { estado: estadoFinal },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await Swal.fire({
                icon: "info",
                title: algNum === 7 || algNum === 8 ? "Rango de preocupación" : "Resultado",
                html: algNum === 6
                    ? `Total C: <b>${totalC}</b><br/>Total ISR: <b>${totalISR}</b><br/>PUNTUACIÓN TOTAL (C+ ISR): <b>${suma}</b><br/>Clasificación: <b>${clasificacion}</b>`
                    : `Total AS: <b>${totalAS}</b><br/>Total CRR: <b>${totalCRR}</b><br/>PUNTUACIÓN TOTAL GLOBAL (AS+ CRR): <b>${suma}</b><br/>${algNum === 7 || algNum === 8 ? "Rango de preocupación" : "Clasificación"}: <b>${clasificacion}</b>`,
                confirmButtonText: "Aceptar"
            });

            const id_paciente = localStorage.getItem("id_paciente_actual");
            navigate(`/ados/tests/${id_paciente}`);
        }
    };

    // Guardar todas las respuestas y pausar
    const handlePausar = async () => {
        const token = localStorage.getItem("token");
        for (const cod of codificaciones) {
            const id_puntuacion_codificacion = respuestas[cod.id_codificacion];
            if (id_puntuacion_codificacion) {
                await axios.post(apiUrl('/api/ados/responder-codificacion'), {
                    id_ados,
                    id_puntuacion_codificacion
                }, { headers: { Authorization: `Bearer ${token}` } });
            }
        }
        await axios.put(apiUrl(`/api/ados/pausar/${id_ados}`),
            { estado: 2 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Algoritmo pausado", "Puedes continuar más tarde.", "info").then(() => {
            const id_paciente = localStorage.getItem("id_paciente_actual");
            navigate(`/ados/tests/${id_paciente}`);
        });
    };

    if (codificaciones.length === 0) return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <h3 className="text-center">Cargando preguntas...</h3>
            </div>
            <Footer />
        </div>
    );

    const cod = codificaciones[indice];
    let descripcion = cod.descripcion;
    if (descripcion && typeof descripcion === "object" && descripcion.data) {
        descripcion = new TextDecoder().decode(new Uint8Array(descripcion.data));
    }
    const opciones = puntuaciones[cod.id_codificacion] || [];

    // Conversión de puntaje general
    const convertirPuntaje = (puntaje, id_algoritmo, id_codificacion) => {
        id_algoritmo = parseInt(id_algoritmo, 10);
        if ((id_algoritmo === 7 || id_algoritmo === 8) && id_codificacion === 135) {
            if (puntaje === 0) return 0;
            if (puntaje === 1) return 2;
            if (puntaje === 2) return 2;
            if (puntaje === 3) return 2;
            if ([7, 8, 9].includes(puntaje)) return 0;
            return puntaje;
        }
        if (puntaje === 0) return 0;
        if (puntaje === 1) return 1;
        if (puntaje === 2) return 2;
        if (puntaje === 3) return 2;
        if ([7, 8, 9].includes(puntaje)) return 0;
        return puntaje;
    };

    // Clasificación
    const clasificarSumatoria = (suma, id_algoritmo) => {
        id_algoritmo = parseInt(id_algoritmo, 10);
        switch (id_algoritmo) {
            case 1:
                if (suma >= 16) return "Autismo";
                if (suma >= 11 && suma <= 15) return "Espectro Autista";
                if (suma <= 10) return "No TEA";
                break;
            case 2:
                if (suma >= 12) return "Autismo";
                if (suma >= 8 && suma <= 11) return "Espectro Autista";
                if (suma <= 7) return "No TEA";
                break;
            case 3:
                if (suma >= 10) return "Autismo";
                if (suma >= 7 && suma <= 9) return "Espectro Autista";
                if (suma <= 6) return "No TEA";
                break;
            case 4:
                if (suma >= 9) return "Autismo";
                if (suma === 8) return "Espectro Autista";
                if (suma <= 7) return "No TEA";
                break;
            case 5:
                if (suma >= 9) return "Autismo";
                if (suma >= 7 && suma <= 8) return "Espectro Autista";
                if (suma <= 6) return "No TEA";
                break;
            case 7:
                if (suma >= 14) return "Moderada - Severa";
                if (suma >= 10 && suma <= 13) return "Leve - Moderada";
                if (suma >= 0 && suma <= 9) return "Poca - Ninguna";
                break;
            case 8:
                if (suma >= 12) return "Moderada - Severa";
                if (suma >= 8 && suma <= 11) return "Leve - Moderada";
                if (suma >= 0 && suma <= 7) return "Poca - Ninguna";
                break;
            default:
                return "Sin Clasificación";
        }
        return "Sin Clasificación";
    };

    // Puedes colocarla en un archivo utilitario o dentro de tu componente
    async function obtenerNombreGrupo(id_codificacion, token) {
        try {
            const grupoResp = await axios.get(
                apiUrl(`/api/ados/grupo-codificacion/${id_codificacion}`),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Retorna solo el nombre del grupo
            return grupoResp.data.grupo;
        } catch (error) {
            console.warn(`No se encontró grupo para id_codificacion ${id_codificacion}`);
            return null;
        }
    }

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <div className="card shadow mb-4" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        {/* Título del algoritmo */}
                        {tituloAlgoritmo && (
                            <h3 className="mb-3" style={{ color: COLOR_ACCENT, fontWeight: "bold" }}>
                                {tituloAlgoritmo}
                            </h3>
                        )}
                        <h2 className="mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Pregunta {indice + 1} de {codificaciones.length}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            <span style={{
                                background: COLOR_PRIMARY,
                                color: "#fff",
                                fontWeight: "bold",
                                borderRadius: "6px",
                                padding: "4px 12px",
                                fontSize: "1.1em"
                            }}>
                                {cod.codigo}
                            </span>
                            <h4 style={{ color: COLOR_ACCENT, margin: 0 }}>{cod.titulo}</h4>
                        </div>
                        {descripcion && <p style={{ color: COLOR_DARK }}>{descripcion}</p>}
                        <div className="mb-4">
                            {opciones.map(op => {
                                let desc = op.descripcion;
                                if (desc && typeof desc === "object" && desc.data) {
                                    desc = new TextDecoder().decode(new Uint8Array(desc.data));
                                }
                                return (
                                    <div key={op.id_puntuacion_codificacion} className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id={`op${op.id_puntuacion_codificacion}`}
                                            name={`respuesta_${cod.id_codificacion}`}
                                            value={op.id_puntuacion_codificacion}
                                            checked={respuestas[cod.id_codificacion] === op.id_puntuacion_codificacion}
                                            onChange={() => handleRespuesta(cod.id_codificacion, op.id_puntuacion_codificacion)}
                                            style={{ borderColor: COLOR_PRIMARY, cursor: "pointer" }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`op${op.id_puntuacion_codificacion}`}
                                            style={{ cursor: "pointer", color: COLOR_DARK }}
                                        >
                                            <span style={{ color: COLOR_ACCENT, fontWeight: "bold" }}>{op.puntaje}</span>
                                            {" = "}
                                            {desc}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        <div
                            className="d-flex flex-wrap gap-2 justify-content-between justify-content-md-between"
                            style={{ rowGap: 12 }}
                        >
                            <button
                                className="btn flex-fill"
                                style={{ background: COLOR_ACCENT, color: "#fff", fontWeight: "bold", minWidth: 120 }}
                                onClick={() => setIndice(indice - 1)}
                                disabled={indice === 0}
                            >
                                Anterior
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: "#6c757d", color: "#fff", fontWeight: "bold", minWidth: 120 }}
                                onClick={() => {
                                    console.log("Navegando a actividades-consulta con id_ados:", id_ados);
                                    navigate(`/ados/actividades-consulta/${id_ados}`)
                                }}
                            >
                                Consultar actividades
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: "#ffc107", color: "#333", fontWeight: "bold", minWidth: 120 }}
                                onClick={handlePausar}
                            >
                                Pausar algoritmo
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: COLOR_PRIMARY, color: "#fff", fontWeight: "bold", minWidth: 120 }}
                                onClick={handleGuardar}
                            >
                                {indice < codificaciones.length - 1 ? "Siguiente" : "Finalizar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResponderItemsAlgoritmo;