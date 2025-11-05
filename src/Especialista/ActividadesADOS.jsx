import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const ActividadesADOS = () => {
    const { modulo, id_paciente } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const id_ados_url = query.get("id_ados");

    const [actividades, setActividades] = useState([]);
    const [indice, setIndice] = useState(0);
    const [observaciones, setObservaciones] = useState([]);
    const [idAdos, setIdAdos] = useState(id_ados_url || null);
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const user = JSON.parse(localStorage.getItem("user"));
                const id_usuario = user?.id_usuario;

                // 1. Consultar el id_especialista usando el id_usuario
                const resp = await axios.get(
                    apiUrl(`/api/especialistas/buscar-espe/${id_usuario}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const id_especialista = resp.data.especialista.id_especialista;

                // 2. Cargar actividades
                const res = await axios.get(apiUrl(`/api/ados/actividades/${modulo}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActividades(res.data);

                // 3. Cargar datos del paciente (para fecha de nacimiento)
                const pacienteRes = await axios.get(apiUrl(`/api/ados/paciente/${id_paciente}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFechaNacimiento(pacienteRes.data.fecha_nacimiento);

                // 4. Si hay id_ados en la URL, cargar observaciones de ese test
                if (id_ados_url) {
                    setIdAdos(id_ados_url);
                    const obsRes = await axios.get(apiUrl(`/api/ados/actividades-realizadas/${id_ados_url}`), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setObservaciones(obsRes.data);
                    // Posicionar en la primera actividad sin observación
                    const idx = res.data.findIndex(a =>
                        !obsRes.data.some(o => o.id_actividad === a.id_actividad)
                    );
                    setIndice(idx >= 0 ? idx : 0);
                } else {
                    setIdAdos(null);
                    setObservaciones([]);
                    setIndice(0);
                }
            } catch (err) {
                Swal.fire("Error", "No se pudieron cargar las actividades.", "error");
            }
        };
        fetchData();
    }, [modulo, id_paciente, id_ados_url]);

    const validarObservaciones = () => {
        if (observaciones.length !== actividades.length) return false;
        return actividades.every(act =>
            observaciones.find(o => o.id_actividad === act.id_actividad)?.observacion.trim().length > 0
        );
    };

    const handleObservacion = (texto) => {
        const id_actividad = actividades[indice]?.id_actividad;
        setObservaciones(prev => {
            const otras = prev.filter(o => o.id_actividad !== id_actividad);
            return [...otras, { id_actividad, observacion: texto }];
        });
    };

    const handleSiguiente = () => {
        if (indice < actividades.length - 1) setIndice(indice + 1);
    };
    const handleAnterior = () => {
        if (indice > 0) setIndice(indice - 1);
    };

    const guardarTestYObservaciones = async (estado) => {
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));
            const id_usuario = user?.id_usuario;
            const resp = await axios.get(
                apiUrl(`/api/especialistas/buscar-espe/${id_usuario}`),
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const id_especialista = resp.data.especialista.id_especialista;

            let id_ados = idAdos;
            if (!id_ados) {
                // Crear test solo si no existe
                const crearTest = await axios.post(apiUrl('/api/ados/crear'), {
                    id_paciente,
                    modulo,
                    id_especialista,
                    estado // 1 = pausado, 0 = finalizado
                }, { headers: { Authorization: `Bearer ${token}` } });
                id_ados = crearTest.data.id_ados;
            } else {
                // Si ya existe, solo actualiza el estado
                await axios.put(apiUrl(`/api/ados/pausar/${id_ados}`), { estado: 1 }, { headers: { Authorization: `Bearer ${token}` } });
            }

            // Guardar/actualizar observaciones
            for (const obs of observaciones) {
                await axios.post(apiUrl('/api/ados/actividad-realizada'), {
                    id_ados,
                    id_actividad: obs.id_actividad,
                    observacion: obs.observacion
                }, { headers: { Authorization: `Bearer ${token}` } });
            }
            setIdAdos(id_ados);
            return id_ados;
        } catch (err) {
            Swal.fire("Error", "No se pudo guardar el test.", "error");
        }
    };

    // Pausar test (puede pausar en cualquier momento)
    const handlePausar = async () => {
        await guardarTestYObservaciones(1); // Estado 1 = actividades pausadas
        Swal.fire("Test pausado", "Puedes continuar más tarde.", "info").then(() => navigate(`/ados/tests/${id_paciente}`));
    };

    // Finalizar actividades con lógica por módulo
    const handleFinalizarActividades = async () => {
        if (!validarObservaciones()) {
            Swal.fire("Completa todas las observaciones antes de finalizar.");
            return;
        }
        const id_ados_final = await guardarTestYObservaciones(0);
        const token = localStorage.getItem("token");

        // MODULO 1: Selección por pregunta
        if (modulo === "1") {
            // Solo la codificación 1 en el modal
            const codRes = await axios.get(apiUrl('/api/ados/codificacion/1'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const puntRes = await axios.get(apiUrl('/api/ados/puntuaciones-codificacion/1'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pregunta = codRes.data.titulo;
            let descripcion = codRes.data.descripcion;
            if (descripcion && typeof descripcion === "object" && descripcion.data) {
                descripcion = new TextDecoder().decode(new Uint8Array(descripcion.data));
            }
            const opciones = puntRes.data;

            let html = `
                <div style="text-align:left">
                    <div style="background:${COLOR_ACCENT};color:#fff;padding:10px 16px;border-radius:10px 10px 0 0;font-weight:bold;font-size:1.1em;">
                        Para continuar, debes contestar esta pregunta. Esto determinará el algoritmo a aplicar.
                    </div>
                    <div style="padding:18px 10px 0 10px;">
                        <b style="color:${COLOR_PRIMARY};font-size:1.1em;">${pregunta}</b><br/>
                        ${descripcion ? `<div style="font-size:0.97em;margin-bottom:8px;color:${COLOR_DARK};">${descripcion}</div>` : ""}
            `;
            opciones.forEach(op => {
                let desc = op.descripcion;
                if (desc && typeof desc === "object" && desc.data) {
                    desc = new TextDecoder().decode(new Uint8Array(desc.data));
                }
                html += `
                    <div style="margin-bottom:8px;">
                        <input type="radio" id="op${op.id_puntuacion_codificacion}" name="nivel" value="${op.id_puntuacion_codificacion}" style="accent-color:${COLOR_PRIMARY};margin-right:6px;">
                        <label for="op${op.id_puntuacion_codificacion}" style="cursor:pointer;">
                            <span style="color:${COLOR_ACCENT};font-weight:bold;">${op.puntaje}</span> = ${desc}
                        </label>
                    </div>
                `;
            });
            html += "</div></div>";

            Swal.fire({
                title: "Pregunta de Selección de Algoritmo",
                html,
                showCancelButton: false,
                confirmButtonText: "Guardar y continuar",
                customClass: {
                    popup: 'swal2-border-radius'
                },
                width: 900,
                willOpen: () => {
                    document.querySelector('.swal2-popup').style.borderRadius = '18px';
                    document.querySelector('.swal2-popup').style.maxWidth = '90vw';
                },
                preConfirm: () => {
                    const nivel = document.querySelector('input[name="nivel"]:checked');
                    if (!nivel) {
                        Swal.showValidationMessage("Debes seleccionar una opción");
                        return false;
                    }
                    return nivel.value;
                }
            }).then(async result => {
                if (result.isConfirmed) {
                    const id_puntuacion_codificacion = parseInt(result.value, 10);
                    await axios.post(apiUrl('/api/ados/responder-codificacion'), {
                        id_ados: id_ados_final,
                        id_puntuacion_codificacion
                    }, { headers: { Authorization: `Bearer ${token}` } });

                    // Detecta el algoritmo según el puntaje de la opción seleccionada
                    const opcionSeleccionada = opciones.find(op => op.id_puntuacion_codificacion === id_puntuacion_codificacion);
                    const puntaje = opcionSeleccionada ? opcionSeleccionada.puntaje : null;
                    let id_algoritmo = (puntaje === 3 || puntaje === 4) ? 1 : 2;

                    // Consulta el nombre del algoritmo desde la base
                    let nombreAlgoritmo = "Algoritmo";
                    try {
                        const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        nombreAlgoritmo = algRes.data.titulo || nombreAlgoritmo;
                    } catch (e) { }

                    await Swal.fire({
                        icon: "info",
                        title: "Algoritmo seleccionado",
                        html: `
                            <div style="font-size:1.1em;">
                                Se aplicará el <b style="color:${COLOR_PRIMARY};">${nombreAlgoritmo}</b> según tu respuesta.<br/><br/>
                                Haz clic en <b>Continuar</b> para responder las preguntas del algoritmo.
                            </div>
                        `,
                        confirmButtonText: "Continuar",
                        customClass: {
                            popup: 'swal2-border-radius'
                        }
                    });

                    navigate(`/ados/responder-items/${id_ados_final}/${id_algoritmo}`);
                }
            });
            return;
        }

        // MODULO 2
        if (modulo === "2") {
            const edad = calcularEdadAnios(fechaNacimiento);
            let id_algoritmo = null;
            if (edad < 5) id_algoritmo = 3;
            else if (edad >= 5) id_algoritmo = 4;

            if (id_algoritmo) {
                let nombreAlgoritmo = "Algoritmo";
                try {
                    const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    nombreAlgoritmo = algRes.data.titulo || nombreAlgoritmo;
                } catch (e) { }
                await Swal.fire({
                    icon: "info",
                    title: "Algoritmo seleccionado",
                    html: `
                        <div style="font-size:1.1em;">
                            Se aplicará el <b style="color:${COLOR_PRIMARY};">${nombreAlgoritmo}</b> según la edad del paciente.<br/><br/>
                            Haz clic en <b>Continuar</b> para responder las preguntas del algoritmo.
                        </div>
                    `,
                    confirmButtonText: "Continuar",
                    customClass: { popup: 'swal2-border-radius' }
                });
                navigate(`/ados/responder-items/${id_ados_final}/${id_algoritmo}`);
            } else {
                Swal.fire("No se puede elegir algoritmo", "La edad no cumple los requisitos para este módulo.", "warning");
            }
            return;
        }

        // MODULO 3
        if (modulo === "3") {
            const id_algoritmo = 5;
            let nombreAlgoritmo = "Algoritmo";
            try {
                const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                nombreAlgoritmo = algRes.data.titulo || nombreAlgoritmo;
            } catch (e) { }
            await Swal.fire({
                icon: "info",
                title: "Algoritmo seleccionado",
                html: `
                    <div style="font-size:1.1em;">
                        Se aplicará el <b style="color:${COLOR_PRIMARY};">${nombreAlgoritmo}</b> para este módulo.<br/><br/>
                        Haz clic en <b>Continuar</b> para responder las preguntas del algoritmo.
                    </div>
                `,
                confirmButtonText: "Continuar",
                customClass: { popup: 'swal2-border-radius' }
            });
            navigate(`/ados/responder-items/${id_ados_final}/${id_algoritmo}`);
            return;
        }

        // MODULO 4
        if (modulo === "4") {
            const id_algoritmo = 6;
            let nombreAlgoritmo = "Algoritmo";
            try {
                const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                nombreAlgoritmo = algRes.data.titulo || nombreAlgoritmo;
            } catch (e) { }
            await Swal.fire({
                icon: "info",
                title: "Algoritmo seleccionado",
                html: `
                    <div style="font-size:1.1em;">
                        Se aplicará el <b style="color:${COLOR_PRIMARY};">${nombreAlgoritmo}</b> para este módulo.<br/><br/>
                        Haz clic en <b>Continuar</b> para responder las preguntas del algoritmo.
                    </div>
                `,
                confirmButtonText: "Continuar",
                customClass: { popup: 'swal2-border-radius' }
            });
            navigate(`/ados/responder-items/${id_ados_final}/${id_algoritmo}`);
            return;
        }

        // MODULO T
        if (modulo === "T") {
            // 1. Pregunta de selección de algoritmo (igual que módulo 1)
            const codRes = await axios.get(apiUrl('/api/ados/codificacion/125'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const puntRes = await axios.get(apiUrl('/api/ados/puntuaciones-codificacion/125'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            const pregunta = codRes.data.titulo;
            let descripcion = codRes.data.descripcion;
            if (descripcion && typeof descripcion === "object" && descripcion.data) {
                descripcion = new TextDecoder().decode(new Uint8Array(descripcion.data));
            }
            const opciones = puntRes.data;

            let html = `
        <div style="text-align:left">
            <div style="background:${COLOR_ACCENT};color:#fff;padding:10px 16px;border-radius:10px 10px 0 0;font-weight:bold;font-size:1.1em;">
                Para continuar, debes contestar esta pregunta. Esto determinará el algoritmo a aplicar.
            </div>
            <div style="padding:18px 10px 0 10px;">
                <b style="color:${COLOR_PRIMARY};font-size:1.1em;">${pregunta}</b><br/>
                ${descripcion ? `<div style="font-size:0.97em;margin-bottom:8px;color:${COLOR_DARK};">${descripcion}</div>` : ""}
    `;
            opciones.forEach(op => {
                let desc = op.descripcion;
                if (desc && typeof desc === "object" && desc.data) {
                    desc = new TextDecoder().decode(new Uint8Array(desc.data));
                }
                html += `
            <div style="margin-bottom:8px;">
                <input type="radio" id="op${op.id_puntuacion_codificacion}" name="nivel" value="${op.id_puntuacion_codificacion}" style="accent-color:${COLOR_PRIMARY};margin-right:6px;">
                <label for="op${op.id_puntuacion_codificacion}" style="cursor:pointer;">
                    <span style="color:${COLOR_ACCENT};font-weight:bold;">${op.puntaje}</span> = ${desc}
                </label>
            </div>
        `;
            });
            html += "</div></div>";

            const result = await Swal.fire({
                title: "Pregunta de Selección de Algoritmo",
                html,
                showCancelButton: false,
                confirmButtonText: "Guardar y continuar",
                customClass: {
                    popup: 'swal2-border-radius'
                },
                width: 900,
                willOpen: () => {
                    document.querySelector('.swal2-popup').style.borderRadius = '18px';
                    document.querySelector('.swal2-popup').style.maxWidth = '90vw';
                },
                preConfirm: () => {
                    const nivel = document.querySelector('input[name="nivel"]:checked');
                    if (!nivel) {
                        Swal.showValidationMessage("Debes seleccionar una opción");
                        return false;
                    }
                    return nivel.value;
                }
            });

            if (result.isConfirmed) {
                const id_puntuacion_codificacion = parseInt(result.value, 10);
                await axios.post(apiUrl('/api/ados/responder-codificacion'), {
                    id_ados: id_ados_final,
                    id_puntuacion_codificacion
                }, { headers: { Authorization: `Bearer ${token}` } });

                // Detecta el algoritmo según el puntaje de la opción seleccionada
                const opcionSeleccionada = opciones.find(op => op.id_puntuacion_codificacion === id_puntuacion_codificacion);
                const puntaje = opcionSeleccionada ? opcionSeleccionada.puntaje : null;

                // 2. Valida la edad y el puntaje según la lógica solicitada
                const edadMeses = calcularEdadMeses(fechaNacimiento);
                let id_algoritmo = null;

                if (
                    (edadMeses >= 12 && edadMeses <= 20) ||
                    (edadMeses >= 21 && edadMeses <= 30 && (puntaje === 3 || puntaje === 4))
                ) {
                    id_algoritmo = 7;
                } else if (
                    (edadMeses >= 21 && edadMeses <= 30 && (puntaje === 0 || puntaje === 1 || puntaje === 2))
                ) {
                    id_algoritmo = 8;
                }

                if (id_algoritmo) {
                    let nombreAlgoritmo = "Algoritmo";
                    try {
                        const algRes = await axios.get(apiUrl(`/api/ados/algoritmo/${id_algoritmo}`), {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        nombreAlgoritmo = algRes.data.titulo || nombreAlgoritmo;
                    } catch (e) { }
                    await Swal.fire({
                        icon: "info",
                        title: "Algoritmo seleccionado",
                        html: `
                    <div style="font-size:1.1em;">
                        Se aplicará el <b style="color:${COLOR_PRIMARY};">${nombreAlgoritmo}</b> según la edad y respuesta seleccionada.<br/><br/>
                        Haz clic en <b>Continuar</b> para responder las preguntas del algoritmo.
                    </div>
                `,
                        confirmButtonText: "Continuar",
                        customClass: { popup: 'swal2-border-radius' }
                    });
                    navigate(`/ados/responder-items/${id_ados_final}/${id_algoritmo}`);
                } else {
                    Swal.fire("No se puede elegir algoritmo", "La edad y/o respuesta no cumplen los requisitos para este módulo.", "warning");
                }
            }
            return;
        }

        // Si no cumple ningún criterio
        Swal.fire("No se puede elegir algoritmo", "No se cumplen los requisitos para seleccionar un algoritmo.", "warning");
    };

    // Funciones para calcular edad
    const calcularEdadAnios = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const calcularEdadMeses = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
        meses += hoy.getMonth() - nacimiento.getMonth();
        if (hoy.getDate() < nacimiento.getDate()) {
            meses--;
        }
        return meses;
    };

    if (actividades.length === 0) {
        return (
            <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
                <Navbar />
                <div className="container py-4 flex-grow-1">
                    <h3 className="text-center">Cargando actividades...</h3>
                </div>
                <Footer />
            </div>
        );
    }

    const actividad = actividades[indice];
    const obsActual = observaciones.find(o => o.id_actividad === actividad.id_actividad)?.observacion || "";

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <div className="card shadow mb-4" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        <h2 className="mb-4" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                            Actividad {indice + 1} de {actividades.length}
                        </h2>
                        <h4 style={{ color: COLOR_ACCENT }}>{actividad.nombre_actividad}</h4>
                        <p><b>Objetivo:</b> {actividad.objetivo}</p>
                        <p><b>Materiales:</b> {actividad.materiales}</p>
                        <p><b>Instrucciones:</b> {actividad.intrucciones}</p>
                        <p><b>Aspectos a Observar:</b> {actividad.aspectos_observar}</p>
                        <p><b>Info Complementaria:</b> {actividad.info_complementaria}</p>
                        <div className="mb-3">
                            <label className="form-label" style={{ color: COLOR_DARK, fontWeight: "bold" }}>
                                Observación de la actividad:
                            </label>
                            <textarea
                                className="form-control"
                                value={obsActual}
                                onChange={e => handleObservacion(e.target.value)}
                                rows={3}
                                placeholder="Escribe aquí la observación..."
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button
                                className="btn"
                                style={{ background: COLOR_ACCENT, color: "#fff", fontWeight: "bold" }}
                                onClick={handleAnterior}
                                disabled={indice === 0}
                            >
                                Anterior
                            </button>
                            <button
                                className="btn"
                                style={{ background: "#ffc107", color: "#333", fontWeight: "bold" }}
                                onClick={handlePausar}
                            >
                                Pausar test
                            </button>
                            {indice < actividades.length - 1 ? (
                                <button
                                    className="btn"
                                    style={{ background: COLOR_PRIMARY, color: "#fff", fontWeight: "bold" }}
                                    onClick={handleSiguiente}
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    style={{ background: COLOR_PRIMARY, color: "#fff", fontWeight: "bold" }}
                                    onClick={handleFinalizarActividades}
                                >
                                    Finalizar Actividades
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ActividadesADOS;