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

        {/* ======= FORMULARIO ======= */}
        <form
          className="row g-2 mb-4 position-relative"
          onSubmit={handleSubmit}
        >
          {/* Buscador de usuario especialista */}
          <div className="col-12 col-md-6 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuario especialista..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setMostrarOpciones(true);
              }}
              onFocus={() => setMostrarOpciones(true)}
              onBlur={() => setTimeout(() => setMostrarOpciones(false), 200)}
              required
            />
            {mostrarOpciones && usuariosFiltrados.length > 0 && (
              <ul
                className="list-group position-absolute w-100"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                {usuariosFiltrados.map((u) => (
                  <li
                    key={u.id_usuario}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setForm({ ...form, id_usuario: u.id_usuario });
                      setBusqueda(`${u.nombres} ${u.apellidos} (${u.correo})`);
                      setMostrarOpciones(false);
                    }}
                  >
                    {u.nombres} {u.apellidos} — {u.correo}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-12 col-md-4">
            <input
              className="form-control"
              name="especialidad"
              placeholder="Especialidad"
              value={form.especialidad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-2 d-flex gap-2">
            <button className="btn btn-success w-100" type="submit">
              {editId ? "Actualizar" : "Crear"}
            </button>
            {editId && (
              <button
                className="btn btn-secondary w-100"
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({ id_usuario: "", especialidad: "" });
                  setBusqueda("");
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ======= FILTROS ======= */}
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
            <label className="form-label small">Filtrar por especialidad</label>
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

        {/* ======= TABLA ======= */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre del Usuario</th>
                <th>Especialidad</th>
                <th>Acciones</th>
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
