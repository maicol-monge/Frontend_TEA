import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudPreguntas = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [form, setForm] = useState({ pregunta: "", id_area: "" });
  const [editId, setEditId] = useState(null);
  const [filterPregunta, setFilterPregunta] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [areas, setAreas] = useState([]);
  const [areaDisplay, setAreaDisplay] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterAreaDisplay, setFilterAreaDisplay] = useState("");

  const token = localStorage.getItem("token");

  const fetchPreguntas = () => {
    axios
      .get(apiUrl("/api/admin/preguntas"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPreguntas(res.data));
  };

  const fetchAreas = () => {
    axios
      .get(apiUrl("/api/admin/areas"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAreas(res.data));
  };

  useEffect(() => {
    fetchPreguntas();
    fetchAreas();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Solo permitir actualización: creación deshabilitada en esta vista
    if (!editId) {
      setShowModal(false);
      return;
    }
    axios
      .put(apiUrl(`/api/admin/preguntas/${editId}`), form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setEditId(null);
        setForm({ pregunta: "", id_area: "" });
        setAreaDisplay("");
        setShowModal(false);
        fetchPreguntas();
        Swal.fire({
          icon: "success",
          title: "Pregunta actualizada",
          timer: 1400,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: err?.response?.data?.message || "Ocurrió un error",
        });
      });
  };

  // const handleEdit = (pregunta) => {
  //   setEditId(pregunta.id_pregunta);
  //   setForm(pregunta);
  //   // set display value for area (if areas already loaded)
  //   const matchArea = areas.find((a) => a.id_area === pregunta.id_area);
  //   if (matchArea) setAreaDisplay(`${matchArea.id_area} - ${matchArea.area}`);
  //   else setAreaDisplay("");
  //   setShowModal(true);
  // };

  // Eliminado: no se permite eliminar preguntas desde esta vista

  const displayForArea = (a) => `${a.id_area} - ${a.area}`;

  const handleAreaDisplayChange = (e) => {
    const value = e.target.value;
    setAreaDisplay(value);
    const match = areas.find((a) => displayForArea(a) === value);
    if (match) setForm((prev) => ({ ...prev, id_area: match.id_area }));
    else setForm((prev) => ({ ...prev, id_area: "" }));
  };

  const getAreaName = (id) => {
    const a = areas.find((x) => x.id_area === id);
    return a ? a.area : String(id); // siempre string
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Preguntas ADI</h2>

        {/* (Agregar deshabilitado) Solo edición permitida */}

        {/* filtros */}
        <div className="card mb-3">
          <div className="card-header">Buscar / Filtrar preguntas</div>
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-5">
                <label className="form-label small">Buscar por pregunta</label>
                <input
                  className="form-control"
                  placeholder="Texto de la pregunta..."
                  value={filterPregunta}
                  onChange={(e) => setFilterPregunta(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-5">
                <label className="form-label small">Filtrar por área</label>
                <input
                  list="areas-filter-list"
                  className="form-control"
                  placeholder="Escribe o selecciona un área..."
                  value={filterAreaDisplay}
                  onChange={(e) => {
                    setFilterAreaDisplay(e.target.value);
                    // update filterArea to the raw text (will match area names)
                    setFilterArea(e.target.value);
                  }}
                />
                <datalist id="areas-filter-list">
                  {areas.map((a) => (
                    <option key={a.id_area} value={a.area} />
                  ))}
                </datalist>
              </div>

              <div className="col-12 col-md-2 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilterPregunta("");
                    setFilterArea("");
                    setFilterAreaDisplay("");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* modal para crear/editar */}
        {showModal && (
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Editar pregunta</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setShowModal(false);
                      setEditId(null);
                      setForm({ pregunta: "", id_area: "" });
                      setAreaDisplay("");
                    }}
                  />
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Pregunta</label>
                      <input
                        className="form-control"
                        name="pregunta"
                        value={form.pregunta}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Área</label>
                      {/* Área solo lectura: no editable desde esta vista */}
                      <input
                        className="form-control"
                        value={areaDisplay}
                        readOnly
                        disabled
                      />
                      <small className="text-muted">
                        El área no se puede cambiar desde aquí.
                      </small>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          setEditId(null);
                          setForm({ pregunta: "", id_area: "" });
                          setAreaDisplay("");
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-success">
                        Actualizar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-auto" style={{ maxHeight: "420px" }}>
          <table className="table table-bordered table-hover table-sm">
            <thead>
              <tr>
                <th
                  className="position-sticky top-0"
                  style={{
                    zIndex: 2,
                    position: "sticky",
                    top: 0,
                    background: "#cfe8e9",
                  }}
                >
                  ID
                </th>
                <th
                  className="position-sticky top-0"
                  style={{ zIndex: 2, background: "#cfe8e9" }}
                >
                  Pregunta
                </th>
                <th
                  className="position-sticky top-0"
                  style={{ zIndex: 2, background: "#cfe8e9" }}
                >
                  Área
                </th>
                {/* <th
                  className="position-sticky top-0"
                  style={{ zIndex: 2, background: "#cfe8e9" }}
                >
                  Acciones
                </th> */}
              </tr>
            </thead>
            <tbody>
              {preguntas
                .filter((p) => {
                  const preguntaMatch =
                    !filterPregunta ||
                    (p.pregunta || "")
                      .toLowerCase()
                      .includes(filterPregunta.toLowerCase());

                  const rawAreaName = getAreaName(p.id_area);
                  const areaName = (rawAreaName || "").toString().toLowerCase();

                  const areaMatch =
                    !filterArea || areaName.includes((filterArea || "").toLowerCase());

                  return preguntaMatch && areaMatch;
                })
                .map((p) => (
                  <tr key={p.id_pregunta}>
                    <td>{p.id_pregunta}</td>
                    <td>{p.pregunta}</td>
                    <td>{getAreaName(p.id_area)}</td>
                    {/* <td className="align-middle">
                      <div
                        className="d-inline-flex"
                        role="group"
                        aria-label="acciones"
                        style={{ gap: "6px" }}
                      >
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleEdit(p)}
                          title="Editar"
                        >
                          Editar
                        </button>
                      </div>
                    </td> */}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CrudPreguntas;
