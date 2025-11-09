import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/apiConfig";
import NavbarAdmin from "../components/NavbarAdmin";
import Footer from "../components/Footer";

const CrudEspecialistas = () => {
  const [especialistas, setEspecialistas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({ id_usuario: "", especialidad: "" });
  const [editId, setEditId] = useState(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  // filtros para la tabla
  const [filterName, setFilterName] = useState("");
  const [filterEspecialidad, setFilterEspecialidad] = useState("");
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");

  // Cargar especialistas y usuarios
  const fetchData = async () => {
    try {
      const [espRes, userRes] = await Promise.all([
        axios.get(apiUrl("/api/admin/especialistas"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(apiUrl("/api/admin/usuarios"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Filtrar solo los usuarios especialistas (privilegio = 0)
      const especialistasUsuarios = userRes.data.filter(
        (u) => u.privilegio === 0
      );

      setEspecialistas(espRes.data);
      setUsuarios(especialistasUsuarios);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(apiUrl(`/api/admin/especialistas/${editId}`), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Especialista actualizado correctamente");
      } else {
        await axios.post(apiUrl("/api/admin/especialistas"), form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Especialista creado correctamente");
      }
      setForm({ id_usuario: "", especialidad: "" });
      setBusqueda("");
      setEditId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Error al guardar especialista:", err);
      alert("Error al guardar especialista");
    }
  };

  const handleEdit = (especialista) => {
    setEditId(especialista.id_especialista);
    setForm({
      id_usuario: especialista.id_usuario,
      especialidad: especialista.especialidad,
    });

    const usuario = usuarios.find(
      (u) => u.id_usuario === especialista.id_usuario
    );
    if (usuario)
      setBusqueda(
        `${usuario.nombres} ${usuario.apellidos} (${usuario.correo})`
      );
    // abrir modal en modo edición
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar especialista?")) {
      try {
        await axios.delete(apiUrl(`/api/admin/especialistas/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchData();
      } catch (err) {
        console.error("Error al eliminar especialista:", err);
      }
    }
  };

  // Buscar usuario por nombre o correo
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener nombre del usuario para mostrar en tabla
  const getNombreUsuario = (idUsuario) => {
    const user = usuarios.find((u) => u.id_usuario === idUsuario);
    return user ? `${user.nombres} ${user.apellidos}` : `Usuario ${idUsuario}`;
  };

  // lista de especialidades únicas para el selector de filtro
  const uniqueEspecialidades = Array.from(
    new Set(especialistas.map((s) => s.especialidad).filter(Boolean))
  );

  // aplicar filtros: nombre del usuario y especialidad
  const filteredEspecialistas = especialistas.filter((e) => {
    const nombre = getNombreUsuario(e.id_usuario).toLowerCase();
    const espec = (e.especialidad || "").toLowerCase();

    const nameMatch = filterName
      ? nombre.includes(filterName.toLowerCase())
      : true;
    const especMatch = filterEspecialidad
      ? espec === filterEspecialidad.toLowerCase()
      : true;

    return nameMatch && especMatch;
  });

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#a8dadc" }}
    >
      <NavbarAdmin />
      <div className="container py-4 flex-grow-1">
        <h2 className="mb-4">Especialistas</h2>

        {/* Botón para abrir modal de agregar */}
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-primary"
            onClick={() => {
              // abrir modal en modo creación
              setForm({ id_usuario: "", especialidad: "" });
              setBusqueda("");
              setEditId(null);
              setShowModal(true);
            }}
          >
            + Agregar especialista
          </button>
        </div>

        {/* ======= FILTROS ======= */}
        <div className="card mb-3">
          <div className="card-header">Buscar / Filtrar especialistas</div>
          <div className="card-body">
            <div className="row mb-3 g-2 align-items-end">
              <div className="col-12 col-md-6">
                <label className="form-label small">Buscar por nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre del usuario..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>

              <div className="col-8 col-md-4">
                <label className="form-label small">
                  Filtrar por especialidad
                </label>
                <select
                  className="form-control"
                  value={filterEspecialidad}
                  onChange={(e) => setFilterEspecialidad(e.target.value)}
                >
                  <option value="">-- Todas --</option>
                  {uniqueEspecialidades.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-4 col-md-2 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFilterName("");
                    setFilterEspecialidad("");
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======= MODAL (Agregar / Editar) ======= */}
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
                  <h5 className="modal-title">
                    {editId ? "Editar especialista" : "Agregar especialista"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <form className="row g-3" onSubmit={handleSubmit}>
                    <div className="col-12 position-relative">
                      <label className="form-label small">
                        Usuario especialista
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar y seleccionar usuario..."
                        value={busqueda}
                        onChange={(e) => {
                          setBusqueda(e.target.value);
                          setMostrarOpciones(true);
                        }}
                        onFocus={() => setMostrarOpciones(true)}
                        onBlur={() =>
                          setTimeout(() => setMostrarOpciones(false), 200)
                        }
                        required
                      />
                      {mostrarOpciones && usuariosFiltrados.length > 0 && (
                        <ul
                          className="list-group position-absolute w-100 shadow-sm"
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            zIndex: 1100,
                          }}
                        >
                          {usuariosFiltrados.map((u) => (
                            <li
                              key={u.id_usuario}
                              className="list-group-item list-group-item-action"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setForm({ ...form, id_usuario: u.id_usuario });
                                setBusqueda(
                                  `${u.nombres} ${u.apellidos} (${u.correo})`
                                );
                                setMostrarOpciones(false);
                              }}
                            >
                              <strong>
                                {u.nombres} {u.apellidos}
                              </strong>
                              <div className="text-muted small">{u.correo}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label small">Especialidad</label>
                      <input
                        className="form-control"
                        name="especialidad"
                        placeholder="Ej. Pediatría"
                        value={form.especialidad}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditId(null);
                          setForm({ id_usuario: "", especialidad: "" });
                          setBusqueda("");
                        }}
                      >
                        Cancelar
                      </button>
                      <button className="btn btn-success" type="submit">
                        {editId ? "Actualizar" : "Crear"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======= TABLA ======= */}
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
                  Nombre del Usuario
                </th>
                <th
                  className="position-sticky top-0 bg-primary"
                  style={{ zIndex: 2 }}
                >
                  Especialidad
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
              {filteredEspecialistas.map((e) => (
                <tr key={e.id_especialista}>
                  <td>{e.id_especialista}</td>
                  <td>{getNombreUsuario(e.id_usuario)}</td>
                  <td>{e.especialidad}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(e)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(e.id_especialista)}
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

export default CrudEspecialistas;
