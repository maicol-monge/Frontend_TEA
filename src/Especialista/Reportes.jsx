import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";
import ReportAdiR from "../Reportes/ReportAdiR";
import ReporteModuleT from "../Reportes/ModuloT";
import ReporteModulo1 from "../Reportes/Modulo1";
import ReporteModulo2 from "../Reportes/Modulo2";
import ReporteModulo3 from "../Reportes/Modulo3";
import ReporteModulo4 from "../Reportes/Modulo4";

const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";
const COLOR_DARK = "#1d3557";

// Helper para fecha local en formato YYYY-MM-DD
const getFechaLocal = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getFechaYMD = (fecha) => {
    if (!fecha) return "";
    // Convierte a local, ignora la hora
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const Reportes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [tipoTest, setTipoTest] = useState("todos");
    const [pacienteActivo, setPacienteActivo] = useState(null);
    const [reporteAdiR, setReporteAdiR] = useState(null);
    const [reporteT, setReporteT] = useState(null);
    const [reporteM1, setReporteM1] = useState(null);
    const [reporteM2, setReporteM2] = useState(null);
    const [reporteM3, setReporteM3] = useState(null);
    const [reporteM4, setReporteM4] = useState(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    // Cargar pacientes con tests recientes y filtro de fechas
    useEffect(() => {
        const token = localStorage.getItem("token");
        let params = [];
        if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
        if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
        const query = params.length ? "?" + params.join("&") : "";
        axios.get(apiUrl(`/api/especialistas/reportes/pacientes-con-tests${query}`), {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setPacientes(res.data))
        .catch(() => setPacientes([]));
    }, [fechaInicio, fechaFin]);

    // Filtrar pacientes por nombre o apellido
    const pacientesFiltrados = pacientes.filter(p =>
        (p.nombres + " " + p.apellidos).toLowerCase().includes(busqueda.toLowerCase())
    );

    // Mostrar tests filtrados por tipo
    const getTestsFiltrados = (paciente) => {
        let tests = [];
        if (tipoTest === "adir" || tipoTest === "todos") {
            tests = tests.concat((paciente.tests_adir || []).map(t => ({ ...t, tipo: "ADI-R" })));
        }
        if (tipoTest === "ados" || tipoTest === "todos") {
            tests = tests.concat((paciente.tests_ados || []).map(t => ({ ...t, tipo: "ADOS-2" })));
        }
        // FILTRO POR FECHA LOCAL (solo compara YYYY-MM-DD)
        tests = tests.filter(test => {
            const testFecha = getFechaYMD(test.fecha); // local
            // Si no hay filtro, pasa
            if (fechaInicio && testFecha < fechaInicio) return false;
            if (fechaFin && testFecha > fechaFin) return false;
            return true;
        });
        // Ordenar por fecha descendente
        return tests.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    };

    // Método para cargar el reporte ADI-R
    const handleGenerarReporte = async (test) => {
        const token = localStorage.getItem("token");
        if (test.tipo === "ADOS-2" && test.modulo === "T") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/ados/reporte-modulo-t/${test.id_ados}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteT(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        } else if (test.tipo === "ADOS-2" && test.modulo === "1") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/ados/reporte-modulo-1/${test.id_ados}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteM1(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        } else if (test.tipo === "ADOS-2" && test.modulo === "2") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/ados/reporte-modulo-2/${test.id_ados}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteM2(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        } else if (test.tipo === "ADOS-2" && test.modulo === "3") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/ados/reporte-modulo-3/${test.id_ados}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteM3(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        } else if (test.tipo === "ADOS-2" && test.modulo === "4") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/ados/reporte-modulo-4/${test.id_ados}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteM4(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        } else if (test.tipo === "ADI-R") {
            try {
                const res = await axios.get(
                    apiUrl(`/api/adir/resumen-paciente/${test.id_adir}`),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReporteAdiR(res.data);
                console.log(res.data);
            } catch (e) {
                alert("No se pudo generar el reporte.");
            }
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100" style={{ background: "#f8f9fa" }}>
            <Navbar />
            <div className="container py-4 flex-grow-1">
                <h2 className="mb-4" style={{ color: COLOR_DARK, fontWeight: "bold" }}>Reportes de Pacientes</h2>
                <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                        <select className="form-select" value={tipoTest} onChange={e => setTipoTest(e.target.value)}>
                            <option value="todos">Todos los tests</option>
                            <option value="adir">Solo ADI-R</option>
                            <option value="ados">Solo ADOS-2</option>
                        </select>
                    </div>
                    <div className="col-md-3 mb-2">
                        <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={e => {
                                const hoy = getFechaLocal();
                                if (e.target.value > hoy) return; // Evita fechas futuras
                                setFechaInicio(e.target.value);
                                // Si la fecha de fin es menor, la resetea
                                if (fechaFin && e.target.value > fechaFin) setFechaFin("");
                            }}
                            placeholder="Fecha inicio"
                            max={getFechaLocal()} // No permite fechas futuras
                        />
                    </div>
                    <div className="col-md-3 mb-2">
                        <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={e => {
                                if (fechaInicio && e.target.value < fechaInicio) return; // Evita fechas antes de inicio
                                setFechaFin(e.target.value);
                            }}
                            placeholder="Fecha fin"
                            min={fechaInicio || undefined} // No permite fechas antes de inicio
                            max={getFechaLocal()} // No permite fechas futuras
                        />
                    </div>
                    <div className="col-md-2 mb-2">
                        <input
                            className="form-control"
                            placeholder="Buscar paciente por nombre o apellido..."
                            value={busqueda}
                            onChange={e => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
                <div className="list-group">
                    {pacientesFiltrados.length === 0 && (
                        <div className="alert alert-info">No se encontraron pacientes.</div>
                    )}
                    {pacientesFiltrados.map(paciente => (
                        <div key={paciente.id_paciente} className="list-group-item mb-3 shadow-sm rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{paciente.nombres} {paciente.apellidos}</strong>
                                    <span className="ms-2 badge bg-secondary">{paciente.sexo === "M" ? "Masculino" : "Femenino"}</span>
                                    <span className="ms-2 text-muted" style={{ fontSize: 14 }}>
                                        Nacimiento: {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-ES")}
                                        {" | Edad: "}
                                        {(() => {
                                            const nacimiento = new Date(paciente.fecha_nacimiento);
                                            const hoy = new Date();
                                            let años = hoy.getFullYear() - nacimiento.getFullYear();
                                            let meses = hoy.getMonth() - nacimiento.getMonth();
                                            if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
                                                años--;
                                                meses += 12;
                                            }
                                            if (hoy.getDate() < nacimiento.getDate()) {
                                                meses--;
                                                if (meses < 0) {
                                                    años--;
                                                    meses += 12;
                                                }
                                            }
                                            return `${años} años${meses >= 0 ? ` y ${meses} meses` : ""}`;
                                        })()}
                                    </span>
                                </div>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setPacienteActivo(pacienteActivo === paciente.id_paciente ? null : paciente.id_paciente)}
                                >
                                    {pacienteActivo === paciente.id_paciente ? "Ocultar tests" : "Ver tests"}
                                </button>
                            </div>
                            {pacienteActivo === paciente.id_paciente && (
                                <div className="mt-3">
                                    {getTestsFiltrados(paciente).length === 0 && (
                                        <div className="alert alert-warning">Este paciente no tiene tests registrados.</div>
                                    )}
                                    {getTestsFiltrados(paciente).map(test => (
                                        <div
                                            key={`${test.tipo}-${test.id_adir || test.id_ados}`}
                                            className="card mb-2"
                                        >
                                            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                                <div>
                                                    <span className="badge bg-info me-2">{test.tipo}</span>
                                                    <span className="fw-bold">Fecha:</span> {new Date(test.fecha).toLocaleString()}
                                                    {test.tipo === "ADI-R" && (
                                                        <>
                                                            <span className="ms-3 fw-bold">Diagnóstico:</span> {test.diagnostico || "N/A"}
                                                            <span className="ms-3 fw-bold">Algoritmo:</span> {test.algoritmo}
                                                        </>
                                                    )}
                                                    {test.tipo === "ADOS-2" && (
                                                        <>
                                                            <span className="ms-3 fw-bold">Diagnóstico:</span> {test.diagnostico || "N/A"}
                                                            <span className="ms-3 fw-bold">Módulo:</span> {test.modulo}
                                                            <span className="ms-3 fw-bold">Clasificación:</span> {test.clasificacion}
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-success mt-2 mt-md-0"
                                                    onClick={() => handleGenerarReporte(test)}
                                                >
                                                    Generar Reporte
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {/* MODAL para ADI-R */}
                {reporteAdiR && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte ADI-R</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteAdiR(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <ReportAdiR datos={reporteAdiR} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {reporteT && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte Módulo T</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteT(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <ReporteModuleT datos={reporteT} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {reporteM1 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte Módulo 1</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteM1(null)}></button>
                                </div>
                                <div className="modal-body">
                                    {console.log(reporteM1)}
                                    <ReporteModulo1 datos={reporteM1} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {reporteM2 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte Módulo 2</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteM2(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <ReporteModulo2 datos={reporteM2} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {reporteM3 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte Módulo 3</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteM3(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <ReporteModulo3 datos={reporteM3} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {reporteM4 && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Reporte Módulo 4</h5>
                                    <button type="button" className="btn-close" onClick={() => setReporteM4(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <ReporteModulo4 datos={reporteM4} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Reportes;