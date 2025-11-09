import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudAreas = () => {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({ area: "" });
  const [editId, setEditId] = useState(null);
  const [filterArea, setFilterArea] = useState("");
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  const fetchAreas = () => {
    axios
      .get(apiUrl("/api/admin/areas"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAreas(res.data));
  };

  useEffect(fetchAreas, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      axios
        .put(apiUrl(`/api/admin/areas/${editId}`), form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setEditId(null);
          setForm({ area: "" });
          setShowModal(false);
          fetchAreas();
        });
    } else {
      axios
        .post(apiUrl("/api/admin/areas"), form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setForm({ area: "" });
          setShowModal(false);
          fetchAreas();
        });
    }
  };

  // areas filtradas por el input de búsqueda
  const filteredAreas = areas.filter(
    (a) =>
      !filterArea || a.area.toLowerCase().includes(filterArea.toLowerCase())
  );

  const handleEdit = (area) => {
    setEditId(area.id_area);
    setForm(area);
    setShowModal(true);
  };

  const handleDelete = (id) =>
    window.confirm("¿Eliminar área?") &&
    axios
      .delete(apiUrl(`/api/admin/areas/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(fetchAreas);

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Áreas</h2>

        {/* botón para abrir modal de agregar */}
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm({ area: "" });
              setEditId(null);
              setShowModal(true);
            }}
          >
            + Agregar área
          </button>
        </div>

        {/* filtros */}
        <div className="card mb-3">
          <div className="card-header">Buscar / Filtrar áreas</div>
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-8">
                <label className="form-label small">Buscar por área</label>
                <input
                  className="form-control"
                  placeholder="Escribe nombre de área..."
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-4 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFilterArea("")}
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
              className="modal-dialog modal-md modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? "Editar área" : "Agregar área"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Área</label>
                      <input
                        className="form-control"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          setEditId(null);
                          setForm({ area: "" });
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-success">
                        {editId ? "Actualizar" : "Crear"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-auto" style={{ maxHeight: "420px" }}>
          <table className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr>
                <th
                  className="position-sticky top-0 bg-primary"
                  style={{ zIndex: 2 }}
                >
                  ID
                </th>
                <th
                  className="position-sticky top-0 bg-primary"
                  style={{ zIndex: 2 }}
                >
                  Área
                </th>
                <th
                  className="position-sticky top-0 bg-primary"
                  style={{ zIndex: 2 }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((a) => (
                <tr key={a.id_area}>
                  <td>{a.id_area}</td>
                  <td>{a.area}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(a)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(a.id_area)}
                    >
                      Eliminar
                    </button>
                  </td>
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

export default CrudAreas;
