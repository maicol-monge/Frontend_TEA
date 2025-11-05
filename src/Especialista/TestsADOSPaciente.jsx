import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from '../components/Navbar_espe';
import Footer from '../components/Footer';
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";
const COLOR_BG = "#a8dadc";

const mostrarCampo = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "N/A";
    return valor;
};

const TestsADOSPaciente = () => {
    const { id_paciente } = useParams();
    const [tests, setTests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            const token = localStorage.getItem("token");
            const res = await axios.get(apiUrl(`/api/ados/tests/${id_paciente}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTests(res.data);
        };
        fetchTests();
    }, [id_paciente]);

    const handleCrearTest = async () => {
        // Validar filtros antes de mostrar el modal
        const token = localStorage.getItem("token");
        const res = await axios.get(apiUrl(`/api/ados/validar-filtros/${id_paciente}`), {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.permitido) {
            Swal.fire("No permitido", res.data.message, "warning");
            return;
        }

        const { value: modulo } = await Swal.fire({
            title: 'Selecciona el módulo',
            input: 'select',
            inputOptions: {
                'T': 'Módulo T',
                '1': 'Módulo 1',
                '2': 'Módulo 2',
                '3': 'Módulo 3',
                '4': 'Módulo 4'
            },
            inputPlaceholder: 'Selecciona un módulo',
            showCancelButton: true,
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        });

        if (modulo) {
            const id_especialista = localStorage.getItem("id_especialista");
            navigate(`/ados/actividades/${modulo}/${id_paciente}?id_especialista=${id_especialista}`);
        }
    };

    // Nueva función para mostrar el modal y guardar la puntuación comparativa
    const handleAplicarPuntuacionComparativa = async (id_ados) => {
        const tablaHtml = `
            <div>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th style="width:180px;">Puntuación comparativa del ADOS-2</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>10, 9, 8</td>
                            <td>Nivel alto de síntomas asociados del espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a una clasificación del ADOS-2 de autismo</td>
                        </tr>
                        <tr>
                            <td>7, 6, 5</td>
                            <td>Nivel moderado de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a las clasificaciones del ADOS-2 de espectro autista o de autismo</td>
                        </tr>
                        <tr>
                            <td>4, 3</td>
                            <td>Nivel bajo de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a las clasificaciones del ADOS-2 de no TEA o de especto autista.</td>
                        </tr>
                        <tr>
                            <td>2, 1</td>
                            <td>Nivel mínimo o no evidencia de síntomas asociados al espectro autista en comparación con niños que tienen TEA y que tienen la misma edad cronológica y nivel de lenguaje. Corresponde a la clasificación del ADOS-2 de no TEA.</td>
                        </tr>
                    </tbody>
                </table>
                <div class="mt-3">
                    <label for="puntComp">Selecciona la puntuación comparativa:</label>
                    <select id="puntComp" class="form-control mt-2">
                        ${[10,9,8,7,6,5,4,3,2,1].map(v => `<option value="${v}">${v}</option>`).join("")}
                    </select>
                </div>
            </div>
        `;

        const { value: confirm } = await Swal.fire({
            title: "Puntuación comparativa",
            html: tablaHtml,
            width: 900, // <-- Solo esta línea hace el modal más ancho
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const select = Swal.getPopup().querySelector('#puntComp');
                return select.value;
            }
        });

        if (confirm) {
            const token = localStorage.getItem("token");
            try {
                // Guarda la puntuación comparativa
                await axios.put(apiUrl(`/api/ados/puntuacion-comparativa/${id_ados}`), {
                    puntuacion_comparativa: confirm
                }, { headers: { Authorization: `Bearer ${token}` } });
                // Cambia el estado a 4 (Diagnóstico pendiente)
                await axios.put(apiUrl(`/api/ados/pausar/${id_ados}`), {
                    estado: 4
                }, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire("¡Guardado!", "La puntuación comparativa fue guardada.", "success").then(() => window.location.reload());
            } catch (e) {
                Swal.fire("Error", "No se pudo guardar la puntuación comparativa.", "error");
            }
        }
    };

    const handleDiagnosticar = async (id_ados) => {
        const { value: diagnostico } = await Swal.fire({
            title: "Asignar diagnóstico",
            input: "textarea",
            inputLabel: "Diagnóstico",
            inputPlaceholder: "Escribe el diagnóstico aquí...",
            inputAttributes: {
                "aria-label": "Escribe el diagnóstico aquí"
            },
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar"
        });

        if (diagnostico) {
            const token = localStorage.getItem("token");
            try {
                // Guarda el diagnóstico
                await axios.put(apiUrl(`/api/ados/diagnostico/${id_ados}`), {
                    diagnostico
                }, { headers: { Authorization: `Bearer ${token}` } });
                // Cambia el estado a 0 (Finalizado)
                await axios.put(apiUrl(`/api/ados/pausar/${id_ados}`), {
                    estado: 0
                }, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire("¡Guardado!", "El diagnóstico fue guardado.", "success").then(() => window.location.reload());
            } catch (e) {
                Swal.fire("Error", "No se pudo guardar el diagnóstico.", "error");
            }
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <button
                    className="btn mb-3"
                    style={{
                        background: COLOR_DARK,
                        color: "#fff",
                        fontWeight: "bold"
                    }}
                    onClick={() => navigate(-1)}
                >
                    Volver
                </button>
                <div className="card shadow mb-4" style={{ borderRadius: 18 }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2 className="mb-0" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                Tests ADOS-2 del Paciente
                            </h2>
                            <button
                                className="btn"
                                style={{
                                    background: COLOR_ACCENT,
                                    color: "#fff",
                                    fontWeight: "bold"
                                }}
                                onClick={handleCrearTest}
                            >
                                Crear nuevo test
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered align-middle text-center" style={{ borderRadius: 12, overflow: "hidden" }}>
                                <thead style={{ background: COLOR_PRIMARY, color: "#fff" }}>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Módulo</th>
                                        <th>Diagnóstico</th>
                                        <th>Total Puntos</th>
                                        <th>Clasificación</th>
                                        <th>Puntuación Comparativa</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map(t => (
                                        <tr key={t.id_ados}>
                                            <td>{t.fecha ? new Date(t.fecha).toLocaleDateString() : "N/A"}</td>
                                            <td>{mostrarCampo(t.modulo)}</td>
                                            <td>{mostrarCampo(t.diagnostico)}</td>
                                            <td>{mostrarCampo(t.total_punto)}</td>
                                            <td>{mostrarCampo(t.clasificacion)}</td>
                                            <td>{mostrarCampo(t.puntuacion_comparativa)}</td>
                                            <td>
                                                {t.estado === 1 && (
                                                    <span className="badge bg-warning text-dark">Pausado en actividades</span>
                                                )}
                                                {t.estado === 2 && (
                                                    <span className="badge bg-info text-dark">Pausado en algoritmo</span>
                                                )}
                                                {t.estado === 3 && (
                                                    <span className="badge bg-secondary">Puntuación comparativa pendiente</span>
                                                )}
                                                {t.estado === 4 && (
                                                    <span className="badge bg-danger">Diagnóstico pendiente</span>
                                                )}
                                                {t.estado === 0 && (
                                                    <span className="badge bg-success">Finalizado</span>
                                                )}
                                            </td>
                                            <td>
                                                {t.estado === 1 && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => {
                                                            navigate(`/ados/actividades/${t.modulo}/${t.id_paciente}?id_ados=${t.id_ados}`);
                                                        }}
                                                    >
                                                        Continuar
                                                    </button>
                                                )}
                                                {t.estado === 2 && (
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={async () => {
                                                            const token = localStorage.getItem("token");
                                                            try {
                                                                const res = await axios.get(apiUrl(`/api/ados/algoritmo-por-test/${t.id_ados}`), {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                const id_algoritmo = res.data.id_algoritmo;
                                                                if (id_algoritmo) {
                                                                    navigate(`/ados/responder-items/${t.id_ados}/${id_algoritmo}`);
                                                                } else {
                                                                    Swal.fire("No se pudo determinar el algoritmo para este test.");
                                                                }
                                                            } catch (e) {
                                                                Swal.fire("Error al obtener el algoritmo para este test.");
                                                            }
                                                        }}
                                                    >
                                                        Continuar
                                                    </button>
                                                )}
                                                {t.estado === 3 && (
                                                    <button
                                                        className="btn btn-sm btn-warning"
                                                        onClick={() => handleAplicarPuntuacionComparativa(t.id_ados)}
                                                    >
                                                        Aplicar
                                                    </button>
                                                )}
                                                {t.estado === 4 && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDiagnosticar(t.id_ados)}
                                                    >
                                                        Diagnosticar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {tests.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center">No hay tests ADOS-2 para este paciente.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TestsADOSPaciente;