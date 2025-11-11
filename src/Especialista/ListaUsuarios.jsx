import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";

import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";

// Modal sencillo (sin dependencia extra)
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={(e) => {
        // cerrar si clic fuera del contenido
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded shadow"
        style={{ maxWidth: 900, width: "95%" }}
      >
        <div className="d-flex align-items-center justify-content-between border-bottom p-3">
          <h5 className="m-0">{title}</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

const ListaUsuarios = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [detalle, setDetalle] = useState(null); // { paciente:{}, usuario:{}, responsables_legales:[] }
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleErr, setDetalleErr] = useState("");

  const token = localStorage.getItem("token");

  // Cargar lista de pacientes (de AdminService.getPacientes: SELECT * FROM paciente)
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await axios.get(apiUrl("/api/admin/pacientes-lista"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPacientes(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.message || "Error al cargar pacientes");
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirDetalle = async (idPaciente) => {
    setShowModal(true);
    setDetalle(null);
    setDetalleErr("");
    setLoadingDetalle(true);

    try {
      const res = await axios.get(
        apiUrl(`/api/admin/pacientes/${idPaciente}/detalle`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDetalle(res.data);
    } catch (e) {
      setDetalleErr(
        e.response?.data?.message ||
          "No se pudo obtener el detalle del paciente"
      );
    } finally {
      setLoadingDetalle(false);
    }
  };

  return (
    <div className="container py-3">
      <Navbar />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Pacientes</h3>
      </div>

      {loading && <div className="alert alert-info">Cargando pacientes…</div>}
      {err && !loading && <div className="alert alert-danger">{err}</div>}

      {!loading && !err && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Paciente</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Fecha Nac.</th>
                <th>Sexo</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No hay pacientes registrados.
                  </td>
                </tr>
              ) : (
                pacientes.map((p) => (
                  <tr key={p.id_paciente}>
                    <td>
                      <strong>
                        {p.nombres} {p.apellidos}
                      </strong>
                    </td>
                    <td>{p.correo || "—"}</td>
                    <td>{p.telefono || "—"}</td>

                    <td>
                      {p.fecha_nacimiento
                        ? String(p.fecha_nacimiento).split("T")[0]
                        : "—"}
                    </td>
                    <td>{p.sexo || "—"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirDetalle(p.id_paciente)}
                      >
                        Ver representantes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Detalle de paciente y representantes"
      >
        {loadingDetalle && (
          <div className="alert alert-info m-0">Cargando detalle…</div>
        )}
        {detalleErr && !loadingDetalle && (
          <div className="alert alert-danger m-0">{detalleErr}</div>
        )}

        {!loadingDetalle && !detalleErr && detalle && (
          <>
            {/* Info del usuario */}
            <div className="mb-3">
              <h6 className="mb-2">Usuario</h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Nombre</div>
                    <div className="fw-semibold">
                      {detalle.usuario?.nombres} {detalle.usuario?.apellidos}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Correo</div>
                    <div className="fw-semibold">
                      {detalle.usuario?.correo || "—"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Teléfono</div>
                    <div className="fw-semibold">
                      {detalle.usuario?.telefono || "—"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Dirección</div>
                    <div className="fw-semibold">
                      {detalle.usuario?.direccion || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info del paciente */}
            <div className="mb-3">
              <h6 className="mb-2">Paciente</h6>
              <div className="row g-2">
                <div className="col-md-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">ID Paciente</div>
                    <div className="fw-semibold">
                      {detalle.paciente?.id_paciente}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Fecha Nac.</div>
                    <div className="fw-semibold">
                      {detalle.paciente?.fecha_nacimiento
                        ? String(detalle.paciente.fecha_nacimiento).split(
                            "T"
                          )[0]
                        : "—"}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small">Sexo</div>
                    <div className="fw-semibold">
                      {detalle.paciente?.sexo || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsables */}
            <div>
              <h6 className="mb-2">Responsables legales</h6>
              {Array.isArray(detalle.responsables_legales) &&
              detalle.responsables_legales.length > 0 ? (
                <div className="row g-3">
                  {detalle.responsables_legales.map((r) => (
                    <div className="col-md-6" key={r.id_responsable_legal}>
                      <div className="border rounded p-3 h-100">
                        <div className="fw-semibold">
                          {r.nombre} {r.apellido}
                        </div>
                        <div className="text-muted small">{r.parentesco}</div>
                        <hr />
                        <div className="small">
                          <div>
                            <span className="text-muted">Identificación: </span>
                            {r.num_identificacion || "—"}
                          </div>
                          <div>
                            <span className="text-muted">Teléfono: </span>
                            {r.telefono || "—"}
                          </div>
                          <div>
                            <span className="text-muted">Correo: </span>
                            {r.correo || "—"}
                          </div>
                          <div>
                            <span className="text-muted">Dirección: </span>
                            {r.direccion || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">Sin responsables registrados.</div>
              )}
            </div>
          </>
        )}
      </Modal>
      <Footer />
    </div>
  );
};

export default ListaUsuarios;
