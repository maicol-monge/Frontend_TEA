import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AdiRForm from "../components/AdiRForm";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";
const COLOR_BG = "#a8dadc";

const CONVERSION_CODIGO = {
    0: 0,
    1: 1,
    2: 2,
    3: 2,
    7: 0,
    8: 0,
    9: 0
};

const opcionesAlgoritmo = [
    {
        tipo: "conducta",
        label: "Algoritmo de la conducta actual",
        edades: [
            { value: "2-3", label: "2 años, 0 meses a 3 años, 11 meses" },
            { value: "4-9", label: "4 años, 0 meses a 9 años, 11 meses" },
            { value: "10+", label: "10 años, 0 meses en adelante" }
        ]
    },
    {
        tipo: "diagnostico",
        label: "Algoritmo diagnóstico",
        edades: [
            { value: "2-3", label: "2 años, 0 meses a 3 años, 11 meses" },
            { value: "4+", label: "4 años, 0 meses en adelante" }
        ]
    }
];

const opcionesTipoSujeto = [
    { value: "verbal", label: 'Verbal (pregunta 30 = 0)' },
    { value: "no-verbal", label: 'No verbal (pregunta 30 = 1 ó 2)' }
];

const Algoritmo = () => {
    const { id_adir } = useParams();
    const [tipoAlgoritmo, setTipoAlgoritmo] = useState("");
    const [edadAlgoritmo, setEdadAlgoritmo] = useState("");
    const [tipoSujeto, setTipoSujeto] = useState("");
    const [datosPaciente, setDatosPaciente] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // NUEVAS VARIABLES PARA USO POSTERIOR
    const [algoritmoSeleccionado, setAlgoritmoSeleccionado] = useState("");
    const [edadSeleccionada, setEdadSeleccionada] = useState("");

    // Detecta la edad cronológica en meses
    const calcularEdadMeses = (fechaNacimiento) => {
        if (!fechaNacimiento) return 0;
        const hoy = dayjs();
        const nacimiento = dayjs(fechaNacimiento);
        return hoy.diff(nacimiento, "month");
    };

    // Detecta automáticamente la edadAlgoritmo según la edad cronológica y el algoritmo seleccionado
    useEffect(() => {
        if (!tipoAlgoritmo || !datosPaciente?.fecha_nacimiento) return;

        const edadMeses = calcularEdadMeses(datosPaciente.fecha_nacimiento);
        let edadDetectada = "";

        if (tipoAlgoritmo === "conducta") {
            if (edadMeses >= 24 && edadMeses <= 47) edadDetectada = "2-3";
            else if (edadMeses >= 48 && edadMeses <= 119) edadDetectada = "4-9";
            else if (edadMeses >= 120) edadDetectada = "10+";
        } else if (tipoAlgoritmo === "diagnostico") {
            if (edadMeses >= 24 && edadMeses <= 47) edadDetectada = "2-3";
            else if (edadMeses >= 48) edadDetectada = "4+";
        }

        setEdadAlgoritmo(edadDetectada);
        setEdadSeleccionada(edadDetectada);
        setAlgoritmoSeleccionado(tipoAlgoritmo);
    }, [tipoAlgoritmo, datosPaciente]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Obtener respuestas y datos del paciente
        axios.get(apiUrl(`/api/adir/preguntas-con-respuestas/${id_adir}`), {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setRespuestas(res.data.respuestas || {});
            setDatosPaciente(res.data.paciente || null);
            setLoading(false);
        });

        // Determinar y actualizar tipo de sujeto automáticamente
        axios.put(apiUrl(`/api/adir/determinar-tipo-sujeto/${id_adir}`), {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setTipoSujeto(res.data.tipo_sujeto);
        });
    }, [id_adir]);

    useEffect(() => {
        // Si no tienes los datos del paciente en esa respuesta, puedes hacer otra petición para obtenerlos
        if (!datosPaciente && id_adir) {
            const token = localStorage.getItem("token");
            axios.get(apiUrl(`/api/adir/id-paciente/${id_adir}`), {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const idPaciente = res.data.id_paciente;

            });
        }
    }, [datosPaciente, id_adir]);

    // Función para calcular edad cronológica
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "";
        const hoy = dayjs();
        const nacimiento = dayjs(fechaNacimiento);
        const años = hoy.diff(nacimiento, "year");
        return `${años} años`;
    };

    // Función para formatear la fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        return dayjs(fecha).format("DD/MM/YYYY");
    };

    if (loading) return <div className="text-center py-5" style={{ color: COLOR_PRIMARY, fontWeight: 700 }}>Cargando...</div>;

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: COLOR_BG }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        {/* Botón para regresar a ResponderAdir */}
                        <div className="mb-4 d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn"
                                style={{
                                    background: COLOR_PRIMARY,
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 17,
                                    letterSpacing: 1,
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px #457b9d22"
                                }}
                                onClick={() => navigate(`/responder-adir/${id_adir}`)}
                            >
                                ← Volver a Responder ADI-R
                            </button>
                        </div>
                        <div
                            className="shadow"
                            style={{
                                borderRadius: 24,
                                background: "linear-gradient(90deg, #e0ecf7 0%, #f8fafc 100%)",
                                border: `2px solid ${COLOR_PRIMARY}`,
                                marginBottom: 32
                            }}
                        >
                            <div className="px-4 py-4">
                                <h2
                                    className="mb-4"
                                    style={{
                                        color: COLOR_PRIMARY,
                                        fontWeight: 900,
                                        fontSize: 32,
                                        letterSpacing: 1
                                    }}
                                >
                                    ADI-R <span style={{ color: COLOR_ACCENT, fontWeight: 700 }}>Algoritmos</span>
                                </h2>
                                {/* Datos del paciente */}
                                <section
                                    className="mb-5 shadow-sm"
                                    style={{
                                        background: "#fff",
                                        borderRadius: 18,
                                        border: `1.5px solid ${COLOR_PRIMARY}`,
                                        padding: 24
                                    }}
                                >
                                    {datosPaciente ? (
                                        <div className="row text-lg">
                                            <div className="col-md-6 mb-2">
                                                <b style={{ color: COLOR_PRIMARY }}>Nombre:</b>{" "}
                                                <span style={{ color: COLOR_DARK }}>{datosPaciente.nombres} {datosPaciente.apellidos}</span>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <b style={{ color: COLOR_PRIMARY }}>Sexo:</b>{" "}
                                                <span style={{ color: COLOR_DARK }}>{datosPaciente.sexo}</span>
                                            </div>
                                            <div className="col-md-3 mb-2">
                                                <b style={{ color: COLOR_PRIMARY }}>ID Test:</b>{" "}
                                                <span style={{ color: COLOR_ACCENT }}>{id_adir}</span>
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <b style={{ color: COLOR_PRIMARY }}>Fecha de nacimiento:</b>{" "}
                                                <span style={{ color: COLOR_DARK }}>{formatearFecha(datosPaciente.fecha_nacimiento)}</span>
                                            </div>
                                            <div className="col-md-4 mb-2">
                                                <b style={{ color: COLOR_PRIMARY }}>Edad cronológica:</b>{" "}
                                                <span style={{ color: COLOR_DARK }}>{calcularEdad(datosPaciente.fecha_nacimiento)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted">Cargando datos del paciente...</div>
                                    )}
                                </section>
                                {/* Selección de algoritmo */}
                                <section className="mb-5">
                                    <h5 className="mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                        Seleccione el algoritmo a utilizar:
                                    </h5>
                                    <div className="row">
                                        {opcionesAlgoritmo.map(op => (
                                            <div className="col-md-6 mb-2" key={op.tipo}>
                                                <div className="form-check mb-1">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="tipoAlgoritmo"
                                                        id={op.tipo}
                                                        value={op.tipo}
                                                        checked={tipoAlgoritmo === op.tipo}
                                                        onChange={e => {
                                                            setTipoAlgoritmo(e.target.value);
                                                            setAlgoritmoSeleccionado(e.target.value);
                                                        }}
                                                    />
                                                    <label className="form-check-label fw-bold" htmlFor={op.tipo} style={{ color: COLOR_DARK }}>
                                                        {op.label}
                                                    </label>
                                                </div>
                                                {tipoAlgoritmo === op.tipo && (
                                                    <div className="ms-4 mt-2">
                                                        {op.edades.map(ed => (
                                                            <div className="form-check" key={ed.value}>
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="edadAlgoritmo"
                                                                    id={op.tipo + ed.value}
                                                                    value={ed.value}
                                                                    checked={edadAlgoritmo === ed.value}
                                                                    readOnly
                                                                />
                                                                <label className="form-check-label" htmlFor={op.tipo + ed.value} style={{ color: COLOR_DARK }}>
                                                                    {ed.label}
                                                                    {edadAlgoritmo === ed.value && (
                                                                        <span style={{ color: COLOR_ACCENT, fontWeight: 700, marginLeft: 8 }}>
                                                                            (Detectado)
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                {/* Selección de tipo de sujeto */}
                                <section className="mb-5">
                                    <h5 className="mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                        Tipo de sujeto:
                                    </h5>
                                    <span className="badge fs-6" style={{
                                        background: COLOR_PRIMARY,
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: 18,
                                        padding: "10px 22px",
                                        borderRadius: 12
                                    }}>
                                        {tipoSujeto === "verbal" ? "Verbal (pregunta 30 = 0)" : tipoSujeto === "no-verbal" ? "No verbal (pregunta 30 = 1 ó 2)" : "No determinado"}
                                    </span>
                                </section>
                                {/* Tabla de conversión de códigos */}
                                <section className="mb-5">
                                    <h5 className="mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                        Conversión de los códigos a puntuación algorítmica:
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered w-auto mb-0" style={{ borderRadius: 12, overflow: "hidden" }}>
                                            <thead>
                                                <tr className="text-center align-middle">
                                                    <th style={{ background: "#e3eef7", color: COLOR_PRIMARY }}>Código</th>
                                                    <th>0</th>
                                                    <th>1</th>
                                                    <th>2</th>
                                                    <th>3</th>
                                                    <th>7</th>
                                                    <th>8</th>
                                                    <th>9</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="text-center align-middle">
                                                    <th style={{ background: "#e3eef7", color: COLOR_PRIMARY }}>Puntuación</th>
                                                    <td>0</td>
                                                    <td>1</td>
                                                    <td>2</td>
                                                    <td>2</td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                    <td>0</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                                {/* Tabla de puntos de corte ADI-R */}
                                <section className="mb-5">
                                    <h5 className="mb-3" style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}>
                                        Puntos de corte del ADI-R:
                                    </h5>
                                    <div className="table-responsive">
                                        <table className="table table-bordered w-auto mb-0" style={{ borderRadius: 12, overflow: "hidden" }}>
                                            <thead>
                                                <tr className="text-center align-middle">
                                                    <th style={{ background: "#e3eef7", color: COLOR_PRIMARY }}>Dominio</th>
                                                    <th style={{ background: "#e3eef7", color: COLOR_PRIMARY }}>Descripción</th>
                                                    <th style={{ background: "#e3eef7", color: COLOR_PRIMARY }}>Punto de corte</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="text-center align-middle">
                                                    <td style={{ background: "#f8fafc" }}>A</td>
                                                    <td>Interacción social recíproca</td>
                                                    <td>&ge; 10</td>
                                                </tr>
                                                <tr className="text-center align-middle">
                                                    <td style={{ background: "#f8fafc" }}>B (V)</td>
                                                    <td>Comunicación (verbal)</td>
                                                    <td>&ge; 8</td>
                                                </tr>
                                                <tr className="text-center align-middle">
                                                    <td style={{ background: "#f8fafc" }}>B (NV)</td>
                                                    <td>Comunicación (no verbal)</td>
                                                    <td>&ge; 7</td>
                                                </tr>
                                                <tr className="text-center align-middle">
                                                    <td style={{ background: "#f8fafc" }}>C</td>
                                                    <td>Conductas repetitivas / estereotipadas</td>
                                                    <td>&ge; 3</td>
                                                </tr>
                                                <tr className="text-center align-middle">
                                                    <td style={{ background: "#f8fafc" }}>D</td>
                                                    <td>Alteraciones antes de los 36 meses</td>
                                                    <td>&ge; 1</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                                {/* Renderiza el formulario ADI-R solo si hay algoritmo y edad */}
                                {tipoAlgoritmo && edadAlgoritmo && (
                                    <div className="mb-4">
                                        <AdiRForm
                                            id_adir={id_adir}
                                            datosPaciente={datosPaciente}
                                            respuestas={respuestas}
                                            tipoAlgoritmo={tipoAlgoritmo}
                                            edadAlgoritmo={edadAlgoritmo}
                                            tipoSujeto={tipoSujeto}
                                            algoritmoSeleccionado={algoritmoSeleccionado}
                                            edadSeleccionada={edadSeleccionada}
                                        />
                                    </div>
                                )}
                                {!tipoAlgoritmo && (
                                    <div className="mb-4">
                                        <div className="alert alert-info mt-4 mb-0" style={{ fontSize: 18 }}>
                                            Seleccione el algoritmo.
                                        </div>
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

export default Algoritmo;