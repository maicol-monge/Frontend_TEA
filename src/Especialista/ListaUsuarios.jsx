import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";

import Navbar from "../components/Navbar_espe";
import Footer from "../components/Footer";
import "./ListaUsuarios.css";

// Colores del sistema (coinciden con `NavbarAdmin`)
const COLOR_PRIMARY = "#457b9d";
const COLOR_ACCENT = "#f3859e";

// Modal sencillo (sin dependencia extra) — presentación mejorada
function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div
      className="lu-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lu-modal-title"
      onClick={(e) => {
        // cerrar si clic fuera del contenido
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lu-modal" style={{ maxWidth: 900 }}>
        <div className="lu-modal-header">
          <h5 id="lu-modal-title" className="m-0">
            {title}
          </h5>
          <button
            className="lu-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="lu-modal-body">{children}</div>
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

  // Filtros UI
  const [searchName, setSearchName] = useState("");
  const [filterSexo, setFilterSexo] = useState("");

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
    <div>
      <Navbar />

      <div className="lu-card mt-3 px-5">
        <div
          className="lu-card-header"
          style={{
            background: COLOR_PRIMARY,
            borderBottom: `4px solid ${COLOR_ACCENT}`,
          }}
        >
          <div>
            <h3 className="m-0">Pacientes</h3>
            <small className="text-white-50">
              Lista de pacientes registrados
            </small>
          </div>
        </div>
        <div className="lu-filters my-3 d-flex flex-wrap align-items-center gap-2">
          <div className="input-group w-50">
            <span className="input-group-text">🔎</span>
            <input
              type="search"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              aria-label="Buscar por nombre"
            />
          </div>

          <select
            className="form-select w-25 mx-3"
            value={filterSexo}
            onChange={(e) => setFilterSexo(e.target.value)}
            aria-label="Filtrar por sexo"
          >
            <option value="">Todos los sexos</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>

          <button
            className="btn btn-outline-secondary btn-sm"
            style={{ width: "200px" }}
            onClick={() => {
              setSearchName("");
              setFilterSexo("");
            }}
          >
            Limpiar
          </button>
        </div>

        <div className="lu-card-body">
          {loading && (
            <div className="alert alert-info">Cargando pacientes…</div>
          )}
          {err && !loading && <div className="alert alert-danger">{err}</div>}

          {!loading && !err && (
            <div className="table-responsive lu-table-scroll">
              <table className="table align-middle table-hover mb-0">
                <thead>
                  <tr className="table-light">
                    <th>Paciente</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Fecha Nac.</th>
                    <th>Sexo</th>
                    <th style={{ width: 180 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // aplicar filtros en cliente: buscar por nombre y filtrar por sexo
                    const q = String(searchName || "")
                      .trim()
                      .toLowerCase();
                    const filtered = (pacientes || []).filter((p) => {
                      // nombre completo
                      const nombre = `${p.nombres || ""} ${
                        p.apellidos || ""
                      }`.toLowerCase();
                      const matchesName = q === "" || nombre.includes(q);
                      // Normalizar sexo: considerar que la API puede usar 'M'/'F' o 'Masculino'/'Femenino'
                      const sexoRaw = String(p.sexo || "").trim();
                      const sexoFirst = sexoRaw.charAt(0).toLowerCase(); // 'm' o 'f' o 'o'
                      const matchesSexo =
                        !filterSexo || sexoFirst === filterSexo.toLowerCase();
                      return matchesName && matchesSexo;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-muted lu-empty"
                          >
                            No hay pacientes registrados.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((p) => (
                      <tr key={p.id_paciente}>
                        <td>
                          <div className="fw-semibold">
                            {p.nombres} {p.apellidos}
                          </div>
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
                            className="btn btn-sm lu-accent"
                            onClick={() => abrirDetalle(p.id_paciente)}
                          >
                            Ver representantes
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
