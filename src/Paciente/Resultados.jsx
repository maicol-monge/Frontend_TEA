import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import Navbar from "../components/Navbar_paciente";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import ReporteModuleT from "../Reportes/ModuloT";
import ReporteModulo1 from "../Reportes/Modulo1";
import ReporteModulo2 from "../Reportes/Modulo2";
import ReporteModulo3 from "../Reportes/Modulo3";
import ReporteModulo4 from "../Reportes/Modulo4";
import ReportAdiR_paciente from "../Reportes/ReportAdiR_paciente";

const COLOR_BG = "#a8dadc";
const COLOR_PRIMARY = "#457b9d";
const COLOR_DARK = "#1d3557";
const COLOR_ACCENT = "#f3859e";

// Helper para fecha local en formato YYYY-MM-DD
const getFechaLocal = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Resultados = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tipo, setTipo] = useState("adir");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporteT, setReporteT] = useState(null);
  const [reporteM1, setReporteM1] = useState(null);
  const [reporteM2, setReporteM2] = useState(null);
  const [reporteM3, setReporteM3] = useState(null);
  const [reporteM4, setReporteM4] = useState(null);
  const [reporteAdiR, setReporteAdiR] = useState(null);
  const navigate = useNavigate();

  const fetchResultados = async (
    id_paciente,
    token,
    tipo,
    fechaInicio,
    fechaFin
  ) => {
    setLoading(true);
    setError("");
    try {
      let params = [];
      if (tipo) params.push(`tipo=${tipo}`);
      if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
      if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
      const query = params.length ? "?" + params.join("&") : "";
      const res = await axios.get(
        apiUrl(`/api/pacientes/resultados/${id_paciente}${query}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTests(res.data);
    } catch (err) {
      setError("No se pudieron cargar los resultados.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const cargar = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      if (!user || !token) {
        navigate("/");
        return;
      }
      // Obtener id_paciente
      const { data: pacienteData } = await axios.get(
        apiUrl(`/api/pacientes/buscar-paciente/${user.id_usuario}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const id_paciente = pacienteData.paciente.id_paciente;
      fetchResultados(id_paciente, token, tipo, fechaInicio, fechaFin);
    };
    cargar();
    // eslint-disable-next-line
  }, [tipo, fechaInicio, fechaFin, navigate]);

  const handleGenerarResultado = async (test) => {
    if (test.tipo === "ADOS-2" && test.modulo === "T") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/ados/reporte-modulo-t/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteT(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else if (test.tipo === "ADOS-2" && test.modulo === "1") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/ados/reporte-modulo-1/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteM1(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else if (test.tipo === "ADOS-2" && test.modulo === "2") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/ados/reporte-modulo-2/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteM2(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else if (test.tipo === "ADOS-2" && test.modulo === "3") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/ados/reporte-modulo-3/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteM3(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else if (test.tipo === "ADOS-2" && test.modulo === "4") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/ados/reporte-modulo-4/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteM4(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else if (test.tipo === "ADI-R") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          apiUrl(`/api/adir/resumen-paciente/${test.id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReporteAdiR(res.data);
      } catch (e) {
        alert("No se pudo generar el reporte.");
      }
    } else {
      alert(`Generar resultado para ${test.tipo} (ID: ${test.id})`);
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: COLOR_BG }}
    >
      <Navbar />
      <div className="container py-5 flex-grow-1">
        <h2
          className="text-center mb-4"
          style={{ color: COLOR_PRIMARY, fontWeight: "bold" }}
        >
          Resultados de Evaluaciones
        </h2>
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {/* <option value="todos">Todos los tests</option> */}
              <option value="adir">Solo ADI-R</option>
              <option value="ados">Solo ADOS-2</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="date"
              className="form-control"
              value={fechaInicio}
              onChange={(e) => {
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
              onChange={(e) => {
                if (fechaInicio && e.target.value < fechaInicio) return; // Evita fechas anteriores a inicio
                setFechaFin(e.target.value);
              }}
              placeholder="Fecha fin"
              min={fechaInicio || undefined} // No permite fechas antes de inicio
              max={getFechaLocal()} // No permite fechas futuras
            />
          </div>
        </div>
        {loading ? (
          <div className="text-center text-secondary">Cargando...</div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : tests.length === 0 ? (
          <div className="alert alert-info text-center">
            No tienes resultados de evaluaciones en el rango seleccionado.
          </div>
        ) : (
          <div className="row g-4 justify-content-center">
            {tests.map((test) => (
              <div
                key={test.id + test.tipo}
                className="col-12 col-md-6 col-lg-4"
              >
                <div
                  className="card shadow h-100"
                  style={{
                    borderTop: `6px solid ${COLOR_ACCENT}`,
                    borderRadius: 18,
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5
                      className="card-title"
                      style={{ color: COLOR_ACCENT, fontWeight: "bold" }}
                    >
                      Evaluación {test.tipo}
                    </h5>
                    <p className="mb-2" style={{ color: COLOR_DARK }}>
                      <strong>Fecha:</strong>{" "}
                      {new Date(test.fecha).toLocaleDateString()}
                    </p>
                    {test.tipo === "ADOS-2" && (
                      <p className="mb-2" style={{ color: COLOR_DARK }}>
                        <strong>Módulo:</strong> {test.modulo} <br />
                      </p>
                    )}
                    <button
                      className="btn btn-success mt-2"
                      onClick={() => handleGenerarResultado(test)}
                    >
                      Generar Resultado
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5">
          <button
            className="btn btn-secondary"
            style={{ borderRadius: 20, fontWeight: "bold" }}
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
        </div>
        {reporteT && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte Módulo T</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteT(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  {console.log(reporteT)}
                  <ReporteModuleT datos={reporteT} />
                </div>
              </div>
            </div>
          </div>
        )}
        {reporteM1 && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte Módulo 1</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteM1(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ReporteModulo1 datos={reporteM1} />
                </div>
              </div>
            </div>
          </div>
        )}
        {reporteM2 && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte Módulo 2</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteM2(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ReporteModulo2 datos={reporteM2} />
                </div>
              </div>
            </div>
          </div>
        )}
        {reporteM3 && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte Módulo 3</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteM3(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ReporteModulo3 datos={reporteM3} />
                </div>
              </div>
            </div>
          </div>
        )}
        {reporteM4 && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte Módulo 4</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteM4(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ReporteModulo4 datos={reporteM4} />
                </div>
              </div>
            </div>
          </div>
        )}
        {reporteAdiR && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reporte ADI-R</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setReporteAdiR(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <ReportAdiR_paciente datos={reporteAdiR} />
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

export default Resultados;
